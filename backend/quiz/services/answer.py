import re

from quiz.constants import MINIMUM_REWARD, REWARD_BY_PLACE


def levenshtein(s1, s2):
    if len(s1) < len(s2):
        return levenshtein(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def normalize(text):
    text = text.lower().strip()
    text = text.split("-", 1)[0]
    text = text.split("(", 1)[0]
    text = text.split("/", 1)[0]
    text = re.sub(r"[^a-z0-9 ]", "", text)
    return text


def check_answer(song, answer):
    if not song or not answer:
        return False, False

    normalized_answer = normalize(answer)
    normalized_title = normalize(song.title)
    normalized_artist = normalize(song.artist)

    if (
        min(
            levenshtein(f"{normalized_title} {normalized_artist}", normalized_answer),
            levenshtein(f"{normalized_artist} {normalized_title}", normalized_answer),
        )
        < 2
    ):
        return True, True
    return (
        levenshtein(normalized_title, normalized_answer) <= 1,
        levenshtein(normalized_artist, normalized_answer) <= 1,
    )


def compute_score(username, is_partial_guess):
    def update_score(room_data):
        if username in room_data["correct_guesses"]:
            raise ValueError("User already guessed")
        if username in room_data["partial_guesses"] and not is_partial_guess:
            raise ValueError("User already partially guessed")

        reward = MINIMUM_REWARD if is_partial_guess else MINIMUM_REWARD * 2
        if not is_partial_guess or username in room_data["partial_guesses"]:
            if username in room_data["partial_guesses"]:
                room_data["partial_guesses"].remove(username)
            room_data["correct_guesses"].append(username)
            reward += REWARD_BY_PLACE.get(len(room_data["correct_guesses"]), 0)
        else:
            room_data["partial_guesses"].append(username)

        room_data["scores"][username] += reward

        return room_data

    return update_score

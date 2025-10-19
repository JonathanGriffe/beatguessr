from datetime import timedelta
import re
from django.utils import timezone

from quiz.constants import RESPONSE_TIMER

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
    text = text.split('-', 1)[0]
    text = text.split('(', 1)[0]
    text = re.sub(r'[^a-z0-9 ]', '', text)
    return text
    
    
def check_answer(question, answer):
    if not question or not answer:
        return False, False
    if timezone.now() - question.created_at > timedelta(seconds=RESPONSE_TIMER):
        return False, False
    
    normalized_answer = normalize(answer)
    normalized_title = normalize(question.song.title)
    normalized_artist = normalize(question.song.artist)

    if min(
        levenshtein(f"{normalized_title} {normalized_artist}", normalized_answer),
        levenshtein(f"{normalized_artist} {normalized_title}", normalized_answer)
    ) < 2:
        return True, True
    return (
        levenshtein(normalized_title, normalized_answer) <= 1,
        levenshtein(normalized_artist, normalized_answer) <= 1
    )
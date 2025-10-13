RESPONSE_TIMER = 20  # seconds to answer the question


MIN_HALF_LIFE = 0.1
WEIGHTS = [
    0.2, # wins
    -0.2, # losses
    0.4, # win_streak
    -0.6, # loss_streak
    0.4 # max_win_streak
]
PRACTICE_THRESHOLD = 0.4
LEARNED_THRESHOLD = 0.7
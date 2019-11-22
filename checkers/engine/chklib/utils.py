from random import randint, randrange
from string import ascii_uppercase


def generate_flag():
    return "".join(ascii_uppercase[randint(0, len(ascii_uppercase) - 1)] for _ in range(31)) + "="


def generate_random_text():
    return "".join(ascii_uppercase[randint(0, len(ascii_uppercase) - 1)] for _ in range(randrange(3, 32)))

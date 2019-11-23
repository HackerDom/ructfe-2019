from random import randint, choice, random
from string import ascii_letters, digits

COLOR_ALPHABET = "ABCDEF" + digits

with open("generators/names") as names_file:
    NAMES = names_file.read().split('\n')

with open("generators/user-agents") as user_agents_file:
    USER_AGENTS = user_agents_file.read().split('\n')

with open("generators/food") as food_file:
    FOOD = food_file.read().split('\n')


def generate_username():
    return choice(NAMES) + "".join(choice(digits) for _ in range(randint(18, 25)))


def generate_password():
    password_len = randint(17, 31)
    return "".join(choice(ascii_letters + digits) for _ in range(password_len))


def generate_user_agent():
    return choice(USER_AGENTS)


def generate_class_name():
    return ''.join(choice(ascii_letters) for _ in range(20))


def generate_size():
    return randint(1, 40)


def generate_speed():
    return random()


def generate_color():
    return ''.join(choice(COLOR_ALPHABET) for _ in range(6))


def generate_additional_fields():
    result = {}
    for _ in range(3):
        if random() > 0.6:
            result[''.join(choice(ascii_letters) for _ in range(10))] = choice(FOOD)
    return result


def generate_headers():
    return {'User-Agent': generate_user_agent()}

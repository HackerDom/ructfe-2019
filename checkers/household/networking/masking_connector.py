from random import choice

with open("networking/user-agents") as user_agents:
    AGENTS = [x.strip() for x in user_agents.readlines()]


def get_agent():
    return choice(AGENTS)
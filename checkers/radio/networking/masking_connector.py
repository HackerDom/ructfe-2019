from random import choice


NETWORKING_AGENT_FILENAME = "networking/user-agents"
agents = None


def _get_agents():
    global agents
    if agents is None:
        with open(NETWORKING_AGENT_FILENAME) as user_agents:
            agents = [x.strip() for x in user_agents.readlines()]
    return agents


def get_agent():
    return choice(_get_agents())

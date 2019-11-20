from entities.user import User


def users_are_equals(first: User, second: dict) -> bool:
    try:
        if str(first.username) != str(second['username']):
            return False
        if str(first.first_name) != str(second['firstName']):
            return False
        if str(first.last_name) != str(second['lastName']):
            return False
        if str(first.biography) != str(second['biography']):
            return False
        return True
    except:
        return False


def message_in_messages(messages: [], message_id: str, message_content: str) -> bool:
    for m in messages:
        if str(m['id']) == str(message_id):
            return m['text'] == message_content
    return False


def chat_in_chats(chats: [], chat_id: str, chat_name: str = None) -> bool:
    for c in chats:
        if str(c['id']) == str(chat_id):
            return c['name'] == chat_name or not chat_name
    return False

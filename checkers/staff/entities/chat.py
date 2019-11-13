class Chat:
    def __init__(self, chat_id, admin, invite_link):
        self.chat_id = chat_id
        self.admin = admin
        self.invite_link = invite_link
        self.users = [admin]
        self.messages = []
        self.hidden_messages_ids = []

class Message:
    def __init__(self, id, content, owner, is_deleted=False):
        self.id = id
        self.content = content
        self.owner = owner
        self.is_deleted = is_deleted

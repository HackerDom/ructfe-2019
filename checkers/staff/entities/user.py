class User:
    def __init__(self):
        username = f'user_{random.randint(0, 10000000)}'
        first_name = f'firstName_{random.randint(0, 10000000)}'
        last_name = f'lastName_{random.randint(0, 10000000)}'
        self.username = username
        self.password = '123'
        self.biography = 'awesome bio'
        self.last_name = last_name
        self.first_name = first_name
        self.user_id = None
        self.is_admin = False
        self.chat_id = None

    def get_register_data(self):
        return {
            'username': self.username,
            'password': self.password,
            'biography': self.biography,
            'lastName': self.last_name,
            'firstName': self.first_name
        }

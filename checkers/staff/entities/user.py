from chklib import utils


class User:
    def __init__(self):
        self.username = utils.generate_random_text()
        self.password = utils.generate_random_text()
        self.biography = utils.generate_random_text()
        self.last_name = utils.generate_random_text()
        self.first_name = utils.generate_random_text()
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

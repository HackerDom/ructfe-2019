class InvalidResponseException(Exception):
    def __init__(self, message):
        self.message = f'Request was not success: {message}'
        super()

import requests

from Api.UsersApi import UsersApi
from Api.ChatsApi import ChatsApi
import random
import time

with requests.session() as session:
    users_api = UsersApi('http://localhost:3000')
    chats_api = ChatsApi('http://localhost:3000')
    username = f'user_{random.randint(0, 10000000)}'
    first_name = f'firstName_{random.randint(0, 10000000)}'
    last_name = f'lastName_{random.randint(0, 10000000)}'
    user = {
        'username': username,
        'password': '123',
        'biography': 'awesome bio',
        'lastName': last_name,
        'firstName': first_name
    }
    users_api.register(user)
    users_api.login(session, 'user1', '123')
    user_search = users_api.search(first_name, last_name)
    print(user_search)
    users_api.edit_user(session, {"biography": "I am from Russia"})
    time.sleep(3)
    user_1 = users_api.get_user(1)
    user_search = users_api.search(first_name, last_name)
    print(user_search)
    print(user_1)

    resp = chats_api.create(session, 'lol')
    print(resp)

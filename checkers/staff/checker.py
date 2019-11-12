import requests

from Api.UsersApi import UsersApi
from Api.ChatsApi import ChatsApi
import random
import time


def create_user():
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

    return user

with requests.session() as session:
    users_api = UsersApi('http://localhost:3000')
    chats_api = ChatsApi('http://localhost:3000')
    user1 = create_user()
    first_name_1 = user1['firstName']
    last_name_1 = user1['lastName']
    username_1 = user1['username']

    users_api.register(user1)
    users_api.login(session, username_1, '123')
    user_search = users_api.search(first_name_1, last_name_1)
    print(user_search)
    users_api.edit_user(session, {"biography": "I am from Russia"})
    user_1 = users_api.get_user(1)
    user_search = users_api.search(first_name_1, last_name_1)
    print(user_search)
    print(user_1)

    chat_id = chats_api.create(session, 'lol')['chatId']
    chats_api.send_message(session, chat_id, 'kek')
    chats_api.send_message(session, chat_id, 'kek2')
    chats_api.send_message(session, chat_id, 'kek3')
    print(chats_api.read_messages(session, chat_id))
    inv_link = chats_api.get_invite_link(session, chat_id)

    user2 = create_user()
    first_name_2 = user1['firstName']
    last_name_2 = user1['lastName']
    username_2 = user1['username']
    users_api.login(session, username_2, '123')
    chats_api.join(session, chat_id, inv_link)
    chats_api.send_message(session, chat_id, 'kek')
    chats_api.send_message(session, chat_id, 'kek2')
    chats_api.send_message(session, chat_id, 'kek3')

    print(chats_api.read_messages(session, chat_id))

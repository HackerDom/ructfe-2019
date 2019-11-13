import random
import asyncio

from api import Api
from entities.chat import Chat
from entities.user import User
from entities.message import Message
from utils.async_helpers import arange

HOSTNAME = 'http://localhost:3000'


def create_user():
    username = f'user_{random.randint(0, 10000000)}'
    first_name = f'firstName_{random.randint(0, 10000000)}'
    last_name = f'lastName_{random.randint(0, 10000000)}'
    return {
        'username': username,
        'password': '123',
        'biography': 'awesome bio',
        'lastName': last_name,
        'firstName': first_name
    }


users_collection = []
chats_collection = []


async def register_user():
    async with Api(HOSTNAME) as api:
        user = User()
        await api.register(user.get_register_data())
        resp = await api.login(user.username, user.password)
        user_id = resp['userId']
        user.user_id = user_id
        users_collection.append(user)


async def create_chat():
    chat_name = 'Chat name'
    async with Api(HOSTNAME) as api:
        admin = random.choice(list(filter(lambda user: not user.is_admin, users_collection)))
        await api.login(admin.username, admin.password)
        chat_resp = await api.create(chat_name)
        chat_id = chat_resp['chatId']
        inv_link_resp = await api.get_invite_link(chat_id)
        inv_link = inv_link_resp['inviteLink']
        admin.is_admin, admin.chat_id = True, chat_id
        chats_collection.append(Chat(chat_id, admin, inv_link))


async def join_chat():
    chat = random.choice(chats_collection)
    user = random.choice(list(filter(lambda user: user not in chat.users, users_collection)))
    async with Api(HOSTNAME) as api:
        await api.login(user.username, user.password)
        await api.join(chat.chat_id, chat.invite_link)
        chat.users.append(user)


async def put_flag_in_messages():
    message_content = 'Hi'
    chat = random.choice(chats_collection)
    user = random.choice(chat.users)
    async with Api(HOSTNAME) as api:
        await api.login(user.username, user.password)
        message_id_resp = await api.send_message(chat.chat_id, message_content)
        message_id = message_id_resp['messageId']
        chat.messages.append(Message(message_id, message_content, user))


async def put_flag_in_deleted_messages():
    message_content = 'Hi'
    chat = random.choice(chats_collection)
    user = random.choice(chat.users)
    async with Api(HOSTNAME) as api:
        await api.login(user.username, user.password)
        message_id_resp = await api.send_message(chat.chat_id, message_content)
        message_id = message_id_resp['messageId']
        await api.delete_message(chat.chat_id, message_content)
        chat.messages.append(Message(message_id, message_content, user))


async def reed_all_messages():
    for chat in chats_collection:
        async with Api(HOSTNAME) as api:
            await api.login(chat.admin.username, chat.admin.password)
            resp = await api.read_messages(chat.chat_id)
            print(resp)


async def main():
    async for _ in arange(50):
        await register_user()
    async for _ in arange(30):
        await create_chat()
    async for _ in arange(100):
        await join_chat()
    async for _ in arange(200):
        await put_flag_in_messages()
    async for _ in arange(50):
        await put_flag_in_messages()
    await reed_all_messages()


if __name__ == '__main__':
    asyncio.run(main())

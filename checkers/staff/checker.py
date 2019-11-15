import random
import asyncio

from api import Api
from entities.chat import Chat
from entities.user import User
from entities.message import Message
from utils.async_helpers import arange

from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest, utils

HOSTNAME = 'http://localhost:3000'
checker = Checker()


def create_user():
    return {
        'username': utils.generate_random_text(),
        'password': utils.generate_random_text(),
        'biography': utils.generate_flag(),
        'lastName': utils.generate_random_text(),
        'firstName': utils.generate_random_text()
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
        return user


async def create_chat():
    chat_name = 'Chat name'
    async with Api(HOSTNAME) as api:
        admin = random.choice(list(filter(lambda u: not u.is_admin, users_collection)))
        await api.login(admin.username, admin.password)
        chat_resp = await api.create(chat_name)
        chat_id = chat_resp['chatId']
        inv_link_resp = await api.get_invite_link(chat_id)
        inv_link = inv_link_resp['inviteLink']
        admin.is_admin, admin.chat_id = True, chat_id
        chats_collection.append(Chat(chat_id, admin, inv_link))


async def join_chat():
    chat = random.choice(chats_collection)
    user = random.choice(list(filter(lambda u: u not in chat.users, users_collection)))
    async with Api(HOSTNAME) as api:
        await api.login(user.username, user.password)
        await api.join(chat.chat_id, chat.invite_link)
        chat.users.append(user)


async def send_flag_in_message():
    message_content = 'Hi'
    chat = random.choice(chats_collection)
    user = random.choice(chat.users)
    async with Api(HOSTNAME) as api:
        await api.login(user.username, user.password)
        message_id_resp = await api.send_message(chat.chat_id, message_content)
        message_id = message_id_resp['messageId']
        chat.messages.append(Message(message_id, message_content, user))


async def send_and_delete_message():
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


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_in_messages(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        await api.register(user.get_register_data())
        login_resp = await api.login(user.username, user.password)
        user_id = login_resp['userId']
        user.user_id = user_id

        chat_name = utils.generate_random_text()
        chat_resp = await api.create(chat_name)
        chat_id = chat_resp['chatId']
        inv_link_resp = await api.get_invite_link(chat_id)
        inv_link = inv_link_resp['inviteLink']
        chat = Chat(chat_id, user, inv_link)

        message_id_resp = await api.send_message(chat.chat_id, request.flag)
        message_id = message_id_resp['messageId']

        return Verdict.OK(f'{chat_id}:{user.username}:{user.password}:{message_id}:{False}')


@checker.define_put(vuln_num=2, vuln_rate=2)
async def put_flag_in_deleted_messages(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        await api.register(user.get_register_data())
        login_resp = await api.login(user.username, user.password)
        user_id = login_resp['userId']
        user.user_id = user_id

        chat_name = utils.generate_random_text()
        chat_resp = await api.create(chat_name)
        chat_id = chat_resp['chatId']
        inv_link_resp = await api.get_invite_link(chat_id)
        inv_link = inv_link_resp['inviteLink']
        chat = Chat(chat_id, user, inv_link)

        message_id_resp = await api.send_message(chat.chat_id, request.flag)
        message_id = message_id_resp['messageId']
        await api.delete_message(message_id)

        return Verdict.OK(f'{chat_id}:{user.username}:{user.password}:{message_id}:{True}')


@checker.define_put(vuln_num=3, vuln_rate=2)
async def put_flag_in_bio(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        await api.register(user.get_register_data())
        login_resp = await api.login(user.username, user.password)
        user_id = login_resp['userId']
        user.user_id = user_id

        await api.edit_user({'biography': request.flag})

        return Verdict.OK(f'{user.username}:{user.password}')


@checker.define_get(vuln_num=3)
async def get_flag_from_bio(request: GetRequest) -> Verdict:
    async with Api(request.hostname) as api:
        username, password = request.flag_id.split(':')
        login_resp = await api.login(username, password)
        user_id = login_resp['userId']
        user = await api.get_user(user_id)
        if user['biography'] != request.flag:
            return Verdict.CORRUPT('Invalid flag',
                                   f'{request.flag}, user id: {user_id},'
                                   f' username:{username}, password:{password}')

        return Verdict.OK()


@checker.define_get(vuln_num=1)
@checker.define_get(vuln_num=2)
async def get_flag_from_messages(request: GetRequest) -> Verdict:
    chat_id, username, password, message_id, is_deleted = request.flag_id.split(':')
    is_deleted = is_deleted == 'True'
    async with Api(request.hostname) as api:
        resp = await api.login(username, password)
        # if not resp['success']:
        #     return Verdict.CORRUPT('Could not login', f'username:{username}, password:{password}')
        user_id = resp['userId']
        resp = await api.read_messages(chat_id)
        # if not resp['success']:
        #     return Verdict.CORRUPT('Could not read messages',
        #                            f'message id: {message_id}, chat id: {chat_id}, '
        #                            f'username:{username}, password:{password}')
        messages = resp['messages']
        message = list(filter(lambda m: int(m['id']) == int(message_id), messages))
        if len(message) != 1:
            return Verdict.CORRUPT(f'Invalid messages count', f'with id: {message_id}')
        message = message[0]
        if message['text'] != request.flag:
            return Verdict.CORRUPT('Invalid flag',
                                   f'{request.flag}, chat id: {chat_id},'
                                   f' username:{username}, password:{password}')
        if not is_deleted and 'isDeleted' not in message:
            return Verdict.OK()
        if is_deleted != message['isDeleted'] or int(user_id) != int(message['ownerId']):
            return Verdict.CORRUPT('Invalid message meta',
                                   f'message id: {message_id}, chat id: {chat_id},'
                                   f' username:{username}, password:{password}')

        return Verdict.OK()


async def main():
    flags = []
    resps = []
    count = 10
    print(0)
    async for e in arange(count):
        flag = utils.generate_flag()
        flag_id = await put_flag_in_messages(PutRequest('', flag, 1, 'http://localhost:3000'))
        flags.append((flag_id, 1, flag))
    print(1)
    async for e in arange(count):
        flag = utils.generate_flag()
        flag_id = await put_flag_in_messages(PutRequest('', flag, 2, 'http://localhost:3000'))
        flags.append((flag_id, 2, flag))
    print(2)
    async for e in arange(count):
        flag = utils.generate_flag()
        flag_id = await put_flag_in_bio(PutRequest('', flag, 3, 'http://localhost:3000'))
        flags.append((flag_id, 3, flag))
    print(3)
    async for e in arange(3 * count):
        flag_id, vuln, flag = flags[e]
        if vuln != 3:
            resp = await get_flag_from_messages(
                GetRequest(flag_id._public_message, flag, vuln, 'http://localhost:3000'))
        else:
            resp = await get_flag_from_bio(
                GetRequest(flag_id._public_message, flag, vuln, 'http://localhost:3000'))
        resps.append(resp)

    print(list(filter(lambda x: x._code != 101, resps)))
    print([(e._code, e._public_message, e._private_message) for e in resps])
    #
    # resp = await get_flag_from_messages(GetRequest(flag_id._public_message, 'flag', 1, 'http://localhost:3000'))
    # print(resp._code, resp._public_message, resp._private_message)
    #
    # flag_id = await put_flag_in_deleted_messages(PutRequest('', 'flag', 2, 'http://localhost:3000'))
    # resp = await get_flag_from_messages(GetRequest(flag_id._public_message, 'flag', 2, 'http://localhost:3000'))
    # print(resp._code, resp._public_message, resp._private_message)


if __name__ == '__main__':
    asyncio.run(main())

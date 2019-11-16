import traceback

from api import Api
from entities.user import User
from utils.invalid_response_exception import InvalidResponseException

from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest, utils

checker = Checker()


def users_are_equals(first: User, second: dict):
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


def message_in_messages(messages, message_id, message_content):
    for m in messages:
        if str(m['id']) == str(message_id):
            return m['text'] == message_content
    return False


def chat_in_chats(chats, chat_id, chat_name=None):
    for c in chats:
        if str(c['id']) == str(chat_id):
            return c['name'] == chat_name or not chat_name
    return False


@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        try:
            await api.register(user.get_register_data())
            resp = await api.login(user.username, user.password)
        except InvalidResponseException:
            return Verdict.MUMBLE('Could not register login.', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service.', traceback.format_exc())

        try:
            user_id = resp['userId']
            resp = await api.get_user(user_id)
            if not users_are_equals(user, resp):
                return Verdict.MUMBLE('Users not equals on registration and getting from service.',
                                      traceback.format_exc())

            chat_name = utils.generate_random_text()
            resp = await api.create(chat_name)
            if 'chatId' not in resp:
                return Verdict.MUMBLE('Invalid contract in chat creating', '')
            chat_id = resp['chatId']
            resp = await api.get_invite_link(chat_id)
            if 'inviteLink' not in resp:
                return Verdict.MUMBLE('Invalid contract in generating invite link', '')
            inv_link = resp['inviteLink']
            admin = user
            admin_id = user_id
            first_message_content = utils.generate_random_text()
            resp = await api.send_message(chat_id, first_message_content)
            if 'messageId' not in resp:
                return Verdict.MUMBLE('Invalid contract in messages sending', '')
            first_message_id = resp['messageId']
            await api.delete_message(first_message_id)
            user = User()
            await api.register(user.get_register_data())
            await api.login(user.username, user.password)
            await api.join(chat_id, inv_link)
            resp = await api.read_messages(chat_id)
            if 'messages' not in resp:
                return Verdict.MUMBLE('Invalid contract in messages reading', '')
            messages = resp['messages']
            if message_in_messages(messages, first_message_id, first_message_content):
                return Verdict.MUMBLE('Can read deleted message', 'deleted by other user')

            resp = await api.search(admin.first_name, admin.last_name)
            if not users_are_equals(admin, resp):
                return Verdict.MUMBLE('Can not search user', 'invalid data')
            if resp['id'] != admin_id:
                return Verdict.MUMBLE('Can not search user', 'invalid data')
            resp = await api.get_chats()
            if 'chats' not in resp:
                return Verdict.MUMBLE('Invalid contract in chats listing', 'invalid data')
            chats = resp['chats']
            if not chat_in_chats(chats, chat_id, chat_name):
                return Verdict.MUMBLE('Can not find chat in chats', 'invalid chats method')
        except:
            return Verdict.DOWN('Some service errors.', traceback.format_exc())

    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_in_messages(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        try:
            await api.register(user.get_register_data())
            await api.login(user.username, user.password)
        except InvalidResponseException as e:
            return Verdict.MUMBLE('Could not login or register', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service', traceback.format_exc())

        chat_name = utils.generate_random_text()

        try:
            chat_resp = await api.create(chat_name)
            chat_id = chat_resp['chatId']
            inv_link_resp = await api.get_invite_link(chat_id)
            inv_link = inv_link_resp['inviteLink']
            message_id_resp = await api.send_message(chat_id, request.flag)
            message_id = message_id_resp['messageId']
        except:
            return Verdict.MUMBLE('Could not create chat or invite link or send message', traceback.format_exc())

        return Verdict.OK(f'{chat_id}:{inv_link}:{message_id}')


@checker.define_put(vuln_num=2, vuln_rate=2)
async def put_flag_in_deleted_messages(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        try:
            await api.register(user.get_register_data())
            await api.login(user.username, user.password)
        except InvalidResponseException as e:
            return Verdict.MUMBLE('Could not login or register', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service', traceback.format_exc())

        chat_name = utils.generate_random_text()

        try:
            chat_resp = await api.create(chat_name)
            chat_id = chat_resp['chatId']
            message_id_resp = await api.send_message(chat_id, request.flag)
            message_id = message_id_resp['messageId']
            await api.delete_message(message_id)
        except:
            return Verdict.MUMBLE('Could not create chat or invite link or send message', traceback.format_exc())

        return Verdict.OK(f'{user.username}:{user.password}:{chat_id}:{message_id}')


@checker.define_put(vuln_num=3, vuln_rate=2)
async def put_flag_in_bio(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user = User()
        try:
            await api.register(user.get_register_data())
        except InvalidResponseException:
            return Verdict.MUMBLE('Could not register.', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service.', traceback.format_exc())

        try:
            login_resp = await api.login(user.username, user.password)
            user_id = login_resp['userId']
            await api.edit_user({'biography': request.flag})
        except:
            return Verdict.MUMBLE('Could not login or edit user.', traceback.format_exc())

        return Verdict.OK(user_id)


@checker.define_get(vuln_num=3)
async def get_flag_from_bio(request: GetRequest) -> Verdict:
    async with Api(request.hostname) as api:
        user_id = request.flag_id
        try:
            user = await api.get_user(user_id)
        except InvalidResponseException as e:
            return Verdict.CORRUPT('Could not get user info', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service', traceback.format_exc())
        if user['biography'] != request.flag:
            return Verdict.CORRUPT('Invalid flag', f'flag: {request.flag}, user bio: {user["biography"]}')

        return Verdict.OK()


@checker.define_get(vuln_num=1)
async def get_flag_from_messages(request: GetRequest) -> Verdict:
    chat_id, inv_link, message_id = request.flag_id.split(':')
    async with Api(request.hostname) as api:
        user = User()
        try:
            await api.register(user.get_register_data())
            await api.login(user.username, user.password)
            await api.join(chat_id, inv_link)
        except InvalidResponseException as e:
            return Verdict.MUMBLE('Could not login or register', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service', traceback.format_exc())
        try:
            resp = await api.read_messages(chat_id)
            if 'messages' not in resp:
                return Verdict.MUMBLE('Invalid contract in message getting', '')
            messages = resp['messages']
            message = list(filter(lambda m: int(m['id']) == int(message_id), messages))
            if len(message) != 1:
                return Verdict.CORRUPT('Invalid messages count', f'with id: {message_id}')
            if 'text' not in message[0]:
                return Verdict.MUMBLE('Invalid contract in message getting', '')
            message_content = message[0]['text']
        except:
            return Verdict.DOWN('Invalid response from service', traceback.format_exc())

        try:
            resp = await api.get_chats()
            if 'chats' not in resp:
                return Verdict.MUMBLE('Invalid contract in chats listing', 'invalid data')
            chats = resp['chats']
            if not chat_in_chats(chats, chat_id):
                return Verdict.MUMBLE('Can not find chat in chats', 'invalid /chats')
        except:
            return Verdict.DOWN('Invalid response from service', traceback.format_exc())
        if message_content != request.flag:
            return Verdict.CORRUPT('Invalid flag', f'{request.flag}, chat id: {chat_id}, invite link: {inv_link}')

        return Verdict.OK()


@checker.define_get(vuln_num=2)
async def get_flag_from_deleted_messages(request: GetRequest) -> Verdict:
    admin_username, admin_password, chat_id, message_id = request.flag_id.split(':')
    async with Api(request.hostname) as api:
        try:
            await api.login(admin_username, admin_password)
        except InvalidResponseException as e:
            return Verdict.CORRUPT('Could not login or register', traceback.format_exc())
        except:
            return Verdict.DOWN('Could not connect to service', traceback.format_exc())
        try:
            resp = await api.read_messages(chat_id)
        except InvalidResponseException:
            return Verdict.CORRUPT('Invalid response from service', traceback.format_exc())
        except:
            return Verdict.DOWN('Invalid response from service', traceback.format_exc())
        try:
            messages = resp['messages']
            message = list(filter(lambda m: int(m['id']) == int(message_id), messages))
            if len(message) != 1:
                return Verdict.CORRUPT('Invalid messages count', f'with id: {message_id}')
            message_content = message[0]['text']
        except:
            return Verdict.CORRUPT('Invalid response from service', traceback.format_exc())

        if message_content != request.flag:
            return Verdict.CORRUPT('Invalid flag', f'{request.flag}, message content: {message_content}')

        return Verdict.OK()


if __name__ == '__main__':
    checker.run()

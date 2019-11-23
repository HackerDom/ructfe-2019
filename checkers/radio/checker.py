#!/usr/bin/env python3
from api import FrontendApi, Api, BaseApi
from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest, utils
from decorators import check_exception


checker = Checker()

RETRY_CREATE_USER_COUNT = 10
RETRY_PLAYLIST_CREATE_COUNT = 10

# sometimes generator, generate to weak password and we must retry
async def _try_create_user(api: BaseApi):
    current_retry_count = RETRY_CREATE_USER_COUNT
    username = utils.generate_random_text()
    password = utils.generate_random_text(64, min_length=6)
    status, user = await api.create_user(username, password)
    while current_retry_count > 0:
        if status == 200:
            return username, password, status, user
        username = utils.generate_random_text()
        password = utils.generate_random_text(64, min_length=6)
        status, user = await api.create_user(username, password)
        current_retry_count -= 1
    return username, password, status, user


async def _try_create_playlist(api: BaseApi, is_private, playlist_description=None):
    current_retry_count = RETRY_PLAYLIST_CREATE_COUNT
    playlist_name = utils.generate_random_text()
    playlist_description = playlist_description or utils.generate_random_text(256)
    status, playlist = await api.create_playlist(playlist_name, playlist_description, is_private)
    while current_retry_count > 0:
        if status == 200:
            return playlist_name, playlist_description, status, playlist
        playlist_name = utils.generate_random_text()
        playlist_description = playlist_description or utils.generate_random_text(256)
        status, playlist = await api.create_playlist(playlist_name, playlist_description, is_private)
        current_retry_count -= 1
    return playlist_name, playlist_description, status, playlist


async def _check_api(api: BaseApi):
    playlist_name, playlist_description, status, playlist_private = await _try_create_playlist(api, False)
    if status != 200:
        return Verdict.MUMBLE(f"Can't create playlist", f"Wrong status code [create.playlist], "
            f"expect = 200, real = {status}, response={playlist_private}, playlist_name={playlist_name}, "
            f"playlist_description={playlist_description}")
    if playlist_private["private"]:
        return Verdict.MUMBLE("Private playlist is corrupt", "Wrong field in playlist")

    playlist_name, playlist_description, status, playlist_public = await _try_create_playlist(api, True)
    if status != 200:
        return Verdict.MUMBLE(f"Can't create playlist", f"Wrong status code [create.playlist], "
            f"expect = 200, real = {status}, response={playlist_public}, playlist_name={playlist_name}, "
            f"playlist_description={playlist_description}")
    if not playlist_public["private"]:
        return Verdict.MUMBLE("Public playlist is corrupt", "Wrong field in playlist")

    status, playlist_list = await api.list_playlists()
    if status != 200:
        return Verdict.MUMBLE("Can't get playlist list", f"Wrong status code [playlist.get], expect = 200,"
                                                         f"real = {status}")
    playlist_list_count = len(playlist_list)
    if playlist_list_count > 2:
        return Verdict.MUMBLE("Something wrong with playlist", f"Playlists count {playlist_list_count}, expect = 2")

    status, _ = await api.delete_playlist(playlist_public["ID"])
    if status != 200:
        return Verdict.MUMBLE("Can't delete playlist", f"Wrong status code [playlist.delete], "
                                                       f"expect = 200, real = {status}")

    status, track = await api.create_track(playlist_private["ID"])
    if status != 200:
        return Verdict.MUMBLE("Can't create track", f"Wrong status code [track.create], "
                                                    f"expect = 200, real = {status}")

    status, playlist = await api.get_playlist(playlist_private["ID"])
    if status != 200:
        return Verdict.MUMBLE("Can't get playlist", f"Wrong status code [playlist.get], expect = 200,"
                                                    f"real = {status}")
    if len(playlist["tracks"]) != 1:
        return Verdict.MUMBLE("Can't get tracks", f"Wrong status code [playlist.get], expect = 200,"
                                                  f"real = {status}")

    status, track = await api.delete_track(track["ID"])
    if status != 200:
        return Verdict.MUMBLE("Can't delete track", f"Wrong status code [track.delete], "
                                                    f"expect = 200, real = {status}")
    return Verdict.OK()


async def _check_frontend_api(request: CheckRequest) -> Verdict:
    async with FrontendApi(request.hostname) as api:
        username, password, status, user = await _try_create_user(api)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
               f" expect = 200, real = {status}, username={username}, status={status}, after {RETRY_CREATE_USER_COUNT}"
               f" attempt")
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")

        status, usernames = await api.our_users()
        if status != 200:
            return Verdict.MUMBLE(f"Can't get users", f"Wrong status code [user.usernames],"
                                                      f"expect = 200, real = {status}")
        if user['username'] not in usernames:
            return Verdict.MUMBLE(f"Can't find username in usernames", f"usernames: {usernames.join(', ')}")

        api_verdict = await _check_api(api)
        if api_verdict != Verdict.OK():
            return api_verdict
        playlist_name, playlist_description, status, playlist_public = await _try_create_playlist(api, True)
        if status != 200:
            return Verdict.MUMBLE(f"Can't create playlist", f"Wrong status code [create.playlist], "
                f"expect = 200, real = {status}, response={playlist_public}, playlist_name={playlist_name}, "
                f"playlist_description={playlist_description}")
        status, _ = await api.get_shared_playlist(playlist_public, user)
        if status != 200:
            return Verdict.MUMBLE("Can't get public playlist by hash", f"Wrong status code [playlist.get_by_hash], "
                                                                       f"expect = 200, real = {status}")
    return Verdict.OK()


async def _check_jwt_api(request: CheckRequest) -> Verdict:
    async with FrontendApi(request.hostname) as api:
        username, password, status, user = await _try_create_user(api)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
                f" expect = 200, real = {status}, username={username}, status={status}, after {RETRY_CREATE_USER_COUNT}"
                f" attempt")
    async with Api(request.hostname) as api:
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")
        status, token_data = await api.get_token()
        if status != 200:
            return Verdict.MUMBLE(f"Can't get token", f"Wrong status code [api.token],"
                                                      f"expect = 200, real = {status}")
        if 'token' not in token_data:
            return Verdict.MUMBLE(f"Can't get token", f"[api.token] not contain token")
    async with Api(request.hostname, custom_headers={'Authorization': f'Bearer {token_data["token"]}'}) as api:
        api_verdict = await _check_api(api)
        if api_verdict != Verdict.OK():
            return api_verdict
    return Verdict.OK()


@checker.define_check
@check_exception
async def check_service(request: CheckRequest) -> Verdict:
    frontend_api_verdict = await _check_frontend_api(request)
    if frontend_api_verdict != Verdict.OK():
        return frontend_api_verdict
    jwt_api_verdict = await _check_jwt_api(request)
    if jwt_api_verdict != Verdict.OK():
        return jwt_api_verdict
    return Verdict.OK()


@checker.define_put(vuln_num=1, vuln_rate=1)
@check_exception
async def put_flag_into_the_service(request: PutRequest) -> Verdict:
    async with FrontendApi(request.hostname) as api:
        username, password, status, user = await _try_create_user(api)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
                                                       f"expect = 200, real = {status}")
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")
        playlist_description = request.flag
        playlist_name, playlist_description, status, playlist = await _try_create_playlist(
            api, True, playlist_description
        )
        if status != 200:
            return Verdict.MUMBLE(f"Can't create playlist", f"Wrong status code [create.playlist], "
                f"expect = 200, real = {status}, response={playlist}, playlist_name={playlist_name}, "
                f"playlist_description={playlist_description}")
    playlist_id = playlist["ID"]
    return Verdict.OK(f'{playlist_id}:{username}:{password}')


@checker.define_get(vuln_num=1)
@check_exception
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    playlist_id, username, password = request.flag_id.split(":")
    async with FrontendApi(request.hostname) as api:
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")
        status, playlist = await api.get_playlist(playlist_id)
        if status != 200:
            return Verdict.MUMBLE("Can't get playlist", f"Wrong status code [playlist.get], expect = 200,"
                                                        f"real = {status}")
        if playlist["description"] != request.flag:
            return Verdict.CORRUPT("Broken playlist", "Corrupt!")
    return Verdict.OK()

if __name__ == '__main__':
    checker.run()

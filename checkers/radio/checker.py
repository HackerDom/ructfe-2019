#!/usr/bin/env python3
from api import FrontendApi, Api, BaseApi
from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest, utils
from decorators import check_exception


checker = Checker()


async def _check_api(api: BaseApi, user):
    playlist_name = utils.generate_random_text()
    playlist_description = utils.generate_random_text(256)
    status, playlist_private = await api.create_playlist(playlist_name, playlist_description, False)
    if status != 200:
        return Verdict.MUMBLE(f"Can't create playlist", f"Wrong status code [create.playlist], "
                                                        f"expect = 200, real = {status}")
    if playlist_private["private"]:
        return Verdict.MUMBLE("Private playlist is corrupt", "Wrong field in playlist")

    playlist_name = utils.generate_random_text()
    playlist_description = utils.generate_random_text(256)
    status, playlist_public = await api.create_playlist(playlist_name, playlist_description, True)
    if status != 200:
        return Verdict.MUMBLE("Can't create playlist", f"Wrong status code [playlist.create], "
                                                       f"expect = 200, real = {status}")
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
        username = utils.generate_random_text()
        password = utils.generate_random_text(64, min_length=6)
        status, user = await api.create_user(username, password)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
                                                       f"expect = 200, real = {status}")

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

        api_verdict = await _check_api(api, user)
        if api_verdict != Verdict.OK():
            return api_verdict
        playlist_name = utils.generate_random_text()
        playlist_description = utils.generate_random_text(256)
        status, playlist_public = await api.create_playlist(playlist_name, playlist_description, True)
        if status != 200:
            return Verdict.MUMBLE("Can't create playlist", f"Wrong status code [playlist.create], "
                                                           f"expect = 200, real = {status}")
        status, _ = await api.get_shared_playlist(playlist_public, user)
        if status != 200:
            return Verdict.MUMBLE("Can't get public playlist by hash", f"Wrong status code [playlist.get_by_hash], "
                                                                       f"expect = 200, real = {status}")
    return Verdict.OK()


async def _check_jwt_api(request: CheckRequest) -> Verdict:
    async with FrontendApi(request.hostname, '') as api:
        username = utils.generate_random_text()
        password = utils.generate_random_text(64, min_length=6)
        status, user = await api.create_user(username, password)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
                                                       f"expect = 200, real = {status}")
    async with Api(request.hostname) as api:
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")
        status, token_data = await api.get_token()
        if status != 200:
            return Verdict.MUMBLE(f"Can't get token", f"Wrong status code [api.token],"
                                                      f"expect = 200, real = {status}")
    async with Api(request.hostname, custom_headers={'Authorization': f'Bearer {token_data["token"]}'}) as api:
        api_verdict = await _check_api(api, user)
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
    username = utils.generate_random_text()
    password = utils.generate_random_text(64, min_length=6)
    async with FrontendApi(request.hostname) as api:
        status, user = await api.create_user(username, password)
        if status != 200:
            return Verdict.MUMBLE("Can't create user", f"Wrong status code [user.create],"
                                                       f"expect = 200, real = {status}")
        status, user = await api.login_user(username, password)
        if status != 200:
            return Verdict.MUMBLE(f"Can't login user", f"Wrong status code [user.login],"
                                                       f"expect = 200, real = {status}")
        playlist_name = utils.generate_random_text(length=256)
        playlist_description = request.flag
        status, playlist = await api.create_playlist(playlist_name, playlist_description, True)
        if status != 200:
            return Verdict.MUMBLE("Can't create playlist", f"Wrong status code [playlist.create], "
                                                           f"expect = 200, real = {status}")
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

#!/usr/bin/env python3
from api import Api
from chklib import Checker, Verdict, CheckRequest, PutRequest, GetRequest, utils
from decorators import check_exception


checker = Checker()


@check_exception
@checker.define_check
async def check_service(request: CheckRequest) -> Verdict:
    async with Api(request.hostname, 'frontend-api') as api:
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


@check_exception
@checker.define_put(vuln_num=1, vuln_rate=1)
async def put_flag_into_the_service(request: PutRequest) -> Verdict:
    username = utils.generate_random_text()
    password = utils.generate_random_text(64, min_length=6)
    async with Api(request.hostname, 'frontend-api') as api:
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


@check_exception
@checker.define_get(vuln_num=1)
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    playlist_id, username, password = request.flag_id.split(":")

    async with Api(request.hostname, 'frontend-api') as api:
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

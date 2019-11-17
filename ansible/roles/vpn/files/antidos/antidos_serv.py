#!/usr/bin/python3

import asyncio


MSG = """Please, stop the flood attack on the game network.

---
RuCTFE organizers.
"""


def accept_client(client_reader, client_writer):
    task = asyncio.Task(handle_client(client_reader, client_writer))

    def client_done(task):
        client_writer.close()

    task.add_done_callback(client_done)


@asyncio.coroutine
def handle_client(client_reader, client_writer):
    client_writer.write(MSG.encode())


def main():
    loop = asyncio.get_event_loop()
    f = asyncio.start_server(accept_client, host=None, port=40001)
    loop.run_until_complete(f)
    loop.run_forever()

if __name__ == '__main__':
    main()

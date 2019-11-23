#!/usr/bin/python3

import requests
import json
import os

user = os.getenv('SITE_USER', 'checker')
password = os.getenv('SITE_PASSWORD')
r = requests.get('https://ructfe.org/checker_json', auth=(user, password))
teams = r.json()

for team in teams:
    a = 60 + int(team['config_id'] / 256)
    b = team['config_id'] % 256

    network = "10.{a}.{b}.0/24".format(a=a, b=b)
    host    = "10.{a}.{b}.2".format(a=a, b=b)

    name = team['name'].replace("'", "\\'")
    if team['logo'].find("ctf-static/dummy") != -1:
      logo = "/data/sprite_1.png"
    else:
      logo = "https://ructfe.org{}".format(team['logo'])

    print("  {{name => '{name}', network => '{network}', host => '{host}', token => '{token}', country => '{country}', logo => '{logo}'}},".format(name=name, network=network, host=host, token=team['checker_token'], country=team['country'], logo=logo))

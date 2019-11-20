import requests
import json

USE_REAL_TEAMS = False

URL = "http://ructf.org/e/2014/teams/info"

teams_cache = {}

def get_teams():
	global teams_cache
	try:
		teams = {}
		if not USE_REAL_TEAMS:
			for i in range(768):
				teams[i] = "test_team%d" % i
		else:
				content = requests.get(URL).text
				teams_list = json.loads(content)
				for team_id, team_name in teams_list:
					if type(team_id) is int:
						teams[team_id] = team_name
	except Exception:
		return teams_cache

	teams_cache = teams
	return teams

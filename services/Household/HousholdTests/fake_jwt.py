# pip install jwt
# 	

import jwt


user_id = "2729ba10-a445-4383-8c43-91e9ede7d7ed"

payload = {
  "nbf": "1574235930",
  "exp": "1574739530",
  "iss": "http://localhost:5000",
  "aud": "HouseholdAPI",
  "client_id": "Household",
  "sub": user_id,
  "auth_time": "1574235927",
  "idp": "local",
  "scope": [
    "openid",
    "profile",
    "HouseholdAPI"
  ],
  "amr": [
    "pwd"
  ]
}

f = open(r'D:\Светлана\source\ructfe-2019\services\Household\private.pem','r')
key = f.read()

encoded = jwt.encode(payload, key, algorithm='PS512')

print(encoded)

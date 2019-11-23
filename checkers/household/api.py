import aiohttp
from aiohttp.client import ClientTimeout
from string import ascii_letters, digits, ascii_lowercase
from random import choices, randint
from hashlib import sha256
from product_import import get_random_product
from base64 import urlsafe_b64encode
from urllib.parse import urlparse, parse_qs
from json import dumps
from networking.masking_connector import get_agent

PORT = 5000

def generate_state_code():
    return ''.join(choices(ascii_lowercase + digits, k=32))
    
def generate_PKCE_codes():
    code_verifier = ''.join(choices(ascii_letters, k=100))
    return code_verifier, urlsafe_b64encode(sha256(code_verifier.encode()).digest()).decode().replace('=','')

class Api:
    def __init__(self, hostname: str):
        self.url = f'http://{hostname}:{PORT}'
        self.session = aiohttp.ClientSession(
                                timeout=ClientTimeout(total=120), 
                                headers={"User-Agent": get_agent()}, 
                                cookie_jar=aiohttp.CookieJar(unsafe=True))
        

    async def get_json(self, resp, status=200):
        return await resp.json() if resp.status == status else {}
        
    async def registration(self, email, password, role='Cook'):
        payload = f'Input.Email={email}&Input.Password={password}&Input.Role={role}'
        async with self.session.post(f'{self.url}/Identity/Account/Register', data=payload, headers={'Content-Type':'application/x-www-form-urlencoded'}, allow_redirects=False) as resp:
            return resp.status
            
    async def login(self, email, password):
        payload = f'Input.Email={email}&Input.Password={password}'
        async with self.session.post(f'{self.url}/Identity/Account/Login', data=payload, headers={'Content-Type':'application/x-www-form-urlencoded'}, allow_redirects=False) as resp:
            if resp.status != 302:
                return resp.status
        
        state_code = generate_state_code()
        code_verifier, code_challenge = generate_PKCE_codes()
        
        callback_query = []
        async with self.session.get(f"{self.url}/connect/authorize?client_id=Household&response_type=code&" +
                                        f"scope=HouseholdAPI%20openid%20profile&state={state_code}&" +
                                        "response_mode=query&prompt=none&" +
                                        f"redirect_uri={self.url}/authentication/login-callback&" +
                                        "code_challenge_method=S256&" +
                                        f"code_challenge={code_challenge}", allow_redirects=False) as resp:
            if resp.status != 302:
                return resp.status
            callback_query = parse_qs(urlparse(resp.headers['Location']).query)

        token = ''
        payload = f"client_id=Household&code={callback_query['code'][0]}&redirect_uri={self.url}/authentication/login-callback&code_verifier={code_verifier}&grant_type=authorization_code";
        async with self.session.post(f"{self.url}/connect/token", data=payload, headers={'Content-Type':'application/x-www-form-urlencoded'}, allow_redirects=False) as resp:
            if resp.status != 200:
                return resp.status
            json_res = await resp.json()
            token = f'{json_res["token_type"]} {json_res["access_token"]}'
        self.session._default_headers.update({'Authorization': token})
        return 'success'
        
    async def add_product(self, manufacturer):
        product = get_random_product()
        
        payload = {
            "name": product.name,
            "protein": product.protein,
            "fat": product.fat,
            "carbohydrate": product.carbohydrate,
            "calories": product.calories,
            "manufacturer": manufacturer
        }
        
        async with self.session.post(f"{self.url}/api/Products", json=payload, allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp, 201)

    async def add_product_via_xml(self, prods):
        products_xml = '<products>'
        for prod in prods:
            product = prod['product']
            manufacturer = prod['manufacturer']
            products_xml += f'''<product>
                                    <name>{product.name}</name>
                                    <calories>{product.calories}</calories>
                                    <protein>{product.protein}</protein>
                                    <fat>{product.fat}</fat>
                                    <carbohydrate>{product.carbohydrate}</carbohydrate>
                                    <manufacturer>{manufacturer}</manufacturer>
                               </product>'''
        products_xml += '</products>'
        
        form_data_xml = aiohttp.FormData()
        form_data_xml.add_field('t_name', products_xml.encode(), content_type='multipart/form-data')
        async with self.session.post(f"{self.url}/api/products/import", data=form_data_xml, allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
    
    async def get_products(self):
        async with self.session.get(f"{self.url}/api/Products", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def get_product_by_id(self, id):
        async with self.session.get(f"{self.url}/api/Products/{id}", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def add_dish(self, name, recipe, ingredients, description):
        payload = {
            "recipe": recipe,
            "ingredients": ingredients,
            "name": name,
            "description": description,
            "portionWeight": randint(100,200)
        }
        async with self.session.post(f"{self.url}/api/Dishes", json=payload, allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp, 201)

    async def get_dishes(self):
        async with self.session.get(f"{self.url}/api/Dishes", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def get_dish_by_id(self, id):
        async with self.session.get(f"{self.url}/api/Dishes/{id}", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def add_menu(self, name, description, dish_id_list):
        payload = {
            "name": name,
            "description": description,
            "dishIds": dish_id_list
        }
        async with self.session.post(f"{self.url}/api/Menus", json=payload, allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp, 201)
    
    async def get_menus(self):
        async with self.session.get(f"{self.url}/api/Menus", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def get_menu_by_id(self, id):
        async with self.session.get(f"{self.url}/api/Menus/{id}", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            
    async def get_orders(self):
        async with self.session.get(f"{self.url}/api/Orders", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
    
    async def get_order_by_id(self, id):
        async with self.session.get(f"{self.url}/api/Orders/{id}", allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp)
            

    async def create_order(self, menu_id, product_id_list):
        payload = {
            "menuId": menu_id,
            "dishIds": product_id_list
        }
        async with self.session.post(f"{self.url}/api/Orders", json=payload, allow_redirects=False) as resp:
            return resp.status, await self.get_json(resp, 201)
    
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

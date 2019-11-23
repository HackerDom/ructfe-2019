#!/usr/bin/env python3.7
from api import Api
from chklib import Checker, Verdict, \
    CheckRequest, PutRequest, GetRequest, utils
import traceback
from string import ascii_letters
from random import choices, randint, sample
import json
from decorators import check_exception

checker = Checker()

def grs(k):
    return ''.join(choices(ascii_letters, k=k))

def get_mail_and_pass():
    return (f'{grs(10)}@{grs(5)}.{grs(2)}', grs(25))
    
def get_product_name():
    return grs(10)

@checker.define_check
@check_exception
async def check_service(request: CheckRequest) -> Verdict:
    menu_for_customer = {}
    async with Api(request.hostname) as api:
        creds = get_mail_and_pass()
        res = await api.registration(creds[0], creds[1])
        if res != 302:
            return Verdict.MUMBLE('Can\'t register', f'Troubles with registration.\nExpected status is 302, but real is {res}')
        
        res = await api.login(creds[0], creds[1])
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success', but return {res}")
        
        status, product = await api.add_product(get_product_name(), grs(12))
        if status != 201:
            return Verdict.MUMBLE("Can't add product", f"Expected status is 201, but return {status} with content {product}")
        
        status, r_products_list = await api.get_products()
        if status != 200 or product not in r_products_list['items']:
            return Verdict.MUMBLE("Can't get product", f"Can't get all products. Expected status is 200 and product is {product}, but return {status} with {r_products_list}")
        
        status, r_product = await api.get_product_by_id(product['id'])
        if status != 200 or product != r_product:
            return Verdict.MUMBLE("Can't get product", f"Can't get product by id. Expected status is 200 and product is {product}, but return {status} with {r_product}")
        
        status, products_list = await api.add_product_via_xml([{'name': get_product_name(), 'manufacturer': grs(15)} for _ in range(3)])
        if status != 200:
            return Verdict.MUMBLE("Can't add product", f"Expected status is 200, but return {status} with content {products_list}")
            
        status, r_products_list = await api.get_products()
        if status != 200 or len([p for p in products_list['items'] if p in r_products_list['items']]) != len(products_list['items']):
            return Verdict.MUMBLE("Can't get product", f"Expected status is 200 and product is {product}, but return {status} with {r_products_list}")
        
        products_list['items'].append(product)
        products_for_dish = [{"productId": p['id'], "weight": randint(1,10)} for p in sample(products_list['items'], k=randint(1,len(products_list['items'])))]
        
        products_for_dish = sorted(products_for_dish, key=lambda x: x['productId'])
        status, dish = await api.add_dish(grs(10), grs(50), products_for_dish, grs(50))
        if status != 201:
            return Verdict.MUMBLE("Can't create dish", f"Expected status is 201, but return {status} with content {dish}")
        
        status, dishes = await api.get_dishes()
        if status != 200 or dish not in dishes['items']:
            return Verdict.MUMBLE("Can't find dish", f"Expected status is 200 with {dish},\n but return {status} with content {dishes}")

        status, r_dish = await api.get_dish_by_id(dish['id'])
        if status != 200 or dish != r_dish:
            return Verdict.MUMBLE("Can't find dish", f"Expected status is 200 with {dish},\n but return {status} with content {r_dish}")

        status, menu = await api.add_menu(grs(10), grs(50), [dish['id']])
        if status != 201:
            return Verdict.MUMBLE("Can't create menu", f"Expected status is 201, but return {status} with content {menu}")
        
        status, r_menu = await api.get_menu_by_id(menu['id'])
        if status != 200 or menu != r_menu:
            return Verdict.MUMBLE("Can't find menu", f"Expected status is 200 with {menu}, but return {status} with content {r_menu}")
        menu_for_customer = menu
        
    async with Api(request.hostname) as api:
        creds = get_mail_and_pass()
        res = await api.registration(creds[0], creds[1], role='Customer')
        if res != 302:
            return Verdict.MUMBLE('Can\'t register', f'Troubles with registration.\nExpected status is 302, but real is {res}')
        
        res = await api.login(creds[0], creds[1])
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success', but return {res}")
        
        status, order = await api.create_order(menu_for_customer['id'], sample(menu_for_customer['dishIds'], k=1))
        
        if status != 201:
            return Verdict.MUMBLE("Can't create order", f"Expected status 201, but return {status} with content {order}")

        status, r_order = await api.get_order_by_id(order['id'])
        if status != 200 or r_order != order:
            return Verdict.MUMBLE("Can't get order", f"Expected status 200 with {order}, but return {status} with content {r_order}")
            
    return Verdict.OK()

@checker.define_put(vuln_num=1, vuln_rate=1)
@check_exception
async def put_flag_into_the_service(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        creds = get_mail_and_pass()
        res = await api.registration(creds[0], creds[1])
        if res != 302:
            return Verdict.MUMBLE('Can\'t register', f'Troubles with registration.\nExpected status is 302, but real is {res}')
        
        res = await api.login(creds[0], creds[1])
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success', but return {res}")
        
        status, product = await api.add_product(get_product_name(), request.flag)
        if status != 201:
            return Verdict.MUMBLE("Can't add product", f"Expected status is 201, but return {status} with content {product}")

    return Verdict.OK(f"{creds[0]}:{creds[1]}:{product['id']}")
    
@checker.define_get(vuln_num=1)
@check_exception
async def get_flag_from_the_service(request: GetRequest) -> Verdict:
    login, password, product_id = request.flag_id.split(":")
    
    async with Api(request.hostname) as api:        
        res = await api.login(login, password)
        
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success' and '<token>', but return {res}")
        
        status, r_product = await api.get_product_by_id(product_id)
        if status != 200:
            return Verdict.MUMBLE("Can't get product", f"Can't get product by id. Expected status is 200 and product is {product}, but return {status} with {r_product}")
            
        if not r_product['manufacturer'] or r_product['manufacturer'] != request.flag:
            return Verdict.CORRUPT("Can't get flag", f"Flag {request.flag} not equal to {r_product['manufacturer']} for product {product_id}. Creds: {login}:{password} ")
    return Verdict.OK()

@checker.define_put(vuln_num=2, vuln_rate=2)
@check_exception
async def put_sflag_into_the_service(request: PutRequest) -> Verdict:
    async with Api(request.hostname) as api:
        creds = get_mail_and_pass()
        res = await api.registration(creds[0], creds[1])
        if res != 302:
            return Verdict.MUMBLE('Can\'t register', f'Troubles with registration.\nExpected status is 302, but real is {res}')
        
        res = await api.login(creds[0], creds[1])
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success', but return {res}")
        
        
        status, products_list = await api.add_product_via_xml([{'name':get_product_name(), 'manufacturer':grs(15)} for _ in range(randint(2,5))])
        if status != 200:
            return Verdict.MUMBLE("Can't add product", f"Expected status is 200, but return {status} with content {products_list}")
        
        products_for_dish = [{"productId": p['id'], "weight": randint(1,10)} for p in products_list['items']]
        status, dish = await api.add_dish(grs(10), request.flag, products_for_dish, grs(50))
        if status != 201:
            return Verdict.MUMBLE("Can't create dish", f"Expected status is 201, but return {status} with content {dish}")

    return Verdict.OK(f"{creds[0]}:{creds[1]}:{dish['id']}")
    
@checker.define_get(vuln_num=2)
@check_exception
async def get_sflag_from_the_service(request: GetRequest) -> Verdict:
    login, password, dish_id = request.flag_id.split(":")
    
    async with Api(request.hostname) as api:        
        res = await api.login(login, password)
        if res != 'success':
            return Verdict.MUMBLE("Can't log in", f"Log in is incorrect.\n Expected 'success' and '<token>', but return {res}")
        
        status, dish = await api.get_dish_by_id(dish_id)
        if status != 200:
            return Verdict.MUMBLE("Can't find dish", f"Expected status is 200,\n but return {status} with content {dish}")
          
        if dish['id'] != int(dish_id) or dish['recipe'] != request.flag:
            return Verdict.CORRUPT("Can't get flag", f"Flag {request.flag} not equal to {dish['recipe']} for dish {dish_id}. Creds: {login}:{password} ")
    return Verdict.OK()

if __name__ == '__main__':
    checker.run()


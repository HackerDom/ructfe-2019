from random import choice

def get_random_product():
    return choice(PRODUCTS)


class Product:
    def __init__(self):
        self.calories = None
        self.protein = None
        self.fat = None
        self.carbohydrate = None
        self.name = None
        
    def __str__(self):
        return f"'{self.name}' {self.calories} {self.protein} {self.fat} {self.carbohydrate}"
    
    
def read_data(input_file):
    result = []
    for line in input_file:
        data = line[:-1].split("_")
        
        p = Product()
        p.calories = float(data[0])
        p.protein = float(data[1])
        p.fat = float(data[2])
        p.carbohydrate = float(data[3])
        p.name = ' '.join(data[4:])
        
        result.append(p)
    
    return result
    
    

with open("products.txt", "r") as input_file:
    PRODUCTS = read_data(input_file)


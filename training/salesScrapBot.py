# Test some web scraping code

import requests
from bs4 import BeautifulSoup
import csv

# Make a request
# page = requests.get(
#     "https://codedamn-classrooms.github.io/webscraper-python-codedamn-classroom-website/")
page = requests.get(
    "https://www.99.co/singapore/condos-apartments/adana-thomson")
soup = BeautifulSoup(page.content, 'html.parser')

# Create top_items as empty list
all_products = []

#print(soup)

# Extract and store in top_items according to instructions on the left
# products = soup.select('div.content')
#products = soup.find("div", {'id':'content'})
products = soup.select("div.Zf7_A")
print(products)
#for product in products:
#    print(product)
#     name = product.select('h4 > a')[0].text.strip()
#     description = product.select('p.description')[0].text.strip()
#     price = product.select('h4.price')[0].text.strip()
#     reviews = product.select('div.ratings')[0].text.strip()
#     image = product.select('img')[0].get('src')

#     all_products.append({
#         "name": name,
#         "description": description,
#         "price": price,
#         "reviews": reviews,
#         "image": image
#     })


# keys = all_products[0].keys()

# with open("dataset/sale-prediction/products.csv", 'w', newline='') as output_file:
#     dict_writer = csv.DictWriter(output_file, keys)
#     dict_writer.writeheader()
#     dict_writer.writerows(all_products)
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os

async def start():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    
    driver = webdriver.Chrome(
        options=chrome_options
    )
    
    return driver


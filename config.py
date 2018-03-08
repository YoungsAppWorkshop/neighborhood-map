# Define the application directory
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DEBUG = False

# Define API secret file
API_SECRET_FILE = os.path.join(BASE_DIR, 'api_secrets.json')

# To keep API secret out of Version Control,
# store api_secrets.json file inside the `instance/` folder
# API_SECRET_FILE = os.path.join(BASE_DIR, 'instance/api_secrets.json')

# Application threads. A common general assumption is
# using 2 per available processor cores - to handle
# incoming requests using one and performing background
# operations using the other.
THREADS_PER_PAGE = 2

# Secret key for signing cookies
SECRET_KEY = "YOUR_SECRET_KEY_HERE"

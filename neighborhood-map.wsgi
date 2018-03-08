import sys  
sys.path.insert(0, '/var/www/neighborhood-map')
activate_this = '/var/www/neighborhood-map/venv/bin/activate_this.py'
with open(activate_this) as file_:
  exec(file_.read(), dict(__file__=activate_this))
from app import app as application

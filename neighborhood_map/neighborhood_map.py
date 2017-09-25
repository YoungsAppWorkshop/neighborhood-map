#!/usr/bin/env python3
import json
import requests
from flask import (Flask, request, url_for, abort, render_template,
                   make_response, jsonify)

GOOGLE_MAP_API_KEY = json.loads(open('api_secrets.json', 'r').read())['googlemap']['api_key']  # noqa
FOURSQUARE_CLIENT_ID = json.loads(open('api_secrets.json', 'r').read())['foursquare']['app_id']  # noqa
FOURSQUARE_CLIENT_SECRET = json.loads(open('api_secrets.json', 'r').read())['foursquare']['app_secret']  # noqa


# Create the application instance
app = Flask(__name__)

# Load default config from this file
app.config.from_object(__name__)
app.config.update(dict(
    SECRET_KEY='development key'
))

# And override config from an environment variable
app.config.from_envvar('NEIGHBORHOOD_MAP_SETTINGS', silent=True)


@app.route('/')
def show_neighborhood_map():
    """Serve Neighborhood Map application """
    return render_template('neighborhood_map.html',
                           GOOGLE_MAP_API_KEY=GOOGLE_MAP_API_KEY)

#!/usr/bin/env python3
import json
import requests
from flask import (Flask, request, url_for, abort, render_template,
                   make_response, jsonify)


# Create the application instance
# app = Flask(__name__)

# To load configuration variables from instance folder, uncomment the below
app = Flask(__name__, instance_relative_config=True)

# Load default config
app.config.from_object('config')

# To load configuration variables from instance folder, uncomment the below
app.config.from_pyfile('config.py')

# Load API secrets from API_SECRET_FILE
API_SECRET_FILE = app.config['API_SECRET_FILE']
GOOGLE_MAP_API_KEY = json.loads(open(API_SECRET_FILE, 'r').read())['googlemap']['api_key']  # noqa
FOURSQUARE_CLIENT_ID = json.loads(open(API_SECRET_FILE, 'r').read())['foursquare']['app_id']  # noqa
FOURSQUARE_CLIENT_SECRET = json.loads(open(API_SECRET_FILE, 'r').read())['foursquare']['app_secret']  # noqa


@app.route('/')
def show_neighborhood_map():
    """Serve Neighborhood Map application """
    return render_template('neighborhood_map.html',
                           GOOGLE_MAP_API_KEY=GOOGLE_MAP_API_KEY)


@app.route('/venues')
def get_venues_list():
    """Fetch Venues' data near requested address from Foursquare API
    And return JSON object for the neighborhood map app.
    """

    # Get parameters from request
    address = request.args.get('address')
    section = request.args.get('section')

    # If one of parameters is missing, send error response
    if address is None:
        response = create_response('PARAM_ERROR', 'Must provide param address', 400)  # noqa
        return response
    if section is None:
        response = create_response('PARAM_ERROR', 'Must provide param section', 400)  # noqa
        return response

    # Use Google Maps to convert address into Latitude/Longitude coordinates
    url = 'https://maps.googleapis.com/maps/api/geocode/json'
    params = {
        'address': address,
        'key': GOOGLE_MAP_API_KEY
    }
    try:
        answer = requests.get(url, params=params)
        data = answer.json()
    except Exception:
        # If Google Maps API doesn't respond, notify client
        response = create_response('G_MAPS_ERROR', "Couldn't get lat&lng", 200)
        return response
    # If Google Maps API returns 'ZERO_RESULTS', notify client
    if data.get('status') == 'ZERO_RESULTS':
        response = create_response('WRONG_ADDRESS', 'No such address', 200)
        return response
    # If Google Maps API returns other error response, notify client
    if data.get('status') != 'OK':
        response = create_response('G_MAPS_ERROR', "Couldn't get lat&lng", 200)
        return response

    # Get Latitude/Longitude from Google Maps API response
    lat = data.get('results')[0].get('geometry').get('location').get('lat')
    lng = data.get('results')[0].get('geometry').get('location').get('lng')
    # Use Foursquare API to get venues data using lat/lng and section
    url = 'https://api.foursquare.com/v2/venues/explore'
    params = {
        'client_id': FOURSQUARE_CLIENT_ID,
        'client_secret': FOURSQUARE_CLIENT_SECRET,
        'v': 20170901,
        'll': str(lat) + ',' + str(lng),
        'section': section,
        'venuePhotos': 1
    }
    try:
        answer = requests.get(url, params=params)
        data = answer.json()
    except Exception:
        # If Foursquare API doesn't respond, notify client
        response = create_response('FOURSQUARE_ERROR', 'Error occured while getting venues data from Foursquare', 200)  # noqa
        return response
    # If Foursquare API returns error response, notify client
    if data.get('meta').get('code') != 200:
        response = create_response('FOURSQUARE_ERROR', 'Error occured while getting venues data from Foursquare', 200)  # noqa
        return response

    # Make response and send venues data to client
    message = 'Venues List for {} in {}'.format(section, address)
    results = data.get('response').get('groups')[0]
    results['location'] = {'lat': lat, 'lng': lng}
    response = create_response('OK', message, 200, results)
    return response


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


def create_response(status, message, code, results={}):
    """Create customized JSON response object to send client
    """
    message = {
        'meta': {
            'status': status,
            'message': message
        },
        'results': results
    }
    response = make_response(json.dumps(message), code)
    response.headers['Content-Type'] = 'application/json'
    return response

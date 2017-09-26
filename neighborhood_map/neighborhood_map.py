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
    answer = requests.get(url, params=params)
    data = answer.json()
    # If there's no result from Google Maps API, send error response
    if data.get('status') == 'ZERO_RESULTS':
        response = create_response('WRONG_ADDRESS', 'No such address', 200)
        return response
    # If error occurs while getting lat/lng, send error response
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
    answer = requests.get(url, params=params)
    data = answer.json()
    # If error occurs while getting venues data, send error response
    if data.get('meta').get('code') != 200:
        response = create_response('FOURSQUARE_ERROR', 'Error occured while getting venues data from Foursquare', 200)  # noqa
        return response

    # Make response and send venues data to client
    message = 'Venues List for {} in {}'.format(section, address)
    results = data.get('response').get('groups')[0]
    results['location'] = {'lat': lat, 'lng': lng}
    response = create_response('OK', message, 200, results)
    return response


def create_response(status, message, code, results={}):
    """Create customized response object
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

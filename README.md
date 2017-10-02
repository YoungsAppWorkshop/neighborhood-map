# Project: Neighborhood Map

The neighborhood map is a single page application featuring a map of neighborhood you would like to visit. By default, it shows Busan, South Korea where I was born and grow, but you can also explore wherever you want thanks to [Google Maps](https://developers.google.com/maps/) and [Foursquare](https://developer.foursquare.com/) APIs.

## Installation
Clone the github repository and install flask app as follow.

```
git clone https://github.com/YoungsAppWorkshop/neighborhood-map
cd neighborhood-map
pip install .
```

Since the neighborhood map is built upon [Google Maps](https://developers.google.com/maps/) and [Foursquare](https://developer.foursquare.com/) APIs, it needs credentials of the APIs to work properly. The app credentials should be specified in `api_secrets.json` file included in the `/neighborhood-map` directory.

## Starting the app
After including the API credentials in `api_secrets.json` file, the app can be started as:

```
export FLASK_APP=neighborhood_map
flask run --host=0.0.0.0
```

### Structure of the app
```
/neighborhood-map
    /neighborhood_map
        /static
            /js
                app.js
            /css
            /img
        /templates
            neighborhood_map.html
        __init__.py
        neighborhood_map.py
    setup.py
    api_secrets.json
    MANIFEST.in
    README.md
```

### Attributions for outer sources
Below are the origins of outer source codes and images.
- [TodoMVC Knockout.js example](http://todomvc.com/examples/knockoutjs/)
- [Customizing the Google Maps Infowindow](https://codepen.io/Marnoto/pen/xboPmG)
- [Resizing Google Maps](http://jsfiddle.net/n5c01zw5/)
- [Animate.css](https://daneden.github.io/animate.css/)
- Google Maps Marker icons: [Green](https://pixabay.com/en/poi-location-pin-marker-position-304466/) / [Red](https://pixabay.com/en/location-poi-pin-marker-position-304467/)
- [No Image Icon](https://www.iconfinder.com/icons/103591/cancel_image_icon#size=128)
- [loading.gif](https://preloaders.net/)

### License
This is a public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

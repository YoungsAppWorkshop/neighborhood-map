# Project: Neighborhood Map

The neighborhood map is a single page application featuring a map of neighborhood you would like to visit. By default, it shows Busan, South Korea where I was born and grow, but you can also explore wherever you want thanks to [Google Maps](https://developers.google.com/maps/) and [Foursquare](https://developer.foursquare.com/) APIs. This project is one of assignments for the [Udacity's Full Stack Web Developer Nanodegree program](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004).

- 한글 리드미(README Korean) 파일: [README_ko.md](https://github.com/YoungsAppWorkshop/neighborhood-map/blob/master/README_ko.md)

## Screenshots
| Venues List   | Venue Detail |
|------------------|-----------------|
|![Screenshot_01](https://github.com/YoungsAppWorkshop/neighborhood-map/blob/master/ScreenShot01.png?raw=true)| ![Screenshot_02](https://github.com/YoungsAppWorkshop/neighborhood-map/blob/master/ScreenShot02.png?raw=true) |

## Installation
Clone the github repository and install dependencies as follow.

```
git clone https://github.com/YoungsAppWorkshop/neighborhood-map
cd neighborhood-map
pip3 install -r requirements.txt
```

Since the neighborhood map is built upon [Google Maps](https://developers.google.com/maps/) and [Foursquare](https://developer.foursquare.com/) APIs, it needs credentials of the APIs to work properly. The app credentials should be specified in `api_secrets.json` file.

## Starting the app
After including the API credentials in `api_secrets.json` file, the app can be started as:

```
python3 run.py
```

## Structure of the app
```bash
/neighborhood-map
    /app
        /static
            /js
                app.js              # JavaScript Application
            /css
            /img
        /templates
            neighborhood_map.html
        __init__.py
        neighborhood_map.py         # Neighborhood Flask application
    api_secrets.json                # API secrets
    config.py                       # Configurations
    README.md
    requirements.txt
    run.py                          # Python3 script to run the app
```

## Attributions
Below are the origins of outer source codes and images.
- [TodoMVC Knockout.js example](http://todomvc.com/examples/knockoutjs/)
- [Customizing the Google Maps Infowindow](https://codepen.io/Marnoto/pen/xboPmG)
- [Resizing Google Maps](http://jsfiddle.net/n5c01zw5/)
- [Animate.css](https://daneden.github.io/animate.css/)
- Google Maps Marker icons: [Green](https://pixabay.com/en/poi-location-pin-marker-position-304466/) / [Red](https://pixabay.com/en/location-poi-pin-marker-position-304467/)
- [No Image Icon](https://www.iconfinder.com/icons/103591/cancel_image_icon#size=128)
- [loading.gif](https://preloaders.net/)
- [404 Page Not Found Image](https://pixabay.com/en/not-found-website-error-page-404-1770320/)

## License
[MIT licensed](/LICENSE)

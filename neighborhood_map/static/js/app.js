//
// Initialize Google Maps API
//
var map;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('google-map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 14,
        mapTypeControl: false
    });
}




/**
*
* Class to represent a list item in the venues list
* @param {Object} venueItem A JSON-serializable object of venue data
*/
const Venue = function(venueItem) {
    const self = this;

    self.name = venueItem.venue.name;
    self.address = venueItem.venue.location.formattedAddress.join(' ');
    self.lat = venueItem.venue.location.lat;
    self.lng = venueItem.venue.location.lng;
    self.phone = venueItem.venue.contact.formattedPhone ? venueItem.venue.contact.formattedPhone : '';
    self.url = venueItem.venue.url ? venueItem.venue.url : '';
    if (venueItem.venue.featuredPhotos) {
        self.photo = venueItem.venue.featuredPhotos.items[0].prefix + '300x300';
        self.photo += venueItem.venue.featuredPhotos.items[0].suffix;
    } else {
        self.photo = "static/img/no_image.png";
    }
    self.formattedName = ko.computed(function(){
        if (self.name.length > 25) {
            return self.name.slice(0, 25) + '...';
        } else {
            return self.name;
        }
    });
};




/**
 *
 * ViewModel - Knockout.js ViewModel
 *
 */
let ViewModel = function() {
    const self = this;

    self.city = ko.observable('Busan');
    self.country = ko.observable('South Korea');
    self.availableSections = ['TopPicks', 'Food', 'Drinks', 'Coffee', 'Shops', 'Arts', 'Outdoors', 'Sights', 'Trending', 'Specials'];
    self.section = ko.observable(self.availableSections[0]);
    self.filter = ko.observable('');
    self.venues = ko.observableArray([]);
    self.isWaiting = ko.observable(false);
    self.isInfo = ko.observable(false);
    self.infoTitle = ko.observable('');
    self.infoMessage = ko.observable('');

    self.searchVenues = function() {
        let address = self.city() + ', ' + self.country();
        let url = '/venues';
        url += '?' + $.param({
            'address': address,
            'section': self.section()
        });
        self.venues([]);
        self.isWaiting(true);
        self.isInfo(false);
        $.ajax({
            url: url,
            method: 'GET',
        }).done(function(response) {
            // console.log(response.meta);
            if (response.meta.status === 'OK') {
                // console.log(response.results.location);
                map.setCenter(response.results.location);
                const venueItems = response.results.items;
                if (venueItems.length === 0) {
                    self.displayInfo('No result', "Couldn't find " + self.section() + " in this location.");
                } else {
                    for (const venueItem of venueItems) {
                        const venue = new Venue(venueItem);
                        self.venues.push(venue);
                    }
                    self.isWaiting(false);
                }
            } else if (response.meta.status === 'WRONG_ADDRESS') {
                self.displayInfo('Location Error', "Couldn't find the location. Please specify City and Country.");
            } else {
                self.displayInfo('Server Error', "Couldn't receive data from the server.");
            }
        }).fail(function(err) {
            // console.log(err);
            self.displayInfo('Server Error', "Couldn't receive data from the server.");
        });
    };

    self.displayInfo = function(title, message) {
        self.infoTitle(title);
        self.infoMessage(message);
        self.isWaiting(false);
        self.isInfo(true);
    };
};

let viewModel = new ViewModel();
ko.applyBindings(viewModel);

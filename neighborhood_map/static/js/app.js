let googleMap = {
    // Initialize variables for Google Maps API
    map: null,
    markers: new Map(),
    center: null,
    infoWindow: null,
    bounds: null,
    // Styles are stored in './google_map_styles.js' file
    styles: google_map_styles,

    createMarker: function(venue) {
        let marker = new google.maps.Marker({
            map: this.map,
            position: {
                lat: venue.lat,
                lng: venue.lng
            },
            title: venue.name,
            icon: '/static/img/icon_default.png',
            animation: google.maps.Animation.DROP
        });
        this.bounds.extend(marker.position);

        marker.addListener('mouseover', function() {
            $('li[data-venue-id="' + venue.id + '"]').addClass('focused');
            viewModel.focusMarker(venue);
        });

        marker.addListener('mouseout', function() {
            $('li[data-venue-id="' + venue.id + '"]').removeClass('focused');
            viewModel.unfocusMarker(venue);
        });

        marker.addListener('click', function() {
            viewModel.chooseVenue(venue);
        });

        return marker;
    },

    populateInfoWindow: function(marker, venue, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            let content = '<div class="iw__container">';
            content += '<div class="iw__title">' + venue.name + '</div>';
            content += '<div class="iw__content">';
            content += '<div class="iw__img__container"><img class="iw__img" src="' + venue.photo + '" alt="' + venue.name + 'picture"></div>';
            content += '<p>' + venue.address + '</p>';
            if (venue.phone) {
                content += '<p><bold>Phone : </bold>' + venue.phone + '</p>';
            }
            if (venue.url) {
                content += '<p><bold>URL : </bold><a href="' + venue.url +'">' + venue.url + '</p>';
            }
            content += '</div></div>';
            infowindow.marker = marker;
            infowindow.setContent(content);
            infowindow.open(googleMap.map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                marker.setIcon('/static/img/icon_default.png');
                infowindow.marker = null;
                viewModel.chosenVenue(null);
            });
        }
    }
};




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
    self.phone = venueItem.venue.contact.formattedPhone;
    self.url = venueItem.venue.url;
    self.id = venueItem.venue.id;
    if (venueItem.venue.featuredPhotos) {
        self.photo = venueItem.venue.featuredPhotos.items[0].prefix + '300x300';
        self.photo += venueItem.venue.featuredPhotos.items[0].suffix;
    } else {
        self.photo = "static/img/no_image.jpg";
    }
    self.formattedName = ko.computed(function() {
        if (self.name.length > 25) {
            return self.name.slice(0, 25) + '...';
        } else {
            return self.name;
        }
    });
    self.marker = null;
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
    self.chosenVenue = ko.observable();
    self.isFiltered = ko.observable(false);
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
        self.clearVenues();
        self.isWaiting(true);
        self.isInfo(false);
        $.ajax({
            url: url,
            method: 'GET',
        }).done(function(response) {
            // console.log(response.meta);
            if (response.meta.status === 'OK') {
                // console.log(response.results.location);
                googleMap.center = response.results.location;
                googleMap.map.setCenter(response.results.location);
                googleMap.bounds = new google.maps.LatLngBounds();
                const venueItems = response.results.items;
                console.log(venueItems);
                if (venueItems.length === 0) {
                    self.displayInfo('No result', "Couldn't find " + self.section() + " in this location.");
                } else {
                    for (const venueItem of venueItems) {
                        let venue = new Venue(venueItem);
                        let marker = googleMap.createMarker(venue);
                        venue.marker = marker;
                        self.venues.push(venue);
                    }
                    googleMap.map.fitBounds(googleMap.bounds);
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

    self.chooseVenue = function(venue) {
        self.chosenVenue(venue);
        viewModel.unfocusMarkers();
        venue.marker.setIcon('/static/img/icon_focus.png');
        googleMap.populateInfoWindow(venue.marker, venue, googleMap.infoWindow);
    };

    self.clearVenues = function() {
        self.venues().forEach(function(venue) {
            venue.marker.setMap(null);
            venue.marker = null;
        });
        self.venues([]);
    };

    self.toggleFilter = function() {
        self.isFiltered(!self.isFiltered());
        if (self.isFiltered()) {
            $('#sidebar-filter-btn').removeClass('btn-success').addClass('btn-danger');
            $('#sidebar-filter-btn').find('i').removeClass('fa-filter').addClass('fa-ban');
        } else {
            self.filter('');
            $('#sidebar-filter-btn').removeClass('btn-danger').addClass('btn-success');
            $('#sidebar-filter-btn').find('i').removeClass('fa-ban').addClass('fa-filter');
        }
    };

    self.filteredVenues = ko.computed(function() {
        switch (self.isFiltered()) {
        case true:
            return self.venues().filter(function(venue){
                const isFiltered = venue.name.toLowerCase().includes(self.filter().toLowerCase());
                if (isFiltered) {
                    venue.marker.setMap(googleMap.map);
                } else {
                    venue.marker.setMap(null);
                }
                return venue.name.toLowerCase().includes(self.filter().toLowerCase());
            });
        case false:
            self.venues().forEach(function(venue) {
                venue.marker.setMap(googleMap.map);
            });
            return self.venues();
        }

    });

    self.unfocusMarkers = function() {
        self.venues().forEach(function(venue){
            venue.marker.setIcon('/static/img/icon_default.png');
        });
    };

    self.focusMarker = function(venue) {
        venue.marker.setIcon('/static/img/icon_focus.png');
    };

    self.unfocusMarker = function(venue) {
        if (venue != self.chosenVenue()) {
            venue.marker.setIcon('/static/img/icon_default.png');
        }
    };

    self.displayInfo = function(title, message) {
        self.infoTitle(title);
        self.infoMessage(message);
        self.isWaiting(false);
        self.isInfo(true);
    };


};


//
// Initialize Google Maps API
//
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    googleMap.map = new google.maps.Map(document.getElementById('google-map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 14,
        styles: googleMap.styles,
        mapTypeControl: false
    });

    googleMap.infoWindow = new google.maps.InfoWindow({maxWidth: 300});
    google.maps.event.addListener(googleMap.infoWindow, 'domready', function() {

      // Reference to the DIV that wraps the bottom of infowindow
      let iwOuter = $('.gm-style-iw');
      let iwBackground = iwOuter.prev();
      iwBackground.children(':nth-child(2)').css({'display' : 'none'});
      iwBackground.children(':nth-child(4)').css({'display' : 'none'});

      // Reference to the div that groups the close button elements.
      let iwCloseBtn = iwOuter.next();
      iwCloseBtn.css({opacity: '1', border: '7px solid #494f53', 'border-radius': '13px', 'box-shadow': '0 0 5px #373a3c'});
    });


}


let viewModel = new ViewModel();
ko.applyBindings(viewModel);

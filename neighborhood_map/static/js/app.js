/**
* Default Settings for initializing the app
*/
const DEFAULT_DATA = {
    city: 'Busan',
    country: 'South Korea',
    location: {
        lat: 35.1795543,
        lng: 129.0756416
    },
    section: 'TopPicks'
};


/**
* An object stores data and functions releted with Google Maps API
*/
let googleMap = {
    // Declare variables for Google Maps API
    map: null,
    center: null,
    infoWindow: null,
    bounds: null,
    // Styles are stored in './google_map_styles.js' file
    styles: google_map_styles,


    /**
    * Create a marker for a venue
    * @param {Object} venue A Venue object
    * @return {Object} google.maps.Marker
    */
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

        // On mouseover, the marker and list item in sidebar are focused
        marker.addListener('mouseover', function() {
            $('li[data-venue-id="' + venue.id + '"]').addClass('focused');
            viewModel.focusMarker(venue);
        });

        // Add listener to remove focus
        marker.addListener('mouseout', function() {
            $('li[data-venue-id="' + venue.id + '"]').removeClass('focused');
            viewModel.unfocusMarker(venue);
        });

        // When clicked, the venue in viewModel is chosen
        marker.addListener('click', function() {
            viewModel.chooseVenue(venue);
        });

        return marker;
    },


    /**
    * Populates the infoWindow on that markers position when the marker is clicked.
    * @param {Object} marker google.maps.Marker object
    * @param {Object} venue A Venue object
    * @param {Object} infoWindow google.maps.InfoWindow object
    */
    populateInfoWindow: function(marker, venue, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Create content of the infowindow
            let content = '<div class="iw__container">';
            content += '<div class="iw__title">' + venue.name + '</div>';
            content += '<div class="iw__content">';
            content += '<div class="iw__img__container"><img class="iw__img" src="' + venue.photo + '" alt="' + venue.name + 'picture"></div>';
            content += '<p>' + venue.address + '</p>';
            // Phone and URL are only displayed when it's defined
            if (venue.phone) {
                content += '<p><bold>Phone : </bold>' + venue.phone + '</p>';
            }
            if (venue.url) {
                content += '<p><bold>URL : </bold><a href="' + venue.url +'">' + venue.url + '</p>';
            }
            content += '</div></div>';

            // Display infowindow
            infowindow.marker = marker;
            infowindow.setContent(content);
            infowindow.open(googleMap.map, marker);

            // When the infowindow is closed, remove focus on marker
            infowindow.addListener('closeclick', function() {
                marker.setIcon('/static/img/icon_default.png');
                infowindow.marker = null;
                viewModel.chosenVenue(null);
            });
        }
    }
};


/**
 * Class to represent a venue in the venues list
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
    // When photo isn't available, set default image for the venue
    if (venueItem.venue.featuredPhotos) {
        self.photo = venueItem.venue.featuredPhotos.items[0].prefix + '300x300';
        self.photo += venueItem.venue.featuredPhotos.items[0].suffix;
    } else {
        self.photo = "static/img/no_image.jpg";
    }
    // When venue name is to long to fit in sidebar, slice the name
    self.formattedName = ko.computed(function() {
        if (self.name.length > 25) {
            return self.name.slice(0, 25) + '...';
        } else {
            return self.name;
        }
    });
    // Marker is assigned after Venue is instantiated
    self.marker = null;
};




/**
* ViewModel - Knockout.js ViewModel
* @param {Object} data Data to initialize ViewModel
*/
let ViewModel = function(data) {
    const self = this;

    // Availabe section parameters for the Foursquare API
    self.availableSections = ['TopPicks', 'Food', 'Drinks', 'Coffee', 'Shops', 'Arts', 'Outdoors', 'Sights', 'Trending', 'Specials'];
    // Variables for the search venues form
    self.city = ko.observable(data.city);
    self.country = ko.observable(data.country);
    self.section = ko.observable(data.section);
    // Variables for the venue list
    self.venues = ko.observableArray([]);
    self.chosenVenue = ko.observable();
    // Variable for the filter form
    self.filter = ko.observable('');
    // Flag variables to display filter, loading image, infoMessage
    self.isFiltered = ko.observable(false);
    self.isWaiting = ko.observable(false);
    self.showInfo = ko.observable(false);
    // Variables for displaying information to user
    self.infoTitle = ko.observable('');
    self.infoMessage = ko.observable('');


    /**
    * Get venues data from server, update the ViewModel,
    * and store data in localStorage.
    */
    self.searchVenues = function() {
        // Prepare url and parameters to get data
        let address = self.city() + ', ' + self.country();
        let url = '/venues';
        url += '?' + $.param({
            'address': address,
            'section': self.section()
        });

        // Clear the list in sidebar and show loading image
        self.clearVenues();
        self.isWaiting(true);
        self.showInfo(false);

        // Fetch venues data from the server
        $.ajax({
            url: url,
            method: 'GET',
        }).done(function(response) {

            // When server returns 'OK' response, set the map center according to the response
            if (response.meta.status === 'OK') {
                googleMap.center = response.results.location;
                googleMap.map.setCenter(response.results.location);
                googleMap.bounds = new google.maps.LatLngBounds();
                const venueItems = response.results.items;
                // If server returns no venueItems, notify user
                if (venueItems.length === 0) {
                    self.displayInfo('No result', "Couldn't find " + self.section() + " in this location.");
                } else {
                    // If server returns venueItems create markers and list items
                    for (const venueItem of venueItems) {
                        let venue = new Venue(venueItem);
                        let marker = googleMap.createMarker(venue);
                        venue.marker = marker;
                        self.venues.push(venue);
                    }
                    googleMap.map.fitBounds(googleMap.bounds);
                    // Remove loading image from sidebar
                    self.isWaiting(false);
                }
                // Store the query data in localStorage
                let data = {city: self.city(), country: self.country(), location: response.results.location, section: self.section()};
                localStorage.setItem('neighborhood_map_data', JSON.stringify(data));

            } else if (response.meta.status === 'WRONG_ADDRESS') {
                // If server returns 'Location Error' response, notify user
                self.displayInfo('Location Error', "Couldn't find the location. Please specify City and Country.");

            } else {
                // If server returns other error response, notify user
                self.displayInfo('Server Error', "Couldn't receive data from the server.");
            }

        }).fail(function(err) {
            // If AJAX request fails, notify user
            self.displayInfo('Server Error', "Couldn't receive data from the server.");
        });
    };


    /**
    * When user clicked list item or marker, choose the venue accordingly
    * and show infoWindow for the venue
    * @param {Object} venue A Venue object
    */
    self.chooseVenue = function(venue) {
        self.chosenVenue(venue);
        // Remove focus on other markers
        viewModel.unfocusMarkers();
        venue.marker.setIcon('/static/img/icon_focus.png');
        googleMap.populateInfoWindow(venue.marker, venue, googleMap.infoWindow);
    };


    /**
    * Remove all venues from ViewModel and delete all markers
    */
    self.clearVenues = function() {
        self.venues().forEach(function(venue) {
            venue.marker.setMap(null);
            venue.marker = null;
        });
        self.venues([]);
    };


    /**
    * Toggle filter mode and change filter button color/icon
    */
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


    /**
    * When filter mode is on, show only filtered venues and markers
    * When off, show all venues and markers
    */
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


    /**
    * Set all markers icon as default icon
    */
    self.unfocusMarkers = function() {
        self.venues().forEach(function(venue){
            venue.marker.setIcon('/static/img/icon_default.png');
        });
    };


    /**
    * Focus the marker for a venue
    * @param {Object} venue A Venue object
    */
    self.focusMarker = function(venue) {
        venue.marker.setIcon('/static/img/icon_focus.png');
    };


    /**
    * Remove focus of marker for a venue when 'mouseout' event occured
    * @param {Object} venue A Venue object
    */
    self.unfocusMarker = function(venue) {
        // Check if the venue isn't chosen
        if (venue != self.chosenVenue()) {
            venue.marker.setIcon('/static/img/icon_default.png');
        }
    };


    /**
    * Display information on the sidebar when error occured
    * @param {string} title
    * @param {string} message
    */
    self.displayInfo = function(title, message) {
        self.infoTitle(title);
        self.infoMessage(message);
        self.isWaiting(false);
        self.showInfo(true);
    };

};



// Initialize ViewModel with data from localStorage or default settings
let data = (JSON.parse(localStorage.getItem('neighborhood_map_data')) || DEFAULT_DATA);
let viewModel = new ViewModel(data);
ko.applyBindings(viewModel);
// After initializing the ViewModel, fetch venues data from server
viewModel.searchVenues();


/**
* Google Map API callback function
* - Initialize map when the page is loaded
*/
function initMap() {
    // Creates a new map object and store it in GoogleMap object.
    googleMap.map = new google.maps.Map(document.getElementById('google-map'), {
        center: data.location,
        zoom: 14,
        styles: googleMap.styles,
        mapTypeControl: false
    });

    googleMap.infoWindow = new google.maps.InfoWindow({maxWidth: 300});

    // Customize infoWindow styles
    google.maps.event.addListener(googleMap.infoWindow, 'domready', function() {
      // Remove outer box of the infoWindow
      let iwOuter = $('.gm-style-iw');
      let iwBackground = iwOuter.prev();
      iwBackground.children(':nth-child(2)').css({'display' : 'none'});
      iwBackground.children(':nth-child(4)').css({'display' : 'none'});

      // Styles for the close button of the infoWindow
      let iwCloseBtn = iwOuter.next();
      iwCloseBtn.css({opacity: '1', border: '7px solid #494f53', 'border-radius': '13px', 'box-shadow': '0 0 5px #373a3c'});
    });

    // Event lister for display map and layout
    google.maps.event.addDomListenerOnce(googleMap.map, 'idle', function () {
        // When window is resized, redraw the map
	    google.maps.event.addDomListener(window, 'resize', function () {
	        googleMap.map.fitBounds(googleMap.bounds);
	    });

        // If window.innerWidth is larger than 991px, show sidebar
        if (window.innerWidth > 991) {
            toggleSidebar();
        }
	});

}

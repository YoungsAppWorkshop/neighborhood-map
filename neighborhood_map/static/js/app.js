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
 * ViewModel - Knockout.js ViewModel
 *
 */
let ViewModel = function() {
    const self = this;

    self.locations = locations;
};

let viewModel = new ViewModel();
ko.applyBindings(viewModel);

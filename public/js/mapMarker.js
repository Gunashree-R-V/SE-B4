var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var endMarker;

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var bengaluru = new google.maps.LatLng(12.971599, 77.594566);
    var mapOptions = {
        zoom: 7,
        center: bengaluru
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //directionsDisplay.setMap(map);
}

function dropPin() {
    // if any previous marker exists, let's first remove it from the map
    if (endMarker) {
        endMarker.setMap(null);
    }
    // create the marker
    endMarker = new google.maps.Marker({
        position: map.getCenter(),
        map: map,
        draggable: true,
    });
    copyMarkerpositionToInput();
    // add an event "onDrag"
    google.maps.event.addListener(endMarker, 'dragend', function () {
        copyMarkerpositionToInput();
    });
}

function copyMarkerpositionToInput() {
    // get the position of the marker, and set it as the value of input
    document.getElementById("end").value = endMarker.getPosition().lat() + ',' + endMarker.getPosition().lng();
}

/*function calcRoute() {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;
    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
}*/
google.maps.event.addDomListener(window, 'load', initialize);

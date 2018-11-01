function getLocation() { //onload or onclick
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, showError);
    }
    else {
        alert("Geolocation is not supported by this browser.");
    }
}
function initMap(e) {
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var busMarker = { lat: 12.908030784898909, lng: 77.56654500961304 };
    var map = new google.maps.Map(document.getElementById('map'), { //for setting up the map
        center: new google.maps.LatLng(e.coords.latitude, e.coords.longitude),
        zoom: 15,
        disableDefaultUI: true
    });
    directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    directionsDisplay.setMap(map);
    setMarkers(map, e, busMarker);
    var request = {
        origin: { lat: e.coords.latitude, lng: e.coords.longitude },
        destination: busMarker,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [{ lat: e.coords.latitude, lng: e.coords.longitude }],
        destinations: [busMarker],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
            var distance = response.rows[0].elements[0].distance.text;
            var duration = response.rows[0].elements[0].duration.text;
            var dvDistance = document.getElementById("dvDistance"); //for displaying distance and time
            dvDistance.innerHTML = "";
            dvDistance.innerHTML += "Distance: " + distance + "<br />";
            dvDistance.innerHTML += "Duration:" + duration;
        } else {
            alert("Unable to find the distance via road.");
        }
    });
}

function setMarkers(map, e, busMarker) {
    var student = new google.maps.Marker({
        position: { lat: e.coords.latitude, lng: e.coords.longitude },
        map: map,
        icon: {
            url: '/img/person.png',
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 35)
        },
        title: 'You are here',
    });
    var driver = new google.maps.Marker({
        position: busMarker,
        map: map,
        icon: {
            url: '/img/bus.png',
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 35)
        },
        title: 'Driver',
    });

}
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break;
    }
}
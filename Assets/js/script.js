// function for hamburger menu
$(".navbar-burger").click(function() {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
});

//Autocomplete function for searching cities
function addressAutocomplete() {
    let autoCompleteContainer = $('#autocomplete-container');

    var selectedItemsContainer = $('#locationsContainer');

    var currentPromiseReject;

    let inputField = $('#inputLocation')
    inputField.on('input', function () {
        var currentValue = $(this).val();
        $('.autocomplete-items').empty()

        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true
            });
        }
        if (!currentValue) {
            return false;
        }

        var promise = new Promise((resolve, reject) => {
            currentPromiseReject = reject;

            const apiKey = "52c455d9879843aea262c6319e127a66";
            let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;

            $.get(url)
                .done((data) => resolve(data))
                .fail((err) => reject(err));
        });

        promise.then(
            (data) => {
                var autocompleteItemsElement = $('<div>', {
                    class: 'autocomplete-items'
                });
                console.log(data);
                autoCompleteContainer.prepend(autocompleteItemsElement);

                data.features.forEach((feature) => {
                    var itemElement = $('<div>', {
                        class: 'autocomplete-item',
                        html: feature.properties.formatted
                    });

                    //Create a click function that saves the necessary data inside a div and appends that below the search box
                    itemElement.on('click', function () {
                    
                        var selectedItem = $('<div>', {
                                    class: 'notification is-small selected-item',
                                    html: feature.properties.formatted,
                                    "data-lat": feature.properties.lat,
                                    "data-lon": feature.properties.lon,
                                    "data-fullAddress": feature.properties.formatted
                        });
                        var removeIcon = $('<button>', {
                            class: 'delete is-medium'
                        })
                            removeIcon.on('click', function () {
                                selectedItem.remove();
                            });
                    
                        selectedItem.append(removeIcon);
                        selectedItemsContainer.append(selectedItem);
                    
                        inputField.val('');
                        $('.autocomplete-items').empty();
                    }).css('cursor', 'pointer');
                    
                    autocompleteItemsElement.append(itemElement);
                });
            },
            (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            }
        );
    });
}
// Initialize address autocomplete
addressAutocomplete();

function createLocationsArray() {
    //array where all the data will be stored
    let locationsArray = [];

    //Create a while loop the continues while the container has children
        while($('#locationsContainer').children().length > 0){
            let div = $('#locationsContainer :first-child');
            let fullAddress = div.attr("data-fullAddress");
            let latitude = parseFloat(div.attr('data-lat'));
            let longitude = parseFloat(div.attr('data-lon'));
        
        //For each child gather the data including location and name of location, storing the data in an object like the examples above 
            let nameConcat = "visit_" + fullAddress;
            let myObject = {
                "id": fullAddress,
                "name": nameConcat,
                "address": {
                    "location_id": fullAddress,
                    "lon": longitude,
                    "lat": latitude
                }
            };
        
            //Push the object to an array declared before the while loop
            locationsArray.push(myObject)
            //Remove that child from parent container
            div.remove();
        }
    return locationsArray;
}

//Function to change which tab is active in the previous search panel
function changeActiveTab(event){
    let tabs = $('.panel-tabs').children();
    for(let i = 0; i < tabs.length; i++){
        $(tabs[i]).removeClass();
    }
    $(event.target).addClass('is-active')
    loadPreviousSearches();
}

//On change event for previous search input box to 
$('#searchPrev').on('keyup', function(){
    loadPreviousSearches();
})

//Function used to load previous searches saved in local storage and display them in the previous search panel
function loadPreviousSearches(){
    let previousSearches = JSON.parse(localStorage.getItem("previousSearches"));
    if(!previousSearches){
        return;
    }
    let previousSearchDiv = $('#previousSearchContent');
    previousSearchDiv.empty();
    let searchTerm = ""

    //Check if search term has been added
    if($('#searchPrev').val()){
         searchTerm = $('#searchPrev').val();
    }
    
    //Check which tab is active
    let activeTab = $('.panel-tabs').children('.is-active').attr('data-transportType');

    //Load previous searches based on tab selected or search box
    
    for(let i = 0; i < previousSearches.length; i++){
        if(activeTab !== "all"){
            if(previousSearches[i].vehicleProfile !== activeTab){
                continue;
            } 
        }
        if(!previousSearches[i].routeInfo.routeTitle.toLowerCase().includes(searchTerm.toLowerCase())){
            continue;
        }
        
        let div = $('<div>').addClass('is-flex is-align-items-center');
        let span = $('<span>').addClass('panel-icon');
        let icon = $('<i>').addClass(previousSearches[i].routeInfo.vehicleIcon);
        span.append(icon);
        let anchor = $('<a>').addClass('panel-block is-flex is-justify-content-space-between').attr('id', 'prevSearchLi')
        anchor.attr("data-all", JSON.stringify(previousSearches[i])).css('height', "50px")
        let text = $('<h5>').text(previousSearches[i].routeInfo.routeTitle).addClass('is-6 title');
        let button = $('<button>').addClass('button is-danger').text('Remove').attr('id', "removePrevious").on('click', removeSearch);

        div.append(span, text);
        anchor.append(div, button);
        previousSearchDiv.append(anchor);

        anchor.on("click", loadSelected);
    }
}

function loadSelected(event){
    let data = JSON.parse($(event.target).attr('data-all'));
    fetchOptimizedRoute(data.routeInfo, false);
}

//Delete a selected previous search
function removeSearch(event){
    
    let removeText = $(event.target).siblings('div').children('h5').text();

    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    for(let i = 0; i < previousSearches.length; i++){
        if(previousSearches[i].routeInfo.routeTitle === removeText){
            previousSearches.splice(i, 1);
        }
    }
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));

    loadPreviousSearches();
    
}

// Function to organise all the provided data so we can call the API
function launchOptimisationRequest() {
    //Fetch inputted data

    if(!$('#routeTitle').val()){
        $('#errorMsgDiv').append($('<p>').text('Route must have a name').css("color", "red"));
        return;
    }
    let routeName = $('#routeTitle').val();
    //listOfLocations needs to be changed
    let listOfLocations = createLocationsArray();
    if(listOfLocations < 2){
        $('#errorMsgDiv').append($('<p>').text('You must add at least two locations').css('color', 'red'));
        return
    }

    let vehicleName = $('input[name="vehicleType"]:checked').attr("data-transport");
    let vehicleIcon = $('input[name="vehicleType"]:checked').attr("data-icon");
    let vehicleType = $('input[name="vehicleType"]:checked').attr("data-vehicleDesc");

    //Store all data inside an object
    let routeInfo = {
        routeTitle: routeName,
        locations: listOfLocations,
        returnToStart: true,
        vehicle: vehicleName,
        vehicleIcon: vehicleIcon,
        vehicleType: vehicleType
    }
    if(!$('#roundTripCheck').is(':checked')){
        routeInfo.returnToStart = false;
    } 
    $('#routeTitle').val("")
    fetchOptimizedRoute(routeInfo, true)
}

//Fetch the optimized route once provided with the location, vehicle type and return to origin
function fetchOptimizedRoute(routeInfo, addToLocal){
    $('#progressBar').css('display', "block");

    let vehicleTypeInfo = JSON.parse(routeInfo.vehicleType);

    let organisedData = {
        vehicles: [
            {
                vehicle_id: 'my_vehicle',
                type_id: routeInfo.vehicle,
                start_address: {
                    location_id: routeInfo.locations[0].name,
                    lon: routeInfo.locations[0].address.lon,
                    lat: routeInfo.locations[0].address.lat
                },
                return_to_depot: routeInfo.returnToStart
            }
        ],
        vehicle_types: [
            {
                profile: vehicleTypeInfo.profile,
                type_id: vehicleTypeInfo.type_id
            }
        ],
        services: [],
        configuration: {
            routing: {
                calc_points: true
            }
        }
    }

    for(let i = 1; i < routeInfo.locations.length; i++){
        organisedData.services.push(routeInfo.locations[i])
    }

    let fetchUrl = "https://graphhopper.com/api/1/vrp?key=4b8e0eda-a757-4baf-b8fd-63dcc8b828fe";

    console.log(organisedData);
    fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(organisedData)
    })
        .then(response => {
            if(!response.ok){

            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            //load all necessary data into an object to be saved to local
            let newData = {
                routeInfo: routeInfo,
                travelDistance: data.solution.distance,
                numberOfRoutes: data.solution.routes[0].activities.length,
                routes: data.solution.routes[0].activities,
                routeLines: data.solution.routes[0].points,
                routes: data.solution.routes[0].activities,
                timeToTravel: data.solution.max_operation_time,
                vehicle: data.solution.routes[0].vehicle_id,
                vehicleProfile: vehicleTypeInfo.profile,
                lengthOfTravel: data.solution.completion_time,
                totalDistance: data.solution.distance
            };
            //Store into local
            let storeInLocal = JSON.parse(localStorage.getItem('previousSearches'));
            if(addToLocal == true){
                if(!storeInLocal){
                storeInLocal = [newData];
                localStorage.setItem("previousSearches", JSON.stringify(storeInLocal))
            } else{
                storeInLocal.push(newData);
                localStorage.setItem("previousSearches", JSON.stringify(storeInLocal))

                loadPreviousSearches();
            }
            }
            loadOptimisedRoute(newData)
        })
        .catch(error => {
            console.error("Error", error)
        })
}

let markerList = [];
let polylineList = [];

function loadOptimisedRoute(data){

    markerList = [];
    polylineList = [];
    
    //Set Heading and info
    $('#optimisedHeading').text(data.routeInfo.routeTitle);
    let totalKms = Math.floor(data.totalDistance / 1000)
    $('#totalKmsMain').text(totalKms)
    $('#transportTypeMain').text(data.vehicleProfile);
    let totalMinutes = data.lengthOfTravel / 60
    let totalHours = Math.floor(totalMinutes / 60);
    let remainingMinutes = Math.floor(totalMinutes % 60);
    $('#travelTimeMain').text(totalHours + "H:" + remainingMinutes + "M");
    $('#stopsMain').text(data.routes.length);
    //Determine zoom on map
    let zoom;

    if (totalKms > 20000) {
        zoom = 3;
    } else if (totalKms > 10000) {
        zoom = 4;
    } else if (totalKms > 5000) {
        zoom = 5;
    } else if (totalKms > 1000) {
        zoom = 7;
    } else if (totalKms > 500) {
        zoom = 8;
    } else if (totalKms > 100) {
        zoom = 10;
    } else if (totalKms > 20) {
        zoom = 12;
    } else if (totalKms > 0) {
        zoom = 13;
    } else {
        zoom = 4;
    }

    //Find average position to position map
    let latitudeAvg = 0;
    let longitudeAvg = 0;
    for(let i = 0; i < data.routes.length; i++){
        latitudeAvg = latitudeAvg + data.routes[i].address.lat
        longitudeAvg = longitudeAvg + data.routes[i].address.lon
    }
    latitudeAvg = latitudeAvg / data.routes.length;
    longitudeAvg = longitudeAvg / data.routes.length;

    mainMap.setView([latitudeAvg, longitudeAvg], zoom);

    let stops = $('#stopsInOrder')
    stops.empty()
    //Append divs containing information about order of route
    for(let i = 0; i < data.routeInfo.locations.length; i++){
        generateStop(i, i, data);

        let travelMode;
        if(data.vehicleProfile == "car"){
            travelMode = "driving";
        } else if(data.vehicleProfile == "bike"){
            travelMode = "bicycling";
        } else if(data.vehicleProfile == "foot"){
            travelMode = "walking";
        }
        let googleMapsURL;
        if(data.routeInfo.locations.length != (i + 1)){
            googleMapsURL = "https://www.google.com/maps/dir/?api=1&origin=" + data.routes[i].address.lat + "," + data.routes[i].address.lon + "&destination=" + data.routes[i + 1].address.lat + "," + data.routes[i + 1].address.lon + "&travelmode=" + travelMode;
        }

        if(data.routeInfo.locations.length == (i + 1) && data.routeInfo.returnToStart == true){
            generateIcons(googleMapsURL);
            generateStop(i, 0, data);
        } else if (data.routeInfo.locations.length != (i + 1)){
            generateIcons(googleMapsURL);
        }
        //Add relevant marker to map
        var marker = L.marker([data.routes[i].address.lat, data.routes[i].address.lon]).addTo(mainMap)
        markerList.push(marker);
        //Add starting location popup
        if(i == 0){ 
            marker.bindPopup('Start Here').openPopup();
        }
    }
    
    
    //Organise polyline data to be added to map
    for(let j = 0; j < data.routeLines.length; j++){
    let latLng = []
        for(let i = 0; i < data.routeLines[j].coordinates.length; i++){
        let coord = []
        coord.push(data.routeLines[j].coordinates[i][1]);
        coord.push(data.routeLines[j].coordinates[i][0]);
        latLng.push(coord)
        }
    var polyline = L.polyline(latLng, {color: 'red'}).addTo(mainMap);
    polylineList.push(polyline);
    }
    
   $('#progressBar').css("display", "none")
}

function generateStop(position, num, data){
    let stopContainer =  $('<div>').addClass('is-flex is-align-items-center is-justify-content-center');
    let numberIconContainer = $('<span>').addClass('icon is-large is-align-self-flex-start').append($('<i>').addClass('has-text-white fa-solid fa-' + (position + 1)));
            
    let stopDiv = $('<div>').addClass('box blueDarkest').append($('<h6>').addClass('is-6 title has-text-white').text(data.routeInfo.locations[num].id));

    stopContainer.append(numberIconContainer, stopDiv)
    $('#stopsInOrder').append(stopContainer);
 }

 function generateIcons(url){
    let iconDiv = $('<a>').addClass("icon is-large").append($('<i>').addClass('fa-solid fa-arrow-down has-text-white'));

    let navDiv = $('<a>').addClass("icon is-large").append($('<i>').addClass('fa-solid fa-route has-text-white')).attr('href', url);

    $('#stopsInOrder').append(iconDiv, navDiv);
 }

//Load default map view
var mainMap = L.map('mainMap').setView([53.552, 9.999], 7);

//Load map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

}).addTo(mainMap);

//If the user has not previously saved data to the local storage, generate a preset list of routes
let storageExists = JSON.parse(localStorage.getItem("previousSearches"));
if(!storageExists){
    let previousSearchPresets = []

    localStorage.setItem('previousSearches', JSON.stringify(previousSearchPresets));

    listOfPresets = ["Assets/Pre-Loaded Searches/AustraliaTrip.json", "Assets/Pre-Loaded Searches/Rome.json", "Assets/Pre-Loaded Searches/KFCTour.json", "Assets/Pre-Loaded Searches/londonWalk.json", "Assets/Pre-Loaded Searches/NewYorkWalk.json"]

    for(let i = 0; i < listOfPresets.length; i++){
        fetch(listOfPresets[i])
            .then(response => response.text())
            .then(data => {
                let handledData = JSON.parse(data)
                let currentList = JSON.parse(localStorage.getItem('previousSearches'));
                currentList.push(handledData)
                localStorage.setItem('previousSearches', JSON.stringify(currentList));

                loadPreviousSearches();
                
                if(i == listOfPresets.length - 1){
                    loadLastSearch();
                }
            })
            .catch(error => {
                console.error('Error fetching', error)
            })
    }
}

function loadLastSearch(){
    let lastSearch = JSON.parse(localStorage.getItem("previousSearches"));
    if(!lastSearch){
        return
    }
    console.log(lastSearch)
    fetchOptimizedRoute(lastSearch[0].routeInfo, false);

}

loadLastSearch();
//fetchOptimizedRoute(routeInfo);
loadPreviousSearches();

const apiKey = "f2d980e6-252a-4c7f-afce-e9ba8b9e15ff";


// Array to store submitted locations
let locations = [];

// Function to add a location to the array
function addLocation() {

    // Check if the number of locations is less than 5
    if (locations.length < 5) {
        const locationInput = document.getElementById('locationInput');

        // Trim and convert the location to uppercase
        const location = locationInput.value.trim().toUpperCase();

        // Check if the location is not empty
        if (location !== '') {

            // Add the location to the array
            locations.push(location);
            locationInput.value = ''; // Clear the input field
            updateSubmittedLocations(); // Update the displayed locations
        }
    }
}


async function fetchSearchHits(title) {
    const query = new URLSearchParams({
        q: title,
        locale: 'en',
        limit: '5',
        reverse: 'false',
        debug: 'false',
        provider: 'default',
        key: apiKey
      }).toString();
    const resp = await fetch(
    `https://graphhopper.com/api/1/geocode?${query}`,
    {method: 'GET'}
  );
  
  const data = await resp.text();
}
fetchSearchHits("london");

function updateSubmittedLocations() {
    const submittedLocationsContainer = document.getElementById('submittedLocations');
    submittedLocationsContainer.innerHTML = ''; // Clear existing content

    // Loop through each location in the array
    locations.forEach((location, index) => {
        const locationElement = document.createElement('div');
        locationElement.classList.add('column', 'is-half', 'is-one-third-desktop');
        locationElement.innerHTML = `<div class="notification">${index + 1}. ${location}</div>`;
        submittedLocationsContainer.appendChild(locationElement); 
        // Add location to the container
    });
}
//This is just an example array for locations
let sumLocations =  [{
     "id": "hamburg",
     "name": "visit_hamburg",
     "address": {
       "location_id": "hamburg",
       "lon": 9.999,
       "lat": 53.552
     }
   },
   {
     "id": "munich",
     "name": "visit_munich",
     "address": {
       "location_id": "munich",
       "lon": 11.570,
       "lat": 48.145
     }
   },
   {
     "id": "cologne",
     "name": "visit_cologne",
     "address": {
       "location_id": "cologne",
       "lon": 6.957,
       "lat": 50.936
     }
   },
   {
     "id": "frankfurt",
     "name": "visit_frankfurt",
     "address": {
       "location_id": "frankfurt",
       "lon": 8.670,
       "lat": 50.109
     }
   }]

// Function to organise all the provided data so we can call the API
function launchOptimisationRequest() {
    //Fetch inputted data
    let routeName = $('#routeTitle').val();
    //listOfLocations needs to be changed
    let listOfLocations = sumLocations;
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

    console.log(routeInfo)
    
    fetchOptimizedRoute(routeInfo)
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
    let previousSearchDiv = $('#previousSearchContent');
    previousSearchDiv.empty();
    let searchTerm = ""

    //Check if search term has been added
    if($('#searchPrev').val()){
         searchTerm = $('#searchPrev').val();
    }
    
    //Check which tab is active
    let activeTab = $('.panel-tabs').children('.is-active').text();

    
    //Load previous searches based on tab selected or search box
    for(let i = 0; i < previousSearches.length; i++){
        if(activeTab !== "All"){
            if(previousSearches[i].vehicleProfile !== activeTab.toLowerCase()){
                continue;
            }
        }
        console.log(previousSearches[i].routeName, searchTerm)
        if(!previousSearches[i].routeName.toLowerCase().includes(searchTerm.toLowerCase())){
            continue;
        }
        
        let div = $('<div>')
        let span = $('<span>').addClass('panel-icon');
        let icon = $('<i>').addClass(previousSearches[i].vehicleIcon);
        span.append(icon);
        let anchor = $('<a>').addClass('panel-block is-flex is-justify-content-space-between').attr('id', 'prevSearchLi')
        anchor.attr("data-all", previousSearches[i])
        let text = $('<p>').text(previousSearches[i].routeName);
        let button = $('<button>').addClass('button is-danger').text('Remove').attr('id', "removePrevious").on('click', removeSearch);
        div.append(span, text)
        anchor.append(div, button);
        previousSearchDiv.append(anchor);
    }


}


//Delete a selected previous search
function removeSearch(event){
    let removeText = $(event.target).siblings('div').children('p').text();

    let previousSearches = JSON.parse(localStorage.getItem('previousSearches'));

    for(let i = 0; i < previousSearches.length; i++){
        if(previousSearches[i].routeName === removeText){
            previousSearches.splice(i, 1);
        }
    }
    
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));

    loadPreviousSearches();
}


//Fetch the optimized route once provided with the location, vehicle type and return to origin
function fetchOptimizedRoute(routeInfo){
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
                return_to_depot: routeInfo.returnToOrigin
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


    fetch(fetchUrl, {
        method: 'POST', //GET is the default.
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
                routeName: routeInfo.routeTitle,
                travelDistance: data.solution.distance,
                numberOfRoutes: data.solution.routes[0].activities.length,
                routes: data.solution.routes[0].activities,
                timeToTravel: data.solution.max_operation_time,
                vehicle: data.solution.routes[0].vehicle_id,
                vehicleIcon: routeInfo.vehicleIcon,
                vehicleType: routeInfo.vehicle,
                vehicleProfile: vehicleTypeInfo.profile
            };
            //Store into local
            let storeInLocal = JSON.parse(localStorage.getItem('previousSearches'));

            if(!storeInLocal){
                storeInLocal = [newData];
                localStorage.setItem("previousSearches", JSON.stringify(storeInLocal))
            } else{
                storeInLocal.push(newData);
                localStorage.setItem("previousSearches", JSON.stringify(storeInLocal))
            }
            loadPreviousSearches();
        })
        .catch(error => {
            console.error("Error", error)
        })
}

//fetchOptimizedRoute(routeInfo);
 
loadPreviousSearches();
//Set up map

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




const apiKey = "f2d980e6-252a-4c7f-afce-e9ba8b9e15ff";



let exampleObjects = [
    {
        transportMode: "Car",
        nameOfRoute: "Berlin",
        totalStops: 5,
        icon: "fa-solid fa-car"
    },
    {
        transportMode: "Bike",
        nameOfRoute: "Rome",
        totalStops: 5,
        icon: "fa-solid fa-bicycle"
    },
    {
        transportMode: "Walk",
        nameOfRoute: "Amsterdam",
        totalStops: 5,
        icon: "fa-solid fa-person-walking"
    },
    {
        transportMode: "Walk",
        nameOfRoute: "Amsterdam",
        totalStops: 5,
        icon: "fa-solid fa-person-walking"
    },
    {
        transportMode: "Walk",
        nameOfRoute: "Amsterdam",
        totalStops: 5,
        icon: "fa-solid fa-person-walking"
    },
    {
        transportMode: "Walk",
        nameOfRoute: "Amsterdam",
        totalStops: 5,
        icon: "fa-solid fa-person-walking"
    }
]

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
        submittedLocationsContainer.appendChild(locationElement); // Add location to the container
    });
}

// Function to generate something based on the submitted locations
function generateLocations() {

    // We will add something else later .......
    alert('Generating locations: ' + JSON.stringify(locations));
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

//Function used to load previous searches saved in local storage and display them in the previous search panel
function loadPreviousSearches(){
    let previousSearches = exampleObjects;
    let previousSearchDiv = $('#previousSearchContent');
    previousSearchDiv.empty();

    //Check if search term has been added
    if($('#searchPrev').val()){
        let searchTerm = $('#searchPrev').val();
    }
    
    //Check which tab is active
    let activeTab = $('.panel-tabs').children('.is-active').text();

    
    //Load previous searches based on tab selected or search box
    for(let i = 0; i < previousSearches.length; i++){
        if(activeTab !== "All"){
            if(previousSearches[i].transportMode !== activeTab){
                continue;
            }
        }
        
        let span = $('<span>').addClass('panel-icon');
        let icon = $('<i>').addClass(previousSearches[i].icon);
        span.append(icon);
        let anchor = $('<a>').addClass('panel-block')
        let text = $('<p>').text(previousSearches[i].nameOfRoute);
        let input = $('<input>').attr('type', 'checkbox').addClass('is-right');
        anchor.append(span, text, input);
        previousSearchDiv.append(anchor);
    }

}

//Example of how location data will be organised
// {
//             id: "hamburg",
//             name: "visit_hamburg",
//             address: {
//             location_id: "hamburg",
//             lon: 9.999,
//             lat: 53.552
//             }
//         }

//Function to fetch the optimized data 

fetchOptimizedRoute(sumLocations, doIReturn, daVehicle);


//Fetch the optimized route once provided with the location, vehicle type and return to origin
function fetchOptimizedRoute(locations, returnToOrigin, vehicleType){
    let organisedData = {
        vehicles: [
            {
                vehicle_id: 'my_vehicle',
                start_address: {
                    location_id: locations[0].name,
                    lon: locations[0].address.lon,
                    lat: locations[0].address.lat
                },
                return_to_depot: returnToOrigin
            }
        ],
        services: []
    }


    for(let i = 1; i < locations.length; i++){
        organisedData.services.push(locations[i])
    }

    console.log(organisedData)

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
        })
        .catch(error => {
            console.error("Error", error)
        })

}

 
loadPreviousSearches();
//Set up map

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




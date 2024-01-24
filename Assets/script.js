


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

loadPreviousSearches();
//Set up map

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

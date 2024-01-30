function addressAutocomplete() {
    let autoCompleteContainer = $('#autocomplete-container');

    var selectedItemsContainer = $('<div>', {
        class: 'selected-items-container'
    });
    autoCompleteContainer.append(selectedItemsContainer);

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

                autoCompleteContainer.prepend(autocompleteItemsElement);

                data.features.forEach((feature, index) => {
                    var itemElement = $('<div>', {
                        class: 'autocomplete-item',
                        html: feature.properties.formatted
                    });

                    //Create a click function that saves the necessary data inside a div and appends that below the search box
                    itemElement.on('click', function () {
                       
                        var selectedItem = $('<div>', {
                                    class: 'selected-item box is-small',
                                    html: feature.properties.formatted,
                                    "data-lat": feature.properties.lat,
                                    "data-lon": feature.properties.lon,
                                    "data-cityName": feature.properties.city
                        });
                        var removeIcon = $('<span>', {
                            class: 'button is-small is-danger ml-2',
                        }).append($('<i>', {
                                        class: 'fa-solid fa-trash-can'      
                                    })
                                );
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
// Initialize address autocomplete with the specified container, callback, and options
addressAutocomplete();

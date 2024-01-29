function addressAutocomplete(containerElement, callback, options) {
    var inputElement = $('<input>', {
        type: 'text',
        placeholder: options.placeholder,
    }).addClass('input');

    containerElement.append(inputElement);

    var clearButton = $('<div>', {
        class: 'clear-button'
    });

    var selectedItemsContainer = $('<div>', {
        class: 'selected-items-container'
    });
    containerElement.append(selectedItemsContainer);

    var currentItems;
    var currentPromiseReject;

    inputElement.on('input', function () {
        var currentValue = $(this).val();
        closeDropDownList();

        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true
            });
        }

        if (!currentValue) {
            clearButton.removeClass('visible');
            return false;
        }

        clearButton.addClass('visible');
        var promise = new Promise((resolve, reject) => {
            currentPromiseReject = reject;

            const apiKey = "52c455d9879843aea262c6319e127a66";
            let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;


            if (options.type) {
                url += `&type=${options.type}`;
            }
            $.get(url)
                .done((data) => resolve(data))
                .fail((err) => reject(err));
        });

        promise.then(
            (data) => {
                currentItems = data.features;
                var autocompleteItemsElement = $('<div>', {
                    class: 'autocomplete-items'
                });

                containerElement.prepend(autocompleteItemsElement);

                data.features.forEach((feature, index) => {
                    var itemElement = $('<div>', {
                        class: 'autocomplete-item',
                        html: feature.properties.formatted
                    });

                    // just testing up to 2 locations
                    itemElement.on('click', function () {
                        var coordinates = feature.geometry.coordinates;
                    
                        // Save latitude and longitude data in hidden input fields
                        for (let i = 1; i <= 8; i++) {
                            if (!$("#coordinates" + i).val()) {
                                $("#coordinates" + i).val(JSON.stringify(coordinates));
                    
                                var selectedItem = $('<div>', {
                                    class: 'selected-item box is-small',
                                    html: feature.properties.formatted
                                });
                    
                                var removeIcon = $('<span>', {
                                    class: 'button is-small is-danger ml-2',
                                }).append(
                                    $('<i>', {
                                        class: 'fa-solid fa-trash-can',                        
                                    })
                                );
                    
                                removeIcon.on('click', function () {
                                    removeSelectedItemAt(selectedItem, index);
                                });
                    
                                selectedItem.append(removeIcon);
                                selectedItemsContainer.append(selectedItem);
                    
                                inputElement.val('');
                                clearButton.removeClass('visible');
                                closeDropDownList();
                    
                                callback(currentItems[index]);
                                break; // Exit the loop after adding the selected item
                            }
                        }
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
    function closeDropDownList() {
        var autocompleteItemsElement = containerElement.find(".autocomplete-items");
        if (autocompleteItemsElement.length) {
            autocompleteItemsElement.remove();
        }

        focusedItemIndex = -1;
    }  

    function removeSelectedItemAt(selectedItem, index) {
        var coordinatesInput = $("#coordinates" + (index + 1));
    
        selectedItem.hide();
        coordinatesInput.val('');
    }
    
    $(document).on("click", function (e) {
        if (e.target !== inputElement[0]) {
            closeDropDownList();
        } else if (!containerElement.find(".autocomplete-items").length) {
            var event = new Event('input', {
                bubbles: true,
                cancelable: true
            });
            inputElement[0].dispatchEvent(event);
        }
    });
}

// Initialize address autocomplete with the specified container, callback, and options
addressAutocomplete($("#autocomplete-container"), (data) => {
    if (data) {
        console.log("Selected data:", data);
    }
}, {
    placeholder: "Enter the address here (up to 8)"
});

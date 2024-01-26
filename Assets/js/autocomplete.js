function addressAutocomplete(containerElement, callback, options) {
    // Create input element using jQuery
    var inputElement = $('<input>', {
        type: 'text',
        placeholder: options.placeholder,
    }).addClass('input');

    // Append the input element to the container
    containerElement.append(inputElement);

    // Create clear button using jQuery
    var clearButton = $('<div>', {
        class: 'clear-button'
    });

    // Add an icon to the clear button
    addIcon(clearButton);

    // Handle click event for clearing input
    clearButton.on('click', function (e) {
        e.stopPropagation();
        inputElement.val('');
        callback(null);
        clearButton.removeClass('visible');
        closeDropDownList();
    });

    // Append clear button to the container
    containerElement.append(clearButton);

    // Create container for selected items
    var selectedItemsContainer = $('<section>', {
    }).append($('<ol>'));

    // Append selected items container to the container
    containerElement.append(selectedItemsContainer);

    var currentItems;
    var currentPromiseReject;
    var focusedItemIndex;

    // Handle input event for autocomplete functionality
    inputElement.on('input', function (e) {
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

        // Fetch data from Geoapify API
        var promise = new Promise((resolve, reject) => {
            currentPromiseReject = reject;

            const apiKey = "52c455d9879843aea262c6319e127a66";
            const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;

            if (options.type) {
                url += `&type=${options.type}`;
            }

            // Use jQuery to make the AJAX request
            $.get(url)
                .done((data) => resolve(data))
                .fail((err) => reject(err));
        });

        promise.then(
            // Handle successful response
            (data) => {
                currentItems = data.features;

                // Create autocomplete items container
                var autocompleteItemsElement = $('<div>', {
                    class: 'autocomplete-items'
                });

                // Append autocomplete items container to the container
                containerElement.prepend(autocompleteItemsElement);

                // Iterate over data features and create items
                data.features.forEach((feature, index) => {
                    var itemElement = $('<div>', {
                        html: feature.properties.formatted
                    });

                    // Handle click event for selecting an item
                    itemElement.on('click', function (e) {
                        if (selectedItemsContainer.children().length < 5) {
                            var selectedItem = $('<li>', {
                                html: feature.properties.formatted
                            });
                            // Append selected item to the container
                            selectedItemsContainer.find('ol').append(selectedItem);

                            inputElement.val('');
                            clearButton.removeClass('visible');
                            closeDropDownList();

                            // Invoke the callback with the selected item data
                            callback(currentItems[index]);
                        } else {
                            console.log("Container is full");
                        }
                    }).css('cursor', 'pointer');

                    // Append item to autocomplete items container
                    autocompleteItemsElement.append(itemElement);
                });
            },
            // Handle error response
            (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            }
        );
    });

    // Handle keyboard navigation
    inputElement.on('keydown', function (e) {
        var autocompleteItemsElement = containerElement.find(".autocomplete-items");
        if (autocompleteItemsElement.length) {
            var itemElements = autocompleteItemsElement.find("div");
            if (e.key === "ArrowDown") {
                e.preventDefault();
                focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
                setActive(itemElements, focusedItemIndex);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : (focusedItemIndex = itemElements.length - 1);
                setActive(itemElements, focusedItemIndex);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    // Register the selected item and close the dropdown
                    var selectedItem = $('<li>', {
                        html: currentItems[focusedItemIndex].properties.formatted
                    });
                    selectedItemsContainer.find('ol').append(selectedItem);

                    inputElement.val('');
                    clearButton.removeClass('visible');
                    closeDropDownList();

                    // Invoke the callback with the selected item data
                    callback(currentItems[focusedItemIndex]);
                }
            }
        } else {
            if (e.key === "ArrowDown") {
                var event = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                inputElement[0].dispatchEvent(event);
            }
        }
    });

    // Set the active state for autocomplete items
    function setActive(items, index) {
        if (!items || !items.length) return false;

        items.removeClass("autocomplete-active");
        items.eq(index).addClass("autocomplete-active");

        inputElement.val(currentItems[index].properties.formatted);
        callback(currentItems[index]);
    }

    // Close the autocomplete dropdown
    function closeDropDownList() {
        var autocompleteItemsElement = containerElement.find(".autocomplete-items");
        if (autocompleteItemsElement.length) {
            autocompleteItemsElement.remove();
        }

        focusedItemIndex = -1;
    }

    // Add an icon to a button element
    function addIcon(buttonElement) {
        var iconElement = $('<i>');
        buttonElement.append(iconElement);
    }

    // Close the autocomplete dropdown when clicking outside the input element
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
    console.log("Selected option: ");
    console.log(data);
}, {
    placeholder: "Enter the address here (up to 5)"
});


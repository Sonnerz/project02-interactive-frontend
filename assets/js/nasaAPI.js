// APOD ================================================================================== //
var url = "https://api.nasa.gov/planetary/apod?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ";

$.ajax({
    url: url,
    success: function(result) {
        if ("copyright" in result) {
            $("#copyright").text("Image Credits: " + result.copyright); //Get copyright information and display
        }
        else {
            $("#copyright").text("Image Credits: " + "Public Domain"); //No copyright information, display 'Public Domain'
        }

        if (result.media_type == "video") {
            $("#apod_img_id").css("display", "none"); //If type video...
            $("#apod_vid_id").attr("src", result.url);
        }
        else {
            $("#apod_vid_id").css("display", "none"); //If type image...
            $("#apod_img_id").attr("src", result.url);
        }
        $("#apod_explaination").text(result.explanation); //Image explanation
        $("#apod_title").text(result.title); //Image title

        var varDateString = splitDate(result.date, 1); //Show date of image with Month name. 1 = get Month name

        $("#apod_date").text(varDateString.day + " " + varDateString.month + " " + varDateString.year);
    }
});


// EPIC WITH ONE ITEM PER PAGE  - PAGING ================================================================================== //

var pageList = new Array();
var currentPage = 1;
var numberPerPage = 1;
var numberOfPages = 1; // calculates the total number of pages
var currentImageNumber = 1;
var numberOfImages = 1;

// Function called from Submit button
// Call made to EPIC API. Result Object returned
// Result object sent to getResultItems() for looping and rendering to HTML
function getEpicImageByDate() {
    if (document.getElementById("formDate").value !== "") {
        document.getElementById("errorMessage").innerHTML = ""; //clear div between refreshes
        let varDate = document.getElementById("formDate").value; //Get user date input via form
        let objDateSplitUp = splitDate(varDate, 0); //objDateSplitUp is an object containing year, month, day
        let varImageType = document.querySelector('input[name="imageType"]:checked').value; //get image type from form
        let varDataCol = document.getElementById("dataCol");
        let varImageCol = document.getElementById("imageCol");

        // START OF GET DATA USING FETCH
        if (varImageType === "enhanced") {
            let url = fetch("https://api.nasa.gov/EPIC/api/enhanced/date/" + varDate + "?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ") //call to API for enhanced images on a specified date
                .then(function(response) {
                    if (response.ok) {
                        return response.json(); // parses response to JSON
                    }
                    throw new Error('There was a problem connecting to NASA. Please try again later.'); //catch connection errors
                }).then(function(result) {
                    varDataCol.innerHTML = ""; //clear div between refreshes
                    varImageCol.innerHTML = ""; //clear div between refreshes
                    document.getElementById('resultStatus').innerHTML = ""; //clear div between refreshes

                    let totalResultCount = result.length; //get total count of results returned
                    document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>There were <span>" + totalResultCount + "</span> enhanced images found for <span>" +
                        objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year + "</span></p>"; //Results message to site user

                    if (result.length !== 0) {
                        // Send result object to function 'pageTheResult()' to slice the object for paging
                        let pagedResultEnhanced = pageTheResult(result);
                        // Send the sliced object to 'getResultItems()' for looping and rendering to HTML
                        getResultItems(pagedResultEnhanced, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount);
                    }
                    else {
                        $('#epicResultsContainer').show();
                        $('#pagingRow').hide();
                        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
                            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
                    }
                }).catch(function(error) {
                    console.log('Error in NASA EPIC enhanced request.', error.message);
                });
        }
        else if (varImageType === "natural") {
            let url = fetch("https://api.nasa.gov/EPIC/api/natural/date/" + varDate + "?api_key=pyZKDq8cb4x1dJi0dsodTT9PBoWkQaa5CgxmPAxZ") //call to API for natural images on a specified date
                .then(function(response) {
                    if (response.ok) {
                        return response.json(); // parses response to JSON
                    }
                    throw new Error('There was a problem connecting to NASA. Please try again later.'); //catch connection errors
                }).then(function(result) {
                    varDataCol.innerHTML = ""; //clear div between refreshes
                    varImageCol.innerHTML = ""; //clear div between refreshes
                    document.getElementById('resultStatus').innerHTML = ""; //clear div between refreshes

                    let totalResultCount = result.length; //Get total count of results returned
                    document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>There were <span>" + totalResultCount + "</span> natural images found for <span>" +
                        objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year + "</span></p>"; //Results message to site user

                    if (result.length !== 0) {
                        // Send result object to function 'pageTheResult()' to slice the object for paging
                        let pagedResultNatural = pageTheResult(result);

                        // Send the sliced object to 'getResultItems()' for looping and rendering to HTML
                        getResultItems(pagedResultNatural, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount);
                    }
                    else {
                        $('#epicResultsContainer').show();
                        $('#pagingRow').hide();
                        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
                            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
                    }
                }).catch(function(error) {
                    console.log('Error in NASA EPIC natural request.', error.message);
                });

        }
        // END OF GET DATA USING FETCH
    }
    else {
        document.getElementById("errorMessage").textContent = "Please enter a date to search.";
    }

} //end of getEpicImageByDate()

// Start get data items from API result
// Render data to HTML
function getResultItems(result, varImageType, objDateSplitUp, varDataCol, varImageCol, totalResultCount) {
    if (result.length !== 0) {
        $('#epicResultsContainer').show(); // Results div hidden when page loads. Show for results.
        result.forEach(function(item) {
            let epicImageTypeUrl = "https://epic.gsfc.nasa.gov/archive/" + varImageType + "/" + objDateSplitUp.year + "/" + objDateSplitUp.month + "/" + objDateSplitUp.day + "/jpg/" + item.image + ".jpg";
            let distanceToSun = dscovrDistance(item.dscovr_j2000_position.x, item.dscovr_j2000_position.y, item.dscovr_j2000_position.z, item.sun_j2000_position.x, item.sun_j2000_position.y, item.sun_j2000_position.z).toLocaleString();
            let distanceToEarth = dscovrDistance(0, 0, 0, item.dscovr_j2000_position.x, item.dscovr_j2000_position.y, item.dscovr_j2000_position.z).toLocaleString();
            //Text data
            varDataCol.innerHTML += "<div class='imageData'>" +
                "<div><strong>Image name:</strong> " + item.image + ".jpg</div>" +
                "<div>" + item.caption + "</div>" +
                "<div><strong>Centroid coordinates: </strong>Lat: " + item.centroid_coordinates.lat + ", Lon: " + item.centroid_coordinates.lon + "</div>" +
                "<div><a href='https://www.google.ie/maps/@" + item.centroid_coordinates.lat + "," + item.centroid_coordinates.lon + ",4z' target='_blank'>View this location on Google Maps</a> <i class='fa fa-external-link' aria-hidden='true'></i></div>" +
                "<div><strong>Dscovr distance to the Sun:</strong> " + distanceToSun + "km</div>" +
                "<div><strong>Dscovr distance from the Earth:</strong> " + distanceToEarth + "km</div>" +
                "<div><a href='" + epicImageTypeUrl + "' target='blank'>View full size image</a>  <i class='fa fa-external-link' aria-hidden='true'></i></div>" +
                "<div class='mt-3'><b>Showing image: </b>" + currentImageNumber + " of " + totalResultCount + "</div>" +
                "</div>";

            //Images natural and enhanced
            varImageCol.innerHTML += "<div class='earthImage'>" +
                "<img id='imageID' src='" + epicImageTypeUrl + "'/>" +
                "</div>";
        });
    }
    else {
        document.getElementById('resultStatus').innerHTML += "<p class='text-faded'>Please note images were not captured before 01 September 2015 or there were no images captured for the date: " +
            +objDateSplitUp.day + "-" + objDateSplitUp.month + "-" + objDateSplitUp.year;
        $('#pagingRow').hide();
    }

} //End get data items from API result

// Paging the result to one item per page
function pageTheResult(resultApiResponse) {
    numberOfPages = getNumberOfPages(resultApiResponse);
    numberOfImages = resultApiResponse.length;

    var begin = ((currentPage - 1) * numberPerPage);
    var end = begin + numberPerPage;

    pageList = resultApiResponse.slice(begin, end);
    check();
    return pageList;
}

// Get total number of items returned from API
function getNumberOfPages(resultApiResponse) {
    return Math.ceil(resultApiResponse.length / numberPerPage);
}

// Next Button
function nextPage() {
    currentPage += 1;
    currentImageNumber += 1;
    getEpicImageByDate();
}

// Previous Button
function previousPage() {
    currentPage -= 1;
    currentImageNumber -= 1;
    getEpicImageByDate();
}

// First Item Button
function firstPage() {
    currentPage = 1;
    currentImageNumber = 1;
    getEpicImageByDate();
}

// Last Item Button
function lastPage() {
    currentPage = numberOfPages;
    currentImageNumber = numberOfImages;
    getEpicImageByDate();
}

// Enable/Disable paging buttons if necessary
function check() {
    document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
    document.getElementById("previous").disabled = currentPage == 1 ? true : false;
    document.getElementById("first").disabled = currentPage == 1 ? true : false;
    document.getElementById("last").disabled = currentPage == numberOfPages ? true : false;
}



// NASA IMAGE AND VIDEO LIBRARY ================================================================================== //
function getQueryText() {
    document.getElementById("errorMessage").textContent = "";
    var varLibraryQuery = document.getElementById("searchLibraryText").value; //Get user date input via form
    var varMediaType = document.querySelector('input[name="mediaType"]:checked').value;
    if (varLibraryQuery !== "") {
        searchNASALibrary(varLibraryQuery, varMediaType);
    }
    else {
        document.getElementById("errorLibraryMessage").innerHTML = "Please enter text to search the NASA Library.";
    }
}

function searchNASALibrary(searchLibraryText, varMediaType) {
    var varLibraryResult = document.getElementById("libraryResults");
    var varthumbnailContainer = document.getElementById("libraryThumbnailResults");

    var xhr = new XMLHttpRequest();
    var url = "https://images-api.nasa.gov/search?q=" + searchLibraryText + "&media_type=" + varMediaType;

    xhr.open("GET", url);
    xhr.send();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var varNasaLibraryData = JSON.parse(this.responseText); //write out responseText as json object
            //console.log(varNasaData);
            varLibraryResult.innerHTML = ""; //clear div between refreshes
            varthumbnailContainer.innerHTML = ""; //clear div between refreshes
            document.getElementById("errorLibraryMessage").innerHTML = ""; //clear div between refreshes

            var varTotalLibraryHits = varNasaLibraryData.collection.metadata.total_hits;
            document.getElementById('totalLibraryHits').innerHTML = varTotalLibraryHits; //total number of hits returned by call to API for search query
            if (varTotalLibraryHits !== 0) {
                getLibraryResultsData(varNasaLibraryData, varMediaType);
            }
            else {
                document.getElementById("errorLibraryMessage").innerHTML = "There were no <strong>" + varMediaType + "</strong> results for <strong>" + searchLibraryText + "</strong>";
                $('#searchResultsContainer').hide();
            }
        }
    };
}

function getLibraryResultsData(queryResponseData, varMediaType) {
    var resultObj = queryResponseData.collection; // Get result collection
    var itemsArray = resultObj.items; // Get items array

    if (varMediaType === "image") {
        $('#searchResultsContainer').show(); // Results div hidden when page loads. Show for results.
        itemsArray.forEach(function(item) { // Items: data, href, links, we need data[{}] array
            var itemsDataObj = item.data; // Data object
            var itemsLinkObj = item.links; // Links object

            itemsDataObj.forEach(function(item) {
                var varTruncatedDataDescription = item.description.substring(0, 30)
                document.getElementById('libraryResults').innerHTML += "<div class='dataDetails'>Centre: " + item.center + "</div>" +
                    "<div class='dataDetails'>Date created: " + item.date_created + "</div>" +
                    "<div class='dataDetails'>Description: " + varTruncatedDataDescription + "</div>" +
                    "<div class='dataDetails'>Nasa id: " + item.nasa_id + "</div>" +
                    "<div class='dataDetails'>Title: " + item.title + "</div>";

                itemsLinkObj.forEach(function(item) {
                    //console.log(item.description, typeof(item));
                    document.getElementById('libraryThumbnailResults').innerHTML += "<div class='image'>" +
                        "<img alt='item.href' id='imageID' src='" + item.href + "'/>" +
                        "</div>" +
                        "<div><br><br></div>";
                });
            });

        });
    }
    else if (varMediaType === "video") {
        console.log("video");
    }
    else if (varMediaType === "audio") {
        console.log("audio");
    }
}
currentDate = moment().format("M/D/YYYY");
let city;
// Gets data from OpenWeather API for current day weather and calls function to display data.
function getCurrentData(city) {
    fetch("http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=1c5b19324e572588393a1d757d289a9e").then(function(response) {
    if (response.ok) {
        response.json().then(function(data) {
            displayData(data)
        });
    } else {
        $(".right-side").hide()
        alert("City not found");
    }
    })
    .catch(function(error) {
        alert("Problem occured")
    })
};

// Function used to convert Kelvin to Fahrenheit.
function kelvinToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * 1.8 + 32)
}

// Used to find average of humidity and temperature of each of five day forecasts.
function averageTemp(temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8) {
    average = (temp1 + temp2 + temp3 + temp4 + temp5 + temp6 + temp7 + temp8) / 8;
    return average;
}

// Gets data for five day forecast and calls function to display the data.
function getFiveDayForecastData(city) {
    fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=1c5b19324e572588393a1d757d289a9e").then(function(response) {
        response.json().then(function(data2) {
            displayFiveDayForecast(data2)
        })
    })
}

let index;
let startingIndex;
 // Displays the given five day forecast data and the icon for the day.
function displayFiveDayForecast(data) {
    for (index = 0; index < 9; index++) {
        if (moment().format("DD") != data['list'][index]['dt_txt'].slice(8, 10)) {
            startingIndex = index;
            break;
        }
    }
    for (let k = startingIndex + 5; k < 40; k += 8) {
        if (data['list'][k]['weather'][0]['main'] == "Clouds") {
            $(".five-day-cloud").eq((k - 5)/8).show()
            $(".five-day-sun").eq((k - 5) / 8).hide()
            $(".five-day-rain").eq((k - 5) / 8).hide()
        } else if (data['list'][k]['weather'][0]['main'] == "Clear") {
            $(".five-day-sun").eq((k - 5)/8).show()
            $(".five-day-cloud").eq((k - 5) / 8).hide()
            $(".five-day-rain").eq((k - 5) / 8).hide()
        } else if (data['list'][k]['weather'][0]['main'] == "Rain") {
            $(".five-day-rain").eq((k - 5)/8).show()
            $(".five-day-cloud").eq((k - 5) / 8).hide()
            $(".five-day-sun").eq((k - 5) / 8).hide()
        }
    }

    for (let j = startingIndex; j < 40; j += 8) {
        averageDayTemp = averageTemp(data['list'][j]['main']['temp'], data['list'][j + 1]['main']['temp'], data['list'][j + 2]['main']['temp'], data['list'][j + 3]['main']['temp'], data['list'][j + 4]['main']['temp'], data['list'][j + 5]['main']['temp'], data['list'][j + 6]['main']['temp'], data['list'][j + 7]['main']['temp'])
        $(".five-day-temp")[j/8].innerHTML = kelvinToFahrenheit(averageDayTemp)
        averageDayHumidity = averageTemp(data['list'][j]['main']['humidity'], data['list'][j + 1]['main']['humidity'], data['list'][j + 2]['main']['humidity'], data['list'][j + 3]['main']['humidity'], data['list'][j + 4]['main']['humidity'], data['list'][j + 5]['main']['humidity'], data['list'][j + 6]['main']['humidity'], data['list'][j + 7]['main']['humidity'])
        $(".five-day-humidity")[j/8].innerHTML = Math.round(averageDayHumidity)
    }
}

let cityNameButton;

// Displays the current day weather and icon.
function displayData(data) {
    let kelvinTemp = data['main']['temp'];
    let fahrenheitTemp = kelvinToFahrenheit(parseInt(kelvinTemp));
    if (data['weather'][0]['main'] == "Rain") {
        $("#current-day-rain").show()
        $("#current-day-sun").hide()
        $("#current-day-cloud").hide()
    } else if (data['weather'][0]['main'] == "Clouds") {
        $("#current-day-cloud").show()
        $("#current-day-sun").hide()
        $("#current-day-rain").hide()
    } else if (data['weather'][0]['main'] == "Clear") {
        $("#current-day-sun").show()
        $("#current-day-rain").hide()
        $("#current-day-cloud").hide()
    }


    $("#current-day-temp").text(fahrenheitTemp)
    $("#current-day-humidity").text(data['main']['humidity'])
    $("#current-day-wind").text(data['wind']['speed'])
    let uv;
    fetch("http://api.openweathermap.org/data/2.5/uvi?appid=1c5b19324e572588393a1d757d289a9e&lat=" + data['coord']['lat'] + "&lon=" + data['coord']['lon']).then(function(response) {
        response.json().then(function(data) {
            uv = data['value']
            if (uv < 4) {
            $("#current-day-uv")
            .text(uv)
            .css("background-color", "#79c589")
            } else if (uv >= 4 && uv < 8) {
            $("#current-day-uv")
            .text(uv)
            .css("background-color", "#ffc105")
            } else {
            $("#current-day-uv")
            .text(uv)
            .css("background-color", "#dc3546")
            }
        })
    })
 
}

// Calls function to fetch API data with given city and appends the searched city to search history and localStorage.
function cityButtonClicked(search, cityNameParameter, append) {

    if (search == true) {
        cityInput = document.getElementById("city")
        city = cityInput.value;
        cityName = city.charAt(0).toUpperCase() + city.slice(1)
    } else if (search == false) {
        cityInput = document.getElementById("city")
        city = cityNameParameter
        cityName = city;
    }

    $("#city-date").html(cityName + " " + currentDate + "  ")
    let listItem = $("<button>")
    .addClass("list-group-item")
    .addClass("city-button")
    .text(cityName)

    if (append != false) {
    $("#list-cities").append(listItem)
    }
    cityInput.value = ""
    $(".right-side").show()

    if (localStorage.length == 0) {
        localStorage.setItem("cities", JSON.stringify([cityName]))
        getFiveDayForecastData(city);
        getCurrentData(city)
    } else {
        let citiesListString = localStorage.getItem("cities")
        citiesList = JSON.parse(citiesListString)
        citiesList.push(cityName)
        localStorage.removeItem("cities")
        localStorage.setItem("cities", JSON.stringify(citiesList));
        getFiveDayForecastData(city);
        getCurrentData(city)
        return;
    }
}



// Event listener for the search button
$(".btn-enter").on("click", function() {
    event.preventDefault()
    cityButtonClicked(true)
})

// Creates event listeners for each element in search history
function searchHistoryButtons() {
    let n;
    for (n = 0; n < document.getElementsByClassName("city-button").length; n++) {

        document.getElementsByClassName("city-button")[n].addEventListener("click", function() {
            cityButtonClicked(false, this.textContent, false)
        })
    }
}
searchHistoryButtons()
setInterval(searchHistoryButtons, 1000)



// Hides right side, loads localStorage in search history and displays dates for the next five days, on the load of the page.
$(window).on("load", function(){
    $(".right-side").hide()
    if (localStorage.length > 0) {
        let citiesList = JSON.parse(localStorage.getItem("cities"))
        for (let i = 0; i < citiesList.length; i++) {
            let listItem = $("<button>")
            .addClass("list-group-item")
            .addClass("city-button")
            .text(citiesList[i])
            $("#list-cities").append(listItem)
        }
    }
    for (let d = 1; d < 6; d++) {
    document.getElementsByClassName("five-day-date")[d - 1].innerHTML = moment().add(d, 'days').format("M/D/YYYY")
    }
})
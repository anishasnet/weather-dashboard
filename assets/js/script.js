let currentDate = moment().format("M/D/YYYY");
let city;
// Gets the data for the current day.
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
}).catch(function(error) {
        alert("Error: Was not able to connect to OpenWeatherAPI")
    })
};

// Function used to convert the Kelvin temperatures from the API to Fahrenheit.
function kelvinToFahrenheit(kelvin) {
    return Math.round((kelvin - 273.15) * 1.8 + 32)
}

// Used in finding the average temperature and humidity for the day in the 5-day forecast
function averageTemp(temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8) {
    let average = (temp1 + temp2 + temp3 + temp4 + temp5 + temp6 + temp7 + temp8) / 8;
    return average;
}

// Fetches the 5-day forecast data.
function getFiveDayForecastData(city) {
    fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=1c5b19324e572588393a1d757d289a9e").then(function(response) {
        response.json().then(function(data2) {
            displayFiveDayForecast(data2)
        })
    })
}

let index;
let startingIndex;
// Displays the icon, temperature, and humidity of each of the five days
function displayFiveDayForecast(data) {
    for (index = 0; index < 9; index++) {
        if (moment().format("DD") != data['list'][index]['dt_txt'].slice(8, 10)) {
            startingIndex = index;
            break;
        }
    }

    for (let k = startingIndex + 6; k < 40; k += 8) {
        if (data['list'][k]['weather'][0]['main'] == "Clouds") {
            $(".five-day-cloud").eq((k - 6)/8).show()
            $(".five-day-sun").eq((k - 6) / 8).hide()
            $(".five-day-rain").eq((k - 6) / 8).hide()
        } else if (data['list'][k]['weather'][0]['main'] == "Clear") {
            $(".five-day-sun").eq((k - 6) / 8).show()
            $(".five-day-cloud").eq((k - 6) / 8).hide()
            $(".five-day-rain").eq((k - 6) / 8).hide()
        } else if (data['list'][k]['weather'][0]['main'] == "Rain") {
            $(".five-day-rain").eq((k - 6)/8).show()
            $(".five-day-cloud").eq((k - 6) / 8).hide()
            $(".five-day-sun").eq((k - 6) / 8).hide()
        }
    }

    for (let j = startingIndex; j < 40; j += 8) {

        averageDayTemp = averageTemp(data['list'][j]['main']['temp'], data['list'][j + 1]['main']['temp'], data['list'][j + 2]['main']['temp'], data['list'][j + 3]['main']['temp'], data['list'][j + 4]['main']['temp'], data['list'][j + 5]['main']['temp'], data['list'][j + 6]['main']['temp'], data['list'][j + 7]['main']['temp'])
        $(".five-day-temp")[Math.round(j/8)].innerHTML = kelvinToFahrenheit(averageDayTemp)
        averageDayHumidity = averageTemp(data['list'][j]['main']['humidity'], data['list'][j + 1]['main']['humidity'], data['list'][j + 2]['main']['humidity'], data['list'][j + 3]['main']['humidity'], data['list'][j + 4]['main']['humidity'], data['list'][j + 5]['main']['humidity'], data['list'][j + 6]['main']['humidity'], data['list'][j + 7]['main']['humidity'])
        $(".five-day-humidity")[Math.round(j/8)].innerHTML = Math.round(averageDayHumidity)


    }

}

let cityNameButton;
// Displays the data for the current data.
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
// Appends the searched city to localStorage and displays the data for the city searched or city clicked on from the search history.
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

    if (localStorage.length == 0 || citiesInLocalStorage == false) {
        localStorage.setItem("cities", JSON.stringify([cityName]))
        getFiveDayForecastData(city);
        getCurrentData(city)
    } else if (localStorage.length != 0 && append == true && citiesInLocalStorage == true) {
        let citiesListString = localStorage.getItem("cities")
        citiesList = JSON.parse(citiesListString)
        citiesList.push(cityName)
        localStorage.removeItem("cities")
        localStorage.setItem("cities", JSON.stringify(citiesList));
        getFiveDayForecastData(city);
        getCurrentData(city)
        return;
    } else {
        getFiveDayForecastData(city);
        getCurrentData(city);
        return;
    }
}



// Event listener for the search button.
$(".btn-enter").on("click", function() {
    event.preventDefault()
    cityButtonClicked(true, "", true)
})

// Creates the search history buttons every second.
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
// citiesInLocalStorage is used if there are other things in localStorage but cities is not then when accessing localStorage.getItem("cities")
// it does not result in undefined.
let citiesInLocalStorage = Object.keys(localStorage).includes("cities");

// Updating citiesInLocalStorage very often as new things are searched the citiesInLocalStorage is not fixed and replaces the already set
// localStorage item with key "cities".
setInterval(function() {
    citiesInLocalStorage = Object.keys(localStorage).includes("cities");
}, 100)

// Hides the right side of the page, loads the search history, and displays the dates for the five day forecast.
$(window).on("load", function(){
    $(".right-side").hide()
    if (localStorage.length > 0 && citiesInLocalStorage == true) {
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
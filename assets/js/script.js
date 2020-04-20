currentDate = moment().format("M/D/YYYY");
let city;

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
alert("Problem")
})
};


function kelvinToFahrenheit(kelvin) {
return Math.round((kelvin - 273.15) * 1.8 + 32)
}

function averageTemp(temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8) {
average = (temp1 + temp2 + temp3 + temp4 + temp5 + temp6 + temp7 + temp8) / 8;
return average;
}
function getFiveDayForecastData(city) {
fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=1c5b19324e572588393a1d757d289a9e").then(function(response) {
response.json().then(function(data2) {
displayFiveDayForecast(data2)
})
})
}

let index;
let startingIndex;
function displayFiveDayForecast(data) {
console.log("displayFiveDayForecast")
for (index = 0; index < 9; index++) {
console.log(index)
console.log("Substr: ", data['list'][index]['dt_txt'].slice(8, 10))
if (moment().format("DD") != data['list'][index]['dt_txt'].slice(8, 10)) {
startingIndex = index;
console.log(index)
break;
}
}
for (let j = startingIndex; j < 40; j += 8) {
averageDayTemp = averageTemp(data['list'][j]['main']['temp'], data['list'][j + 1]['main']['temp'], data['list'][j + 2]['main']['temp'], data['list'][j + 3]['main']['temp'], data['list'][j + 4]['main']['temp'], data['list'][j + 5]['main']['temp'], data['list'][j + 6]['main']['temp'], data['list'][j + 7]['main']['temp'])
$(".five-day-temp")[j/8].innerHTML = kelvinToFahrenheit(averageDayTemp)
averageDayHumidity = averageTemp(data['list'][j]['main']['humidity'], data['list'][j + 1]['main']['humidity'], data['list'][j + 2]['main']['humidity'], data['list'][j + 3]['main']['humidity'], data['list'][j + 4]['main']['humidity'], data['list'][j + 5]['main']['humidity'], data['list'][j + 6]['main']['humidity'], data['list'][j + 7]['main']['humidity'])
console.log(averageDayHumidity)
$(".five-day-humidity")[j/8].innerHTML = Math.round(averageDayHumidity)


}

}

let cityNameButton;
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
console.log(document.getElementById("current-day-icon"))
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

function cityButtonClicked(search, cityNameParameter) {
console.log("hello")

if (search == true) {
cityInput = document.getElementById("city")
city = cityInput.value;
cityName = city.charAt(0).toUpperCase() + city.slice(1)
} else if (search == false) {
cityInput = document.getElementById("city")
city = cityNameParameter
cityName = city;
console.log("City: ", city)
console.log("cityInput: ", cityInput)
console.log("cityName: ", cityName)
}
$("#city-date").html(cityName + " " + currentDate + "  ")
let listItem = $("<button>")
.addClass("list-group-item")
.addClass("city-button")
.text(cityName)
$("#list-cities").append(listItem)
cityInput.value = ""
$(".right-side").show()
if (localStorage.length == 0) {
localStorage.setItem("cities", JSON.stringify([cityName]))
getFiveDayForecastData(city);
getCurrentData(city)
} else {
for (let i = 0; i < localStorage.length; i++) {
if (localStorage.key(i) == "cities") {
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
localStorage.setItem("cities", JSON.stringify([cityName]))
}
}




$(".btn-enter").on("click", function() {
event.preventDefault()
cityButtonClicked(true)
})

function searchHistoryButtons() {
console.log("Hello")
let n;
for (n = 0; n < document.getElementsByClassName("city-button").length; n++) {

document.getElementsByClassName("city-button")[n].addEventListener("click", function() {
cityButtonClicked(false, this.textContent)
})
}
}
searchHistoryButtons()
setInterval(searchHistoryButtons, 1000)




$(window).on("load", function(){
$(".right-side").hide()
if (localStorage.length > 0) {
let citiesList = JSON.parse(localStorage.getItem("cities"))
console.log(citiesList)
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
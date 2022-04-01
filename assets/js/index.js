let searchHistory = JSON.parse(localStorage.getItem("search-history"))
if (!searchHistory) {
    searchHistory = [];
}

const mainContentEl = document.getElementById("weather-dashboard");
const cityInputEl = document.getElementById("city");
const searchFormEl = document.getElementById("search-form");
const historyEl = document.getElementById("search-history");

function getWeatherData(lat, lon, d) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=16ab894e10db2a2a8272018bd00da3f4&units=imperial`;

    let city = d[0].name;

    fetch(apiUrl).then(function(response) {
        response.json().then(function(data) {
            displayWeather(data, city);
        })
    })
}

function displayWeather(data, cit) {
    // check for existing weather-display
    if(document.querySelector(".weather-display")) {
        let toRemove = document.querySelector(".weather-display");
        mainContentEl.removeChild(toRemove);
    }

    // create weather-display div
    const weatherDisplayEl = document.createElement("div")
    weatherDisplayEl.className = "col-8 weather-display";

    // create current day div
    const currentDayEl = document.createElement("div");
    currentDayEl.classList = "row current-weather"

    // create data
    const city = cit
    const temp = data.current.temp;
    const wind = data.current.wind_speed;
    const humidity = data.current.humidity;
    const uvIndex = data.current.uvi;

    // create and append elements
    const cityEl = document.createElement("h2");
    cityEl.innerHTML = `${city} (${moment().format("M/DD/YYYY")})<img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png">`;
    currentDayEl.appendChild(cityEl);

    const tempEl = document.createElement("p");
    tempEl.textContent = `Temp: ${temp}°F`;
    const windEl = document.createElement("p");
    windEl.textContent = `Wind: ${wind} MPH`;
    const humidityEl = document.createElement("p");
    humidityEl.textContent = `Humidity: ${humidity}%`;
    const uvIndexEl = document.createElement("p");

    if (uvIndex <= 3) {
        uvIndexEl.innerHTML = `UV Index: <span class="uv-index favorable">${uvIndex}</span>`
    }
    else if (uvIndex > 3 && uvIndex <= 6) {
        uvIndexEl.innerHTML = `UV Index: <span class="uv-index moderate">${uvIndex}</span>`
    } else {
        uvIndexEl.innerHTML = `UV Index: <span class="uv-index severe">${uvIndex}</span>`
    }
    

    currentDayEl.appendChild(tempEl);
    currentDayEl.appendChild(windEl);
    currentDayEl.appendChild(humidityEl);
    currentDayEl.appendChild(uvIndexEl);

    weatherDisplayEl.appendChild(currentDayEl);   
    mainContentEl.appendChild(weatherDisplayEl); 

    displayFiveDay(data, weatherDisplayEl);
}

function displayFiveDay(data, weatherDisplay) {
    const dailyWeather = data.daily;

    // create container div
    const fiveDayEl = document.createElement("div")
    fiveDayEl.classList = "row five-day";
    fiveDayEl.innerHTML = '<h3 class="mt-3 mb-3">5-Day Forecast:</h3>';

    // create ul el
    const forecastListEl = document.createElement("ul");
    forecastListEl.classList = "list-group d-flex flex-row justify-content-between";

    for (let i=0; i<5; i++) {
        const date = moment().add(i + 1, 'days').format("M/DD/YYYY");

        
        // create li el
        const listItemEl = document.createElement("li")
        listItemEl.classList = "list-group-item forecast-day";

        // create list item content
        const dateEl = document.createElement("h4");
        dateEl.textContent = date
        const iconEl = document.createElement("img");
        iconEl.setAttribute("src", `http://openweathermap.org/img/wn/${dailyWeather[i].weather[0].icon}.png`);
        const tempEl = document.createElement("p");
        tempEl.textContent = `Temp: ${dailyWeather[i].temp.day}°F`;
        const windEl = document.createElement("p");
        windEl.textContent = `Wind: ${dailyWeather[i].wind_speed} MPH`;
        const humidityEl = document.createElement("p");
        humidityEl.textContent = `Humidity: ${dailyWeather[i].humidity}%`;

        listItemEl.appendChild(dateEl);
        listItemEl.appendChild(iconEl);
        listItemEl.appendChild(tempEl);
        listItemEl.appendChild(windEl);
        listItemEl.appendChild(humidityEl);

        forecastListEl.appendChild(listItemEl);

    }

    fiveDayEl.appendChild(forecastListEl)
    weatherDisplay.appendChild(fiveDayEl);

}

function formSubmitHandler(event) {
    event.preventDefault();

    let queryCity = cityInputEl.value.trim();
    let queryState = "";
    let apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${queryCity}&appid=${apiKey}`;

    if (cityInputEl.value.includes(",")) {
        const inputValue = cityInputEl.value.split(",");
        queryCity = inputValue[0];
        queryState = inputValue[1];
        apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${queryCity},${queryState}&appid=${apiKey}`;
    }

    fetch (apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                const lat = data[0].lat;
                const lon = data[0].lon;
    
                getWeatherData(lat, lon, data);
    
                cityInputEl.value = "";
    
                if (!(searchHistory.includes(queryCity))) {
                    searchHistory.push(queryCity)
    
                    saveHistory();
                    loadHistory();
                }
            }) 
        } else {
            alert("Could not find data for specified city. Please check spelling and try again.")
        }
    })
    .catch(function(error) {
        alert("Could not connect to weather API")
    })
}

function loadHistory() {
    if (historyEl.children.length > 0) {
        while (historyEl.firstChild) {
            historyEl.removeChild(historyEl.firstChild);
        }
    }

    for (let i=0; i<searchHistory.length; i++) {
        // create button el
        const historyBtn = document.createElement("button");
        historyBtn.classList = "btn history-btn";
        historyBtn.textContent = searchHistory[i];

        historyEl.appendChild(historyBtn);

    }
}

function historyButtonHandler(event) {
    if (event.target.matches(".history-btn")) {
        cityInputEl.value = event.target.textContent;
        searchFormEl.requestSubmit();
    }
}

function saveHistory() {
    localStorage.setItem("search-history", JSON.stringify(searchHistory));
}

searchFormEl.addEventListener("submit", formSubmitHandler);

historyEl.addEventListener("click", historyButtonHandler);

loadHistory();


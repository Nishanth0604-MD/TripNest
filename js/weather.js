const weatherForm = document.querySelector("#weatherForm");
const weatherResult = document.querySelector("#weatherResult");

async function geocodeCity(city){
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const data = await response.json();

    if (!data.results?.length){
        throw new Error("City not found");
    }

    return data.results[0];
}

async function fetchWeather(location){
    const params = new URLSearchParams({
        latitude:location.latitude,
        longitude:location.longitude,
        current:"temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        daily:"temperature_2m_max,temperature_2m_min,weather_code",
        forecast_days:"5",
        timezone:"auto"
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    return response.json();
}

function weatherLabel(code){
    if ([0].includes(code)) return "Clear";
    if ([1,2,3].includes(code)) return "Cloudy";
    if ([45,48].includes(code)) return "Fog";
    if ([51,53,55,61,63,65,80,81,82].includes(code)) return "Rain";
    if ([71,73,75,85,86].includes(code)) return "Snow";
    if ([95,96,99].includes(code)) return "Storm";
    return "Mixed";
}

function renderWeather(location, weather){
    const current = weather.current;
    const forecast = weather.daily.time.map((day, index) => `
        <article class="weather-card">
            <strong>${new Date(day).toLocaleDateString("en-IN",{ weekday:"short" })}</strong>
            <p>${weatherLabel(weather.daily.weather_code[index])}</p>
            <span>${Math.round(weather.daily.temperature_2m_min[index])}C - ${Math.round(weather.daily.temperature_2m_max[index])}C</span>
        </article>
    `).join("");

    weatherResult.innerHTML = `
        <div class="weather-current">
            <div><strong>${location.name}</strong><p class="muted">${weatherLabel(current.weather_code)}</p></div>
            <div><strong>${Math.round(current.temperature_2m)}C</strong><p class="muted">Temperature</p></div>
            <div><strong>${current.relative_humidity_2m}%</strong><p class="muted">Humidity</p></div>
            <div><strong>${Math.round(current.wind_speed_10m)} km/h</strong><p class="muted">Wind speed</p></div>
        </div>
        <div class="weather-grid">${forecast}</div>
    `;
}

weatherForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = document.querySelector("#weatherCity").value.trim();
    weatherResult.innerHTML = `<p class="muted"><span class="loading-dots"><span></span><span></span><span></span></span> Fetching weather...</p>`;

    try{
        const location = await geocodeCity(city);
        const weather = await fetchWeather(location);
        renderWeather(location, weather);
    }catch (error){
        weatherResult.innerHTML = `<p class="muted">Weather unavailable. Check the city name or network connection.</p>`;
    }
});

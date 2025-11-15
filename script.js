
const inputval = document.getElementById('input_val');
const btn = document.getElementById('btn');
const loader = document.getElementById('loader');
let city_name = document.getElementById('city_name');
let city_time = document.getElementById('city_time');
let city_temp = document.getElementById('city_temp');
const recentList = document.getElementById('recent_list');

// Main function to fetch and display weather data
const fetchAndDisplayWeather = async (query) => {
    // Show loader and clear previous results
    loader.style.display = 'block';
    city_name.innerText = '';
    city_time.innerText = '';
    city_temp.innerText = '';

    try {
        const result = await fetch(`https://api.weatherapi.com/v1/current.json?key=c161eec42eab4021a41125251701&q=${query}&aqi=yes`);
        
        if (!result.ok) {
            throw new Error('City not found.');
        }

        const data = await result.json();
        
        // Update UI with new data
        city_name.innerText = data.location.name + '  ' + data.location.region;
        city_time.innerText = 'Local Time : ' + data.location.localtime;
        city_temp.innerText = 'Temperature in C : ' + data.current.temp_c;

        // 3. Save successful search and update recent searches list
        saveSearch(data.location.name);
        displayRecentSearches();

    } catch (error) {
        city_name.innerText = error.message;
        console.error("Failed to fetch weather data:", error);
    } finally {
        // Hide loader regardless of success or failure
        loader.style.display = 'none';
    }
};

// --- 2. GEOLOCATION ON PAGE LOAD ---
const handleGeolocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchAndDisplayWeather(`${lat},${lon}`);
        }, (error) => {
            console.error("Geolocation error:", error);
            city_name.innerText = "Could not get your location. Please search manually.";
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
};

// --- 3. LOCAL STORAGE FOR RECENT SEARCHES ---
const saveSearch = (city) => {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    // Remove city if it already exists to avoid duplicates and move it to the front
    searches = searches.filter(s => s.toLowerCase() !== city.toLowerCase());
    // Add new city to the beginning
    searches.unshift(city);
    // Keep only the 5 most recent searches
    const recent = searches.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
};

const displayRecentSearches = () => {
    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentList.innerHTML = ''; // Clear current list
    searches.forEach(city => {
        const cityLink = document.createElement('a');
        cityLink.innerText = city;
        cityLink.href = '#';
        cityLink.addEventListener('click', (e) => {
            e.preventDefault();
            inputval.value = city;
            fetchAndDisplayWeather(city);
        });
        recentList.appendChild(cityLink);
    });
};

// --- EVENT LISTENERS ---

// Button click event
btn.addEventListener('click', () => {
    const value = inputval.value;
    if (value) {
        fetchAndDisplayWeather(value);
    }
});

// Allow pressing Enter to search
inputval.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        btn.click();
    }
});

// --- INITIAL ACTIONS ON PAGE LOAD ---
window.addEventListener('load', () => {
    displayRecentSearches();
    handleGeolocation();
});

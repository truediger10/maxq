// Import CSS file from the public folder
import '../public/style.css'; // Make sure this path is correct

console.log('MaxQ Collective loaded successfully.');

// Other JavaScript logic here
import axios from 'axios';

let allLaunches = []; // Store all fetched launches here
const apiUrlBase = 'http://localhost:3000/api/launches'; // Backend endpoint
const maxLaunchesToDisplay = 25; // Limit to 25 launches
const localStorageKey = 'enrichedLaunches';
const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fetch Rocket Launch Data
async function fetchLaunchData() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'block'; // Show spinner

  try {
    // Check if enriched data is in localStorage and still valid
    const cachedData = localStorage.getItem(localStorageKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const currentTime = Date.now();

      if (currentTime - parsedData.timestamp < cacheDuration) {
        console.log('Loaded enriched launches from cache:', parsedData.launches);
        displayLaunchData(parsedData.launches, currentTime);
        if (parsedData.launches.length > 0) {
          updateLaunchSummary(parsedData.launches[0]);
        }
        return; // Exit early since cached data is used
      } else {
        console.log('Cached data is outdated. Fetching new data...');
      }
    }

    // If no valid cached data, fetch from API
    const response = await fetch(apiUrlBase);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log("Launch data fetched:", data);

    const currentDate = new Date();
    const validLaunches = data.filter(launch => {
      const launchDate = launch.win_open ? new Date(launch.win_open) : null;
      return !launchDate || launchDate >= currentDate; // Include launches without a win_open date
    }).sort((a, b) => {
      const dateA = a.win_open ? new Date(a.win_open) : Infinity;
      const dateB = b.win_open ? new Date(b.win_open) : Infinity;
      return dateA - dateB;
    });

    // Enrich launch data with OpenAI
    const serverTime = await fetchServerTime();
    const enrichedLaunches = await Promise.all(
      validLaunches.slice(0, maxLaunchesToDisplay).map(launch => enrichDataWithOpenAI(launch))
    );

    console.log('Enriched launches:', enrichedLaunches);

    // Store enriched data in localStorage with a timestamp
    const cacheData = {
      timestamp: Date.now(),
      launches: enrichedLaunches
    };
    localStorage.setItem(localStorageKey, JSON.stringify(cacheData));
    console.log('Enriched launches cached successfully.');

    // Display the enriched launch data on the page
    displayLaunchData(enrichedLaunches, serverTime);

    // Update the launch summary with the first launch
    if (enrichedLaunches.length > 0) {
      updateLaunchSummary(enrichedLaunches[0]);
    }
  } catch (error) {
    console.error('Error fetching launch data:', error);
    const launchSchedule = document.getElementById('launch-list');
    if (launchSchedule) {
      launchSchedule.innerHTML = `<p class="error-message">Failed to load launch data. Please try again later.</p>`;
    }
  } finally {
    if (spinner) spinner.style.display = 'none'; // Hide spinner
  }
}

// Function to fetch server time
async function fetchServerTime() {
  try {
    const response = await fetch('/api/server-time');
    const data = await response.json();
    return data.serverTime;
  } catch (error) {
    console.error('Error fetching server time:', error);
    return Date.now(); // Fallback to client time if server time fetch fails
  }
}

// Function to enrich launch data with OpenAI
async function enrichDataWithOpenAI(launch) {
  try {
    const response = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ launchData: launch }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const enrichedData = await response.json();
    return {
      ...launch,
      enrichedDescription: enrichedData.enrichedDescription || 'Description not available.',
      missionObjectives: enrichedData.missionObjectives || 'Information not available.',
      payloadInfo: enrichedData.payloadInfo || 'Information not available.',
      rocketType: enrichedData.rocketType || launch.vehicle?.name || 'Information not available.',
      launchProvider: enrichedData.launchProvider || launch.provider?.name || 'Information not available.',
      launchSite: enrichedData.launchSite || launch.pad?.location?.name || 'Information not available.',
      funFacts: enrichedData.funFacts || 'No fun facts available.',
      historicalContext: enrichedData.historicalContext || 'Information not available.',
    };
  } catch (error) {
    console.error('Error enriching data with OpenAI:', error);
    return {
      ...launch,
      enrichedDescription: 'Description not available.',
      missionObjectives: 'Information not available.',
      payloadInfo: 'Information not available.',
      rocketType: launch.vehicle?.name || 'Information not available.',
      launchProvider: launch.provider?.name || 'Information not available.',
      launchSite: launch.pad?.location?.name || 'Information not available.',
      funFacts: 'No fun facts available.',
      historicalContext: 'Information not available.',
    };
  }
}

// Function to display launch data on the page
function displayLaunchData(launches, serverTime) {
  const launchSchedule = document.getElementById('launch-list');

  if (!launchSchedule) {
    console.error('Launch schedule element not found!');
    return;
  }

  // Clear any existing content
  launchSchedule.innerHTML = '';

  // Iterate over each launch and create a launch card
  launches.forEach((launch, index) => {
    // Create a list item for the launch
    const launchItem = document.createElement('li');
    launchItem.classList.add('launch-item');

    // Unique identifier for the countdown timer and expandable section
    const timerId = `timer${index + 1}`;
    const detailsId = `details${index + 1}`;

    // Create the HTML structure for the launch card
    launchItem.innerHTML = `
      <div class="launch-card">
        <!-- Rocket Image -->
        <img src="${getRocketImage(launch.vehicle?.name)}" alt="${launch.vehicle?.name || 'Rocket'} Image" class="launch-image">

        <!-- Launch Information -->
        <div class="launch-info">
          <!-- Launch Name -->
          <h2 class="launch-name">${launch.name}</h2>

          <!-- Launch Provider -->
          <p class="launch-provider"><strong>Provider:</strong> ${launch.launchProvider}</p>

          <!-- Rocket Type -->
          <p class="rocket-type"><strong>Rocket:</strong> ${launch.rocketType}</p>

          <!-- Launch Date and Site -->
          <p class="launch-date-time"><strong>Launch Date:</strong> ${formatLaunchDate(launch.win_open)}</p>
          <p class="launch-site"><strong>Launch Site:</strong> ${launch.launchSite}</p>

          <!-- Short Description -->
          <p class="short-description">${launch.enrichedDescription}</p>

          <!-- Read More Button -->
          <button class="expand-button" onclick="toggleDetails('${detailsId}')">Read More</button>

          <!-- Expandable Details Section -->
          <div class="launch-details hidden" id="${detailsId}">
            <h3>Mission Objectives</h3>
            <p>${launch.missionObjectives}</p>

            <h3>Payload Information</h3>
            <p>${launch.payloadInfo}</p>

            <h3>Insights</h3>
            <p>${launch.funFacts}</p>

            <h3>Background</h3>
            <p>${launch.historicalContext}</p>
          </div>
        </div>
      </div>
    `;

    // Append the launch item to the launch schedule container
    launchSchedule.appendChild(launchItem);

    // Initialize the countdown timer for this launch
    if (launch.win_open) {
      initializeCountdown(timerId, launch.win_open, serverTime);
    } else {
      const timerElement = document.getElementById(timerId);
      if (timerElement) timerElement.innerText = 'TBD';
    }
  });
}

// Function to update the launch summary with the first launch
function updateLaunchSummary(launch) {
  const launchName = document.getElementById('launch-name');
  const rocket = document.getElementById('rocket');
  const date = document.getElementById('date');
  const launchSite = document.getElementById('launch-site');
  const mainTimer = document.getElementById('main-timer');

  if (launchName) launchName.textContent = launch.name || 'N/A';
  if (rocket) rocket.textContent = launch.rocketType || launch.vehicle?.name || 'N/A';
  if (date) date.textContent = formatLaunchDate(launch.win_open);
  if (launchSite) launchSite.textContent = launch.launchSite || 'N/A';
  
  if (launch.win_open) {
    initializeCountdown('main-timer', launch.win_open, Date.now());
  } else {
    if (mainTimer) mainTimer.textContent = 'TBD';
  }
}

// Function to get the rocket image based on the rocket name
function getRocketImage(rocketName) {
  const rocketImages = {
    "Alpha": "rocketimages/alpharocket.jpg",
    "Ariane 6": "rocketimages/ariane6.jpg",
    "Astra 4": "rocketimages/astra4.jpg",
    "Atlas V": "rocketimages/atlasv.jpg",
    "Electron": "rocketimages/electron.jpg",
    "Eris Rocket": "rocketimages/erisrocket.jpg",
    "Falcon 9": "rocketimages/falcon9.jpg",
    "Falcon Heavy": "rocketimages/falconheavy.jpg",
    "Global Precipitation Measurement (GPM) Mission": "rocketimages/global_precipitation_measurement_gpm_mission.jpg",
    "Gravity 1": "rocketimages/gravity1.jpg",
    "GSLV-II": "rocketimages/gslv-ii.jpg",
    "GSLV Mk III": "rocketimages/gslv3rocket.jpg",
    "H3 Rocket": "rocketimages/h3rocket.jpg",
    "LM-2D": "rocketimages/lm2d.jpg",
    "Minotaur IV": "rocketimages/minotauriv.jpg",
    "Neutron": "rocketimages/neutron.jpg",
    "New Glenn Rocket": "rocketimages/newglennrocket.jpg",
    "New Shepard": "rocketimages/newshepard.jpg",
    "PSLV": "rocketimages/pslv.jpg",
    "PSLV-XL": "rocketimages/pslvxl.jpg",
    "Ravn Rocket": "rocketimages/ravnrocket.jpg",
    "RS-1 Rocket": "rocketimages/rs1rocket.jpg",
    "SLS": "rocketimages/sls.jpg",
    "Soyuz-2": "rocketimages/soyuz2.jpg",
    "Starship": "rocketimages/starship.jpg",
    "Starship Prototype": "rocketimages/starshipprototype.jpg",
    "Terran R": "rocketimages/terranr.jpg",
    "Vulcan Rocket": "rocketimages/vulcanrocket.jpg",
    "VV04": "rocketimages/vv04.jpg",
    "VV21": "rocketimages/vv21.jpg",
    "Placeholder": "rocketimages/placeholder.jpg"
  };
  return rocketImages[rocketName] || "rocketimages/placeholder.jpg"; // Fallback image
}

// Function to format the launch date for display
function formatLaunchDate(launchDate) {
  if (!launchDate) return 'TBD';
  const date = new Date(launchDate);
  return date.toLocaleString(); // Format the date to the user's locale
}

// Function to generate HTML content for fun facts
function generateFunFacts(funFacts) {
  if (!funFacts || funFacts === 'No fun facts available.') {
    return '<p>No insights available.</p>';
  }

  return `<p>${funFacts}</p>`;
}

// Function to initialize a countdown timer
function initializeCountdown(elementId, endDate, serverTime) {
  const countDownDate = new Date(endDate).getTime();

  // Update the count down every 1 second
  const timer = setInterval(() => {
    // Calculate the distance between now and the launch date
    const now = Date.now() + (serverTime - Date.now());
    const distance = countDownDate - now;

    // Find the timer element
    const timerElement = document.getElementById(elementId);
    if (!timerElement) {
      clearInterval(timer);
      return;
    }

    // If the launch date has passed, display "Launched" and stop the timer
    if (distance < 0) {
      clearInterval(timer);
      timerElement.innerText = 'Launched';
      return;
    }

    // Time calculations for days, hours, minutes, and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the specified element
    timerElement.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

// Function to toggle the visibility of the expandable details section
function toggleDetails(detailsId) {
  const detailsElement = document.getElementById(detailsId);
  if (detailsElement.classList.contains('hidden')) {
    detailsElement.classList.remove('hidden'); // Show the details
  } else {
    detailsElement.classList.add('hidden'); // Hide the details
  }
}

// Expose toggleDetails globally
window.toggleDetails = toggleDetails;

document.addEventListener('DOMContentLoaded', fetchLaunchData);

// JavaScript to hide the banner when scrolling
window.addEventListener('scroll', function () {
    const banner = document.querySelector('.banner'); // Selects the banner element
    if (window.scrollY > 50) { // Check if scrolled more than 50 pixels
        banner.classList.add('hide-banner'); // Adds the class to hide the banner
    } else {
        banner.classList.remove('hide-banner'); // Removes the class when scrolled back to the top
    }
});
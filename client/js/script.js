// client/js/script.js

console.log('MaxQ Collective loaded successfully.');

let allLaunches = []; // Store all fetched launches here
let countdownTimers = {}; // Store timer intervals here
const apiUrlBase = '/api/launches'; // Backend endpoint (relative path)

/**
 * Debounce function to limit the rate of function execution.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
function debounce(func, delay) {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

// Fetch Rocket Launch Data
async function fetchLaunchData() {
  try {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block'; // Show loading
    }

    // Fetch from API
    const response = await fetch(apiUrlBase);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log('Launch data fetched:', data);

    // The API returns an array of launches directly
    const validLaunches = data;

    allLaunches = validLaunches;
    // Display the launch data on the page
    displayLaunchData(allLaunches);

    // Update the launch summary with the first launch
    if (allLaunches.length > 0) {
      updateLaunchSummary(allLaunches[0]);
    }

    if (loadingIndicator) {
      loadingIndicator.style.display = 'none'; // Hide loading
    }
  } catch (error) {
    console.error('Error fetching launch data:', error);
    const launchSchedule = document.getElementById('launch-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none'; // Hide loading
    }
    if (launchSchedule) {
      launchSchedule.innerHTML = `<p class="error-message">Failed to load launch data. Please try again later.</p>`;
    }
  }
}

// Function to display launch data on the page
function displayLaunchData(launches) {
  const launchSchedule = document.getElementById('launch-list');

  if (!launchSchedule) {
    console.error('Launch schedule element not found!');
    return;
  }

  // Clear any existing content
  launchSchedule.innerHTML = '';

  // Clear existing timers
  Object.values(countdownTimers).forEach(clearInterval);
  countdownTimers = {};

  // Check if there are any valid launches to display
  if (!launches || launches.length === 0) {
    launchSchedule.innerHTML = '<p>No upcoming launches found.</p>';
    return;
  }

  // Iterate over each launch and create a launch card
  launches.forEach((launch, index) => {
    if (!launch || !launch.name) {
      console.warn(`Skipping invalid launch at index ${index}`);
      return;
    }

    // Create a list item for the launch
    const launchItem = document.createElement('li');
    launchItem.classList.add('launch-item');

    // Unique identifier for the countdown timer and expandable section
    const timerId = `timer${index + 1}`;
    const detailsId = `details${index + 1}`;

    // Access relevant fields from the API response
    const rocketName = launch.vehicle?.name || 'Unknown Rocket';
    const launchProvider = launch.provider?.name || 'Unknown Provider';
    const launchDate = launch.sort_date ? new Date(launch.sort_date * 1000).toISOString() : 'TBD';
    const launchSite = launch.pad?.location?.name || launch.pad?.name || 'Unknown Location';
    const launchImage = getRocketImage(rocketName);
    const missionDescription = launch.missions?.[0]?.description || 'No mission description available.';
    const missionObjectives = launch.missionObjectives || 'Mission objectives not available.';
    const payloadInfo = launch.payloadInfo || 'Payload information not available.';
    const funFacts = launch.funFacts || 'No fun facts available.';
    const historicalContext = launch.historicalContext || 'Historical context unavailable.';

    // Create the HTML structure for the launch card
    launchItem.innerHTML = `
      <div class="launch-card">
        <div class="launch-card-image">
          <img src="${launchImage}" alt="${rocketName} Image" class="launch-image" loading="lazy">
        </div>
        <div class="launch-card-content">
          <h2 class="launch-name">${launch.name || 'Unknown Launch'}</h2>
          <p class="launch-provider"><strong>Provider:</strong> ${launchProvider}</p>
          <p class="rocket-type"><strong>Rocket:</strong> ${rocketName}</p>
          <p class="launch-date-time"><strong>Launch Date:</strong> ${formatLaunchDate(launchDate)}</p>
          <p class="launch-site"><strong>Launch Site:</strong> ${launchSite}</p>
          <!-- Countdown Timer -->
          ${launchDate && launchDate !== 'TBD' ? `<p class="countdown-container" id="${timerId}">Countdown: TBD</p>` : ''}
          <!-- Short Description -->
          <p class="short-description">${missionDescription}</p>
          <!-- Read More Button -->
          <button class="expand-button" onclick="toggleDetails('${detailsId}', this)" aria-expanded="false">Read More</button>
        </div>
        <!-- Expandable Details -->
        <div class="launch-details hidden" id="${detailsId}">
          <h3>Mission Objectives</h3>
          <p>${missionObjectives}</p>
          <h3>Payload Information</h3>
          <p>${payloadInfo}</p>
          <h3>Fun Facts</h3>
          <p>${funFacts}</p>
          <h3>Historical Context</h3>
          <p>${historicalContext}</p>
        </div>
      </div>
    `;

    // Append the launch item to the launch schedule container
    launchSchedule.appendChild(launchItem);

    // Initialize the countdown timer for this launch if the launch date is available
    if (launchDate && launchDate !== 'TBD') {
      initializeCountdown(timerId, launchDate);
    }
  });
}

// Helper function to format the launch date for display
function formatLaunchDate(launchDate) {
  if (!launchDate) return 'TBD';
  const date = new Date(launchDate);
  return date.toLocaleString(); // Format the date to the user's locale
}

// Function to update the launch summary with the first launch
function updateLaunchSummary(launch) {
  const launchNameElem = document.getElementById('launch-name');
  const rocketElem = document.getElementById('rocket');
  const dateElem = document.getElementById('date');
  const mainTimerElem = document.getElementById('main-timer');

  if (launchNameElem) launchNameElem.textContent = launch.name || 'N/A';
  if (rocketElem) rocketElem.textContent = launch.vehicle?.name || 'N/A';
  if (dateElem) dateElem.textContent = formatLaunchDate(launch.sort_date ? new Date(launch.sort_date * 1000).toISOString() : null);

  if (launch.sort_date) {
    const launchDate = new Date(launch.sort_date * 1000).toISOString();
    initializeMainCountdown('main-timer', launchDate);
  } else {
    if (mainTimerElem) mainTimerElem.textContent = 'TBD';
  }
}

// Function to get the rocket image based on the rocket name
function getRocketImage(rocketName) {
  const rocketImages = {
    "Alpha": "assets/images/rocketimages/alpharocket.jpg",
    "Ariane 6": "assets/images/rocketimages/ariane6.jpg",
    "Astra 4": "assets/images/rocketimages/astra4.jpg",
    "Atlas V": "assets/images/rocketimages/atlasv.jpg",
    "Ceres-1": "assets/images/rocketimages/Ceres1.jpg",
    "Electron": "assets/images/rocketimages/electron.jpg",
    "Eris Rocket": "assets/images/rocketimages/erisrocket.jpg",
    "Falcon 9": "assets/images/rocketimages/falcon9.jpg",
    "Falcon 9 Block 5": "assets/images/rocketimages/falcon9block5.jpg",
    "Falcon Heavy": "assets/images/rocketimages/falconheavy.jpg",
    "Global Precipitation Measurement (GPM) Mission": "assets/images/rocketimages/global_precipitation_measurement_gpm_mission.jpg",
    "Gravity 1": "assets/images/rocketimages/gravity1.jpg",
    "GSLV-II": "assets/images/rocketimages/gslv-ii.jpg",
    "GSLV Mk III": "assets/images/rocketimages/gslv3rocket.jpg",
    "H3 Rocket": "assets/images/rocketimages/h3rocket.jpg",
    "LM-2D": "assets/images/rocketimages/lm2d.jpg",
    "Minotaur IV": "assets/images/rocketimages/minotauriv.jpg",
    "Neutron": "assets/images/rocketimages/neutron.jpg",
    "New Glenn Rocket": "assets/images/rocketimages/newglennrocket.jpg",
    "New Shepard": "assets/images/rocketimages/newshepard.jpg",
    "PSLV": "assets/images/rocketimages/pslv.jpg",
    "PSLV-XL": "assets/images/rocketimages/pslvxl.jpg",
    "Ravn Rocket": "assets/images/rocketimages/ravnrocket.jpg",
    "RS-1 Rocket": "assets/images/rocketimages/rs1rocket.jpg",
    "SLS": "assets/images/rocketimages/sls.jpg",
    "Soyuz-2": "assets/images/rocketimages/soyuz2.jpg",
    "Starship": "assets/images/rocketimages/starship.jpg",
    "Starship Prototype": "assets/images/rocketimages/starshipprototype.jpg",
    "Terran R": "assets/images/rocketimages/terranr.jpg",
    "Vulcan Rocket": "assets/images/rocketimages/vulcanrocket.jpg",
    "VV04": "assets/images/rocketimages/vv04.jpg",
    "VV21": "assets/images/rocketimages/vv21.jpg",
    "Placeholder": "assets/images/rocketimages/placeholder.jpg"
  };
  return rocketImages[rocketName] || "assets/images/rocketimages/placeholder.jpg";
}

// Function to initialize a countdown timer
function initializeCountdown(elementId, endDate) {
  const countDownDate = new Date(endDate).getTime();

  // Update the count down every 1 second
  const timer = setInterval(() => {
    const now = Date.now();
    const distance = countDownDate - now;

    const timerElement = document.getElementById(elementId);
    if (!timerElement) {
      clearInterval(timer);
      return;
    }

    if (distance < 0) {
      clearInterval(timer);
      timerElement.innerText = 'Launched';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    timerElement.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);

  // Store the timer
  countdownTimers[elementId] = timer;
}

// Function to initialize the main countdown timer in the banner
function initializeMainCountdown(elementId, endDate) {
  const countDownDate = new Date(endDate).getTime();

  // Update the count down every 1 second
  const timer = setInterval(() => {
    const now = Date.now();
    const distance = countDownDate - now;

    const timerElement = document.getElementById(elementId);
    if (!timerElement) {
      clearInterval(timer);
      return;
    }

    if (distance < 0) {
      clearInterval(timer);
      timerElement.innerText = 'Launched';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    timerElement.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);

  // Store the timer
  countdownTimers[elementId] = timer;
}

// Function to toggle the visibility of the launch details
function toggleDetails(detailsId, button) {
  const detailsElement = document.getElementById(detailsId);
  if (detailsElement) {
    detailsElement.classList.toggle('hidden');
    // Change button text based on visibility
    if (detailsElement.classList.contains('hidden')) {
      button.textContent = 'Read More';
      button.setAttribute('aria-expanded', 'false');
    } else {
      button.textContent = 'Show Less';
      button.setAttribute('aria-expanded', 'true');
    }
  }
}

// Implement search functionality with debounce
document.getElementById('search-input').addEventListener('input', debounce(function(event) {
  const query = event.target.value.toLowerCase();
  const filteredLaunches = allLaunches.filter(launch => {
    return launch.name.toLowerCase().includes(query) ||
           (launch.provider?.name && launch.provider.name.toLowerCase().includes(query)) ||
           (launch.vehicle?.name && launch.vehicle.name.toLowerCase().includes(query));
  });
  displayLaunchData(filteredLaunches);
}, 300)); // 300ms debounce delay

// Call fetchLaunchData when the page loads
document.addEventListener('DOMContentLoaded', fetchLaunchData);
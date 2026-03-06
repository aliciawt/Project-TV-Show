let currentEpisodes = [];
let allShows = [];

const searchBox = document.getElementById("search-box");
const episodeDropdown = document.getElementById("episode-dropdown");
const showDropdown = document.getElementById("show-dropdown");
const showContainer = document.getElementById("show-container")
const cardContainer = document.getElementById("card-container");
const numberOfEpisodes = document.getElementById("number-of-episodes");
const backButton = document.getElementById("back-to-shows");

// Back to shows button
backButton.addEventListener("click", () => {
  showContainer.style.display = "flex";
  cardContainer.style.display = "none";
  backButton.style.display = "none";

  searchBox.value = "";
  showDropdown.value = "";

  episodeDropdown.innerHTML = '<option value="">All episodes</option>';

  currentEpisodes = [];

  renderShows(allShows);

  numberOfEpisodes.textContent =
    `Displaying ${allShows.length} out of ${allShows.length} shows`;
});

// Cache to avoid repeated fetches
const episodesCache = {};

// Fetch shows and sort them alphabetically
async function getShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");

  const allShows = await response.json();

  allShows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  return allShows;
}

// Render shows in cards and event listener for clicks
function renderShows(shows) {
  const templateShow = document.getElementById("template-show");
  showContainer.innerHTML = "";

  shows.forEach(sh => {
    const clone = templateShow.content.cloneNode(true);

    const title = clone.querySelector(".show-title");
    const image = clone.querySelector(".show-image");
    const summary = clone.querySelector(".show-summary");
    const details = clone.querySelector(".show-details");

    // Basic info
    title.textContent = sh.name || "Untitled Show";
    image.src = sh.image?.medium || "";
    image.alt = sh.name || "Show image";
    summary.innerHTML = sh.summary || "No summary available";

    // Details: genres, status, runtime, rating
    details.textContent =
      `Genre(s): ${sh.genres.join(", ") || "N/A"}\n` +
      `Status: ${sh.status || "N/A"}\n` +
      `Runtime: ${sh.runtime || "N/A"} min\n` +
      `Rating: ${sh.rating?.average ?? "N/A"}`;
    details.style.whiteSpace = "pre-line";

    // Click on card → show episodes
    clone.querySelector(".show-card").addEventListener("click", () => {
      // Sync dropdown with clicked show
      showDropdown.value = sh.id;
      handleShowSelection(sh.id);
    });

    showContainer.appendChild(clone);
  });

  // Update counter
  numberOfEpisodes.textContent = `Displaying ${shows.length} out of ${allShows.length} shows`;
}

// Populate shows dropdown
function populateShowDropdown(shows) {
  showDropdown.innerHTML = '<option value="">Select a show...</option>';

  shows.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showDropdown.appendChild(option);
  });
}

// Show selection
showDropdown.addEventListener("change", e => handleShowSelection(e.target.value));

async function handleShowSelection(showId) {
  if (!showId) {
    resetEpisodesView();
    showContainer.style.display = "flex";
    cardContainer.style.display = "none";
    backButton.style.display = "none";
    return;
  }

  showContainer.style.display = "none";
  cardContainer.style.display = "grid";
  backButton.style.display = "inline-block";

  cardContainer.innerHTML = "<p>Loading episodes...</p>";

  try {
    const episodes = await getEpisodes(showId);
    currentEpisodes = episodes;

    renderEpisodes(episodes);
    populateEpisodeDropdown(episodes);
  } catch (err) {
    console.error(err);
    cardContainer.innerHTML = `<p style="color:red;">Failed to load episodes.</p>`;
  }
}

// Reset view if no shows is selected
function resetEpisodesView() {
  episodeDropdown.innerHTML = '<option value="">All episodes</option>';
  searchBox.value = '';
  currentEpisodes = [];
  numberOfEpisodes.textContent = '';
}

// Fetch episodes
async function getEpisodes(showId) {
  if (episodesCache[showId]) {
    return episodesCache[showId];
  }

  const resp = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  if (!resp.ok) throw new Error("Failed to fetch episodes");

  const episodes = await resp.json();
  episodesCache[showId] = episodes;
  return episodes;
}

// Render episodes in cards
function renderEpisodes(episodes) {
  const templateEpisode = document.getElementById("template-episode");
  
  const existingButton = cardContainer.querySelector("#back-to-shows");
  cardContainer.innerHTML = '';
  if (existingButton) cardContainer.appendChild(existingButton);

  episodes.forEach(ep => {
    const clone = templateEpisode.content.cloneNode(true);
    
    const titleElem = clone.querySelector(".episode-title");
    const code = clone.querySelector(".episode-code");
    const image = clone.querySelector(".episode-image");
    const summary = clone.querySelector(".episode-summary");

    code.textContent = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    
    // Make title a clickable link to TVMaze
    const link = document.createElement("a");
    link.classList.add("episode-link");
    link.href = ep.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = ep.name;
    link.style.textDecoration = "none";
    link.style.color = "#111";
    link.style.fontWeight = "bold";

    titleElem.innerHTML = "";
    titleElem.appendChild(link);

    image.src = ep.image?.medium || "";
    image.alt = ep.name;
    summary.innerHTML = ep.summary || "No summary available";

    cardContainer.appendChild(clone);
  });

  numberOfEpisodes.textContent = `Displaying ${episodes.length} out of ${episodes.length} episodes`;
}

// Populate episode dropdown
function populateEpisodeDropdown(episodes) {
  episodeDropdown.innerHTML = '<option value="">All episodes</option>';
  episodes.forEach(ep => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    episodeDropdown.appendChild(option);
  });
}

// Search and episode dropdown listeners
searchBox.addEventListener("input", handleSearch);
episodeDropdown.addEventListener("change", selectSingleEpisode);

// Search for show listings
function handleSearch() {
  const term = searchBox.value.toLowerCase();

  // if shows are visible → search shows
  if (showContainer.style.display !== "none") {
    const filteredShows = allShows.filter(show =>
      show.name.toLowerCase().includes(term) ||
      (show.summary && show.summary.toLowerCase().includes(term)) ||
      show.genres.some(g => g.toLowerCase().includes(term))
    );

    renderShows(filteredShows);

    numberOfEpisodes.textContent =
      `Displaying ${filteredShows.length} out of ${allShows.length} shows`;
  }

  // otherwise search episodes
  else {
    filterEpisodes();
  }
}

// Filter episodes via search
function filterEpisodes() {
  const term = searchBox.value.toLowerCase();
  const filtered = currentEpisodes.filter(ep => 
    ep.name.toLowerCase().includes(term) ||
    (ep.summary && ep.summary.toLowerCase().includes(term))
  );
  
  if (filtered.length === 0) {
    cardContainer.innerHTML = `<p style="color:red; text-align:center;">Your search did not yield any results.</p>`;
  } else {
    renderEpisodes(filtered);
  }

  numberOfEpisodes.textContent = `Displaying ${filtered.length} out of ${currentEpisodes.length} episodes`;
}

// Select a single episode from dropdown
function selectSingleEpisode(e) {
  const epId = e.target.value;
  if (!epId) {
    renderEpisodes(currentEpisodes);
    numberOfEpisodes.textContent = `Displaying ${currentEpisodes.length} out of ${currentEpisodes.length} episodes`;
  } else {
    const selected = currentEpisodes.filter(ep => ep.id == epId);
    renderEpisodes(selected);
    numberOfEpisodes.textContent = `Displaying ${selected.length} out of ${currentEpisodes.length} episodes`;
  }
}

window.onload = async () => {
  const shows = await getShows();
  allShows = shows;

  populateShowDropdown(shows);
  resetEpisodesView();
  renderShows(shows);

  numberOfEpisodes.textContent = `Displaying ${shows.length} out of ${shows.length} shows`;
};
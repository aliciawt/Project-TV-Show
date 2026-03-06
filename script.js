let currentEpisodes = [];
const searchBox = document.getElementById("search-box");
const episodeDropdown = document.getElementById("episode-dropdown");
const showDropdown = document.getElementById("show-dropdown");
const showContainer = document.getElementById("show-container")
const cardContainer = document.getElementById("card-container");
const numberOfEpisodes = document.getElementById("number-of-episodes");

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
  if (!showId) return resetEpisodesView();

  showContainer.innerHTML = "";

  cardContainer.innerHTML = `<p>Loading episodes...</p>`;

  try {
    const episodes = await getEpisodes(showId);
    currentEpisodes = episodes;
    renderEpisodes(episodes);
    populateEpisodeDropdown(episodes);
  } catch (err) {
    cardContainer.innerHTML = `<p style="color:red;">Failed to load episodes.</p>`;
    console.error(err);
  }
}

// Reset view if no shows is selected
function resetEpisodesView() {
  showContainer.innerHTML = `<p>Select a show above to see episodes...</p>`;
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
  cardContainer.innerHTML = "";

  episodes.forEach(ep => {
    const clone = templateEpisode.content.cloneNode(true);
    const title = clone.querySelector(".episode-title");
    const code = clone.querySelector(".episode-code");
    const image = clone.querySelector(".episode-image");
    const summary = clone.querySelector(".episode-summary");

    code.textContent = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    title.innerHTML = `<a href="${ep.url}" target="_blank">${ep.name}</a>`;
    image.src = ep.image.medium;
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
searchBox.addEventListener("input", filterEpisodes);
episodeDropdown.addEventListener("change", selectSingleEpisode);

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
  populateShowDropdown(shows);
  resetEpisodesView();
};
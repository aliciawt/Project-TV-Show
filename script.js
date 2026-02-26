let currentEpisodes = [];
const searchBox = document.getElementById("search-box");
const episodeDropdown = document.getElementById("episode-dropdown");
const showDropdown = document.getElementById("show-dropdown");
const container = document.getElementById("card-container");
const numberOfEpisodes = document.getElementById("number-of-episodes");

// Cache to avoid repeated fetches
const episodesCache = {};

async function setup() {
  container.innerHTML = `<p>Loading shows...</p>`;

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Failed to fetch shows");

    const allShows = await response.json();

    // Sort shows alphabetically, case-insensitive
    allShows.sort((a, b) => a.name.localeCompare(b.name, { sensitivity: "base" }));

    // Populate show dropdown
    allShows.forEach(show => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showDropdown.appendChild(option);
    });

    container.innerHTML = `<p>Select a show above to see episodes...</p>`;
  } catch (error) {
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to load shows. Check console.</p>`;
    console.error(error);
  }

  // When a show is selected
  showDropdown.addEventListener("change", async (e) => {
    const showId = e.target.value;
    if (!showId) return;

    container.innerHTML = `<p>Loading episodes...</p>`;

    try {
      let episodes;
      if (episodesCache[showId]) {
        episodes = episodesCache[showId];
      } else {
        const resp = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
        if (!resp.ok) throw new Error("Failed to fetch episodes");
        episodes = await resp.json();
        episodesCache[showId] = episodes;
      }

      currentEpisodes = episodes;
      renderEpisodes(episodes);
      populateEpisodeDropdown(episodes);
    } catch (err) {
      container.innerHTML = `<p style="color:red;" text-align:center;>Failed to load episodes. Check console.</p>`;
      console.error(err);
    }
  });

  // Search and episode dropdown listeners
  searchBox.addEventListener("input", filterEpisodes);
  episodeDropdown.addEventListener("change", selectSingleEpisode);
}

// Render episodes in cards
function renderEpisodes(episodes) {
  const template = document.getElementById("template");
  container.innerHTML = "";

  episodes.forEach(ep => {
    const clone = template.content.cloneNode(true);
    const title = clone.querySelector(".title");
    const code = clone.querySelector(".episode-code");
    const image = clone.querySelector(".image");
    const summary = clone.querySelector(".summary");

    code.textContent = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    title.innerHTML = `<a href="${ep.url}" target="_blank">${ep.name}</a>`;
    image.src = ep.image ? ep.image.medium : "placeholder.jpg";
    image.alt = ep.name;
    summary.innerHTML = ep.summary || "No summary available";

    container.appendChild(clone);
  });

  numberOfEpisodes.textContent = `Displaying ${episodes.length} out of ${episodes.length} episodes`;
}

// Filter episodes via search
function filterEpisodes() {
  const term = searchBox.value.toLowerCase();
  const filtered = currentEpisodes.filter(ep => 
    ep.name.toLowerCase().includes(term) ||
    (ep.summary && ep.summary.toLowerCase().includes(term))
  );
  
  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:red; text-align:center;">Your search did not yield any results.</p>`;
  } else {
    renderEpisodes(filtered);
  }

  numberOfEpisodes.textContent = `Displaying ${filtered.length} out of ${currentEpisodes.length} episodes`;
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

window.onload = setup;
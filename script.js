let allEpisodes = [];
let filteredEpisodes;

const searchBox = document.getElementById("search-box");
const episodeDropdown = document.getElementById("episode-dropdown");
const container = document.getElementById("card-container");
const numberOfEpisodes = document.getElementById("number-of-episodes");

// main setup
async function setup() {
  // show loading message
  container.innerHTML = `<p>Loading episodes, please wait...</p>`;

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    
    if (!response.ok) throw new Error("Network response was not ok");

    allEpisodes = await response.json();

    // render all episodes
    makePageForEpisodes(allEpisodes);
    populateDropdown();
    setupDropdownListener();

  } catch (error) {
    container.innerHTML = `<p style="color:red;">Failed to load episodes. Please try again later.</p>`;
  }
}

// render episode cards & update counter
function makePageForEpisodes(episodeList) {
  const template = document.getElementById("template");
  
  const totalEpisodes = allEpisodes.length;

  const cards = episodeList.map(episode => {
    const clone = template.content.cloneNode(true);

    const title = clone.querySelector(".title");
    const code = clone.querySelector(".episode-code");
    const image = clone.querySelector(".image");
    const summary = clone.querySelector(".summary");

    code.textContent =
      `S${String(episode.season).padStart(2,"0")}E${String(episode.number).padStart(2,"0")}`;

    title.innerHTML = `<a href="${episode.url}" target="_blank">${episode.name}</a>`;

    image.src = episode.image.medium;
    image.alt = episode.name;
    summary.innerHTML = episode.summary;

    return clone;
  });

  container.innerHTML = "";
  container.append(...cards);

  filteredEpisodes = cards.length.toString();

  numberOfEpisodes.textContent = `Displaying ${filteredEpisodes} out of ${totalEpisodes} episodes`
}

// live search function
searchBox.addEventListener("keyup", userSearch);

function userSearch() {
  const searchTerm = searchBox.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter(episode => {
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
    );
  });

  const container = document.getElementById("card-container");
  container.innerHTML = "";
  makePageForEpisodes(filteredEpisodes);
}

// populate dropdown
function populateDropdown() {
  allEpisodes.forEach(episode => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${String(episode.season).padStart(2,"0")}E${String(episode.number).padStart(2,"0")} ${episode.name}`;
    episodeDropdown.appendChild(option);
  });
}

function setupDropdownListener () {
  episodeDropdown.addEventListener("change", (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "all") {
      makePageForEpisodes(allEpisodes);
      return;
    }
    
    const selectedId = parseInt(e.target.value);
    const selectedEpisode = allEpisodes.filter(ep => ep.id === selectedId);
    makePageForEpisodes(selectedEpisode);
  });
}

window.onload = setup;

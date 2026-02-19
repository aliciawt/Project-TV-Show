let allEpisodes = [];
let filteredEpisodes;

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const template = document.getElementById("template");
  
  const totalEpisodes = allEpisodes.length;

  const cards = episodeList.map(episode => {
    const clone = template.content.cloneNode(true);

    const title = clone.querySelector(".title");
    const code = clone.querySelector(".episode-code");
    const image = clone.querySelector(".image");
    const summary = clone.querySelector(".summary");

    title.innerHTML = `<a href="${episode.url}" target="_blank">${episode.name}</a>`;

    code.textContent =
      `S${String(episode.season).padStart(2,"0")}E${String(episode.number).padStart(2,"0")}`;

    image.src = episode.image.medium;
    image.alt = episode.name;
    summary.innerHTML = episode.summary;

    return clone;
  });

  const container = document.getElementById("card-container");
  container.append(...cards);

  filteredEpisodes = cards.length.toString();

  const numberOfEpisodes = document.getElementById("number-of-episodes");
  numberOfEpisodes.textContent = `Displaying ${filteredEpisodes} out of ${totalEpisodes} episodes`
}

const searchBox = document.getElementById("search-box");

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

window.onload = setup;

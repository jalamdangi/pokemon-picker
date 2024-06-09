const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
let nextUrl = baseUrl;
let caughtPokemon = [];

// Helper function to fetch data from the API
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function parseUrl(url) {
    return url.substring(url.substring(0, url.length - 1).lastIndexOf('/') + 1, url.length - 1)
  }

// Function to render a single pokemon card
function renderPokemon(pokemon) {
    const id = parseUrl(pokemon.url);
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-id', id); // Set data-id attribute with the Pokemon ID
    const isCaught = caughtPokemon.includes(pokemon.name);
    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${pokemon.name}">
      <p>${pokemon.name}</p>
      <button class="catch-btn">${isCaught ? 'Release' : 'Catch'}</button>
    `;
    card.querySelector('.catch-btn').addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent card click event from firing
      toggleCatchStatus(pokemon);
      updateCatchButton(pokemon);
    });
    card.addEventListener('click', () => showPokemonDetails(pokemon));
    document.getElementById('pokemon-list').appendChild(card);
}

// Function to toggle the catch status of a pokemon
function toggleCatchStatus(pokemon) {
    const index = caughtPokemon.indexOf(pokemon.name);
    if (index === -1) {
      caughtPokemon.push(pokemon.name);
    } else {
      caughtPokemon.splice(index, 1);
    }
    localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
}

// Function to update the catch button text based on the catch status
function updateCatchButton(pokemon) {
    const id = parseUrl(pokemon.url);
    const card = document.querySelector(`.card[data-id="${id}"]`); // Query using data-id attribute
    if (!card) return;
    const isCaught = caughtPokemon.includes(pokemon.name);
    card.querySelector('.catch-btn').innerText = isCaught ? 'Release' : 'Catch';
}

  

// Function to render a list of pokemon
function renderPokemonList(data) {
  data.results.forEach(pokemon => {
    renderPokemon(pokemon);
  });
  nextUrl = data.next;
}

// Function to load more pokemon when the "Load More" button is clicked
async function loadMorePokemon() {
  const data = await fetchData(nextUrl);
  renderPokemonList(data);
}

// Function to show detailed information about a pokemon
async function showPokemonDetails(pokemon) {
  const data = await fetchData(pokemon.url);
  const modal = document.getElementById('pokemon-modal');
  const modalContent = document.getElementById('pokemon-details');
  modalContent.innerHTML = `
    <h2>${data.name}</h2>
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png" alt="${data.name}">
    <p>Height: ${data.height}</p>
    <p>Weight: ${data.weight}</p>
    <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
    <p>Types: ${data.types.map(type => type.type.name).join(', ')}</p>
  `;
  modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
  document.getElementById('pokemon-modal').style.display = 'none';
}

// Event listener for the "Load More" button
document.getElementById('load-more').addEventListener('click', loadMorePokemon);

// Event listener to close the modal when the user clicks outside of it
window.addEventListener('click', (event) => {
  if (event.target === document.getElementById('pokemon-modal')) {
    closeModal();
  }
});

// Initial fetch to load the first 20 pokemon
fetchData(baseUrl)
  .then(data => renderPokemonList(data))
  .catch(error => console.error('Error:', error));

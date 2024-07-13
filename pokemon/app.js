document.addEventListener("DOMContentLoaded", function() {
    let pokemonData; // Define pokemonData variable in a scope accessible to all functions

    // Define colors for Pokémon types
    const typeColors = {
        normal: '#a8a878',
        fighting: '#992620',
        flying: '#a890f0',
        poison: '#a040a0',
        ground: '#e0c068',
        rock: '#b8a038',
        bug: '#a8b820',
        ghost: '#705898',
        steel: '#b8b8d0',
        fire: '#f08030',
        water: '#6890f0',
        grass: '#78c850',
        electric: '#f8d030',
        psychic: '#f85888',
        ice: '#98d8d8',
        dragon: '#7038f8',
        dark: '#705848',
        fairy: '#ee99ac'
        // Add more colors as needed
    };

     // Function to calculate the complementary color
     function getComplementaryColor(hex) {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');

        // Parse the hex color
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Calculate the complementary color
        r = (255 - r).toString(16).padStart(2, '0');
        g = (255 - g).toString(16).padStart(2, '0');
        b = (255 - b).toString(16).padStart(2, '0');

        // Return the complementary color as a hex string
        return `#${r}${g}${b}`;
    }

    // Define the displayPokemonData function
    function displayPokemonData(data, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage) {
        // Filter the data based on the search term and types
        const filteredData = data.filter(pokemon => {
            const nameMatch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Check if all selected types are included in the Pokémon's types
            const typeMatch = typesToFilter.length === 0 || typesToFilter.every(type => pokemon.types.includes(type.toLowerCase()));

            const legendaryMatch = !legendaryFilter || pokemon.legendary;
            const mythicalMatch = !mythicalFilter || pokemon.mythical;


            return nameMatch && typeMatch && legendaryMatch && mythicalMatch;
        });

        // Calculate the index of the first and last Pokémon to display on the current page
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = Math.min(startIndex + pokemonPerPage, filteredData.length);

        // Create a new HTML element for each Pokémon on the current page
        const pokemonList = document.getElementById('pokemon-list');
        if (!pokemonList) {
            console.error('Pokemon list element not found');
            return;
        }
        pokemonList.innerHTML = '';
        for (let i = startIndex; i < endIndex; i++) {
            const pokemon = filteredData[i];
            const pokemonElement = document.createElement('div');
            pokemonElement.classList.add('pokemon-card');

            // Generate HTML for types with individual colors
            const typeHTML = pokemon.types.map(type => {
                if (typeColors[type.toLowerCase()]) {
                    return `<span style="color: ${typeColors[type.toLowerCase()]}">${type}</span>`;
                } else {
                    return type; // Fallback if no color is defined for the type
                }
            }).join(' | ');

            // Set the color of the Pokémon's name based on its first type
            const nameColor = typeColors[pokemon.types[0].toLowerCase()] || '#000';

            pokemonElement.innerHTML = `
                <h2 class="pokemon-name" style="color: ${pokemon.color}">${pokemon.name}</h2>
                <p>${typeHTML}</p>
                <img src="${pokemon.sprite}" alt="error.png" class="pokemon-image">
                <img src="${pokemon.art}" alt="${pokemon.name} official art" class="officialimage">
            `;
            pokemonElement.addEventListener('click', () => {
                displayPokemonDetails(pokemon);
            });
            pokemonList.appendChild(pokemonElement);
        }

        // Add navigation buttons to the page
        const pagination = document.getElementById('pagination');
        if (!pagination) {
            console.error('Pagination element not found');
            return;
        }
        pagination.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.classList.add('prev-button'); // Add class to style in CSS
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPokemonData(data, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage); // Use 'data' instead of 'pokemonData'
            }
        });
        if (currentPage > 1) {
            pagination.appendChild(prevButton);
        } else {
            prevButton.disabled = true;
            prevButton.classList.add('disabled');
            pagination.appendChild(prevButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.classList.add('next-button'); // Add class to style in CSS
        nextButton.addEventListener('click', () => {
            if (endIndex < filteredData.length) {
                currentPage++;
                displayPokemonData(data, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage); // Use 'data' instead of 'pokemonData'
            }
        });
        if (endIndex < filteredData.length) {
            pagination.appendChild(nextButton);
        } else {
            nextButton.disabled = true;
            nextButton.classList.add('disabled');
            pagination.appendChild(nextButton);
        }
    }

  // Define the types array
const types = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

// Add a checkbox group to filter by types
const typeFilter = document.getElementById('type-filter');
if (!typeFilter) {
    console.error('Type filter element not found');
    return;
}

// Define the searchTerm variable
let searchTerm = '';

// Define the typesToFilter array
let typesToFilter = [];

let legendaryFilter = false; // Define legendaryFilter boolean
let mythicalFilter = false; // Define mythicalFilter boolean

// Define the currentPage and pokemonPerPage variables
let currentPage = 1;
const pokemonPerPage = 20;

// Function to setup filters by Legendary and Mythical status
function setupLegendaryAndMythicalFilters() {
    // Create label for Legendary filter
    const legendaryLabel = document.createElement('label');
    legendaryLabel.htmlFor = 'filter-legendary';
    legendaryLabel.classList.add('legendary');
    legendaryLabel.textContent = 'Legendary';

    legendaryLabel.addEventListener('click', () => {
        legendaryFilter = !legendaryFilter; // Toggle the legendary filter
        currentPage = 1; // Reset currentPage when filter changes
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);

        // Toggle rainbow effect
        if (legendaryFilter) {
            legendaryLabel.classList.add('click');
            legendaryLabel.style.animation = 'rainbow 5s infinite'; // Rainbow color example
            legendaryLabel.style.fontWeight = '900'; 
            legendaryLabel.style.scale = '1.1';
            legendaryLabel.style.border = 'solid black 2px';
            legendaryLabel.style.boxShadow = '0px 0px 0px 2px black inset';
            legendaryLabel.style.padding = '5px 10px';
        } else {
            legendaryLabel.classList.remove('click');
            legendaryLabel.style.animation = ''; // Reset color
            legendaryLabel.style.backgroundColor = '#FFD700'; // Reset background color
            legendaryLabel.style.fontWeight = '600';
            legendaryLabel.style.border = '1px solid #ccc';
            legendaryLabel.style.boxShadow = '';
            legendaryLabel.style.padding = '5px 10px';
            legendaryLabel.style.scale = '1';
        }
    });

    // Create label for Mythical filter
    const mythicalLabel = document.createElement('label');
    mythicalLabel.htmlFor = 'filter-mythical';
    mythicalLabel.classList.add('mythical');
    mythicalLabel.textContent = 'Mythical';

    mythicalLabel.addEventListener('click', () => {
        mythicalFilter = !mythicalFilter; // Toggle the mythical filter
        currentPage = 1; // Reset currentPage when filter changes
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);

        // Toggle rainbow effect
        if (mythicalFilter) {
            mythicalLabel.classList.add('click');
            mythicalLabel.style.animation = 'rainbow 5s infinite'; // Rainbow color example
            mythicalLabel.style.fontWeight = '900'; 
            mythicalLabel.style.scale = '1.1';
            mythicalLabel.style.border = 'solid black 2px';
            mythicalLabel.style.boxShadow = '0px 0px 0px 2px black inset';
            mythicalLabel.style.padding = '5px 10px';
        } else {
            mythicalLabel.classList.remove('click');
            mythicalLabel.style.animation = ''; // Reset color
            mythicalLabel.style.backgroundColor = '#C0C0C0'; // Reset background color
            mythicalLabel.style.fontWeight = '600';
            mythicalLabel.style.border = '1px solid #ccc';
            mythicalLabel.style.boxShadow = '';
            mythicalLabel.style.padding = '5px 10px';
            mythicalLabel.style.scale = '1';
        }
    });

    // Append labels to typeFilter element
    typeFilter.appendChild(legendaryLabel);
    typeFilter.appendChild(mythicalLabel);
}

// Function to apply color styling and add event listeners to type labels
types.forEach(type => {
    const label = document.createElement('label');
    label.htmlFor = `type-${type}`;
    label.textContent = type;

    // Apply color to type text
    if (typeColors[type.toLowerCase()]) {
        const textColor = typeColors[type.toLowerCase()];
        const backgroundColor = getComplementaryColor(textColor);

        label.style.color = textColor;
        label.style.backgroundColor = backgroundColor;

        label.addEventListener('click', () => {
            label.classList.toggle('checked');
            typesToFilter = Array.from(typeFilter.querySelectorAll('.checked')).map(label => label.textContent.toLowerCase());
            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);
        });
    }

    typeFilter.appendChild(label);
});

// Add event listener to reset filters when Pokédex is clicked
const pokedex = document.getElementById('pokedex');
if (!pokedex) {
    console.error('Pokédex element not found');
    return;
}

pokedex.addEventListener('click', () => {
    // Reset filters
    legendaryFilter = false;
    mythicalFilter = false;
    searchTerm = '';
    typesToFilter = [];
    currentPage = 1; // Reset currentPage when filter changes
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);

    // Remove rainbow effect
    document.querySelector('.legendary').classList.remove('click');
    document.querySelector('.legendary').style.animation = ''; // Reset color
    document.querySelector('.legendary').style.backgroundColor = '#FFD700'; // Reset background color
    document.querySelector('.legendary').style.fontWeight = '600';
    document.querySelector('.legendary').style.border = '1px solid #ccc';
    document.querySelector('.legendary').style.boxShadow = '';
    document.querySelector('.legendary').style.padding = '5px 10px';
    document.querySelector('.legendary').style.scale = '1';

    document.querySelector('.mythical').classList.remove('click');
    document.querySelector('.mythical').style.animation = ''; // Reset color
    document.querySelector('.mythical').style.backgroundColor = '#C0C0C0'; // Reset background color
    document.querySelector('.mythical').style.fontWeight = '600';
    document.querySelector('.mythical').style.border = '1px solid #ccc';
    document.querySelector('.mythical').style.boxShadow = '';
    document.querySelector('.mythical').style.padding = '5px 10px';
    document.querySelector('.mythical').style.scale = '1';

    // Clear the search bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.value = '';
    }

    // Uncheck all type filters
    const typeFilterCheckboxes = document.querySelectorAll('#type-filter label');
    typeFilterCheckboxes.forEach(label => {
        label.classList.remove('checked');
        label.style.color = typeColors[label.textContent.toLowerCase()];
        label.style.backgroundColor = getComplementaryColor(typeColors[label.textContent.toLowerCase()]);
    });

    // Update the display
    displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);
});

// Call setup function after DOM content is loaded
setupLegendaryAndMythicalFilters();


    // Add a search bar to the page
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        console.error('Search bar element not found');
        return;
    }
    searchBar.addEventListener('input', event => {
        searchTerm = event.target.value.trim();
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);
    });

    // Fetch the contents of the text file
    fetch('pokemon_data.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Split the data into an array of lines
            const lines = data.trim().split('\n');

            // Parse each line into an object
            pokemonData = lines.map(line => {
                const [name, types, height, weight, abilities, sprite, art, totalBaseStats, habitat, color, legendary, mythical] = line.split(';');
                
                // Handle multiple types separated by comma
                const typeList = types.split(',').map(type => {
                    return {
                        type: {
                            name: type.trim()
                        }
                    };
                });
            
                return {
                    name: name.trim(),
                    types: typeList.map(type => type.type.name), // Transform types to an array of type names
                    height: parseFloat(height.trim()),
                    weight: parseFloat(weight.trim()),
                    abilities: abilities.trim(),
                    sprite: sprite.trim(),
                    art: art.trim(),
                    totalBaseStats: parseInt(totalBaseStats.trim()), // Convert totalBaseStats to an integer
                    habitat: habitat.trim(),
                    color: color.trim(), // Trim color value
                    legendary: legendary === 'true',
                    mythical: mythical === 'true'
                };
            });

            // Display the initial data on the page
            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
        });

    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.querySelector('.modal-content');
    const closeButtons = document.querySelectorAll('.close, .close2'); // Select both close buttons

    // Close the modal when the close button or outside modal area is clicked
    window.onclick = function(event) {
        if (event.target === modal || event.target.classList.contains('close') || event.target.classList.contains('close2')) {
            modal.style.display = 'none';
        }
    };

    // Function to display the modal with Pokemon details
    function displayPokemonDetails(pokemon) {
        const modalDetails = document.getElementById('pokemon-details');

        // Generate HTML for types with individual colors
        const typeHTML = pokemon.types.map(type => {
            if (typeColors[type.toLowerCase()]) {
                return `<span style="color: ${typeColors[type.toLowerCase()]}">${type}</span>`;
            } else {
                return type; // Fallback if no color is defined for the type
            }
        }).join(' | ');

        const nameColor = typeColors[pokemon.types[0].toLowerCase()] || '#000';

        let legendaryMythicalHTML = '';
        if (pokemon.legendary) {
            legendaryMythicalHTML += `<p class="PPP Pleg" >Legendary</p>`;
        }
        if (pokemon.mythical) {
            legendaryMythicalHTML += `<p class= "PPP Pmyth" >Mythical</p>`;
        }

        modalDetails.innerHTML = `
            <div style="color: ${pokemon.color}">${pokemon.name}</div>
            <p class="Mtypes">${typeHTML}</p>
            <p>Height: ${pokemon.height} m</p>
            <p>Weight: ${pokemon.weight} kg</p>
            <p>Abilities: ${pokemon.abilities}</p>
            <img src="${pokemon.art}" alt="${pokemon.name} official art">
            <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
            <p>Stat Total: ${pokemon.totalBaseStats}</p>
            <p>Habitat: ${pokemon.habitat}</p>
            ${legendaryMythicalHTML}
        `;
        modal.style.display = 'block'; // Display the modal
    }

});

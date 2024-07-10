document.addEventListener('DOMContentLoaded', () => {
    const pokedex = document.getElementById('pokedex');
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-button');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.getElementById('pokemon-details');
    const closeModal = document.querySelectorAll('.close, .close2');
    const typeFilter = document.getElementById('type-filter');

    let currentPage = 1;
    const limit = 20;
    let offset = 0;
    let allPokemon = [];
    let filteredPokemon = [];

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

    const fetchAllPokemon = async () => {
        const url1 = 'https://pokeapi.co/api/v2/pokemon?limit=10000';
        const url2 = 'https://pokeapi.co/api/v2/pokemon-habitat?limit=10000';
        const url3 = 'https://pokeapi.co/api/v2/pokemon-color?limit=10000';
        const url4 = 'https://pokeapi.co/api/v2/pokemon-species?limit=10000';

        // Fetch data from all URLs concurrently
        const [response1, response2, response3, response4] = await Promise.all([
            fetch(url1),
            fetch(url2),
            fetch(url3),
            fetch(url4)
        ]);

        // Parse JSON data from responses
        const data1 = await response1.json(); // Pokémon
        const data2 = await response2.json(); // Pokémon habitats
        const data3 = await response3.json(); // Pokémon colors
        const data4 = await response4.json(); // Pokémon species

        // Store the initial list of Pokémon
        allPokemon = data1.results;

        // Create a mapping of species to their habitats
        const habitatMap = {};
        await Promise.all(data2.results.map(async (habitat) => {
            const habitatResponse = await fetch(habitat.url);
            const habitatData = await habitatResponse.json();
            habitatData.pokemon_species.forEach(species => {
                habitatMap[species.name] = habitat.name === 'rare' ? 'Unknown' : habitat.name;
            });
        }));

        // Create a mapping of species to their colors
        const colorMap = {};
        await Promise.all(data3.results.map(async (color) => {
            const colorResponse = await fetch(color.url);
            const colorData = await colorResponse.json();
            colorData.pokemon_species.forEach(species => {
                colorMap[species.name] = color.name;
            });
        }));

        // Fetch details for each Pokémon and merge habitat and color information
        await Promise.all(allPokemon.map(async (pokemon) => {
            const pokemonDetails = await fetchPokemonDetails(pokemon.url);
            pokemonDetails.habitat = habitatMap[pokemon.name] || 'Unknown'; // Assign habitat name or default to 'Unknown'
            pokemonDetails.color = colorMap[pokemon.name] || 'Unknown'; // Assign color name or default to 'Unknown'
            Object.assign(pokemon, pokemonDetails); // Merge details into the original Pokémon object
        }));

        // Check and fetch additional forms like Mega Evolution
        await fetchAdditionalForms(data4.results);

        // Populate type filter dropdown
        populateTypeFilter();

        // Initially display all Pokémon
        filteredPokemon = allPokemon;
        displayPokemon(filteredPokemon.slice(offset, offset + limit));
    };

    const fetchPokemonDetails = async (url) => {
        const res = await fetch(url);
        const pokemon = await res.json();
        pokemon.height = pokemon.height / 10; // Convert height to meters
        pokemon.weight = pokemon.weight / 10; // Convert weight to kilograms
        pokemon.abilities = pokemon.abilities.map(ability => ability.ability.name);
        pokemon.types = pokemon.types.map(type => type.type.name);
        return pokemon;
    };

    const fetchAdditionalForms = async (speciesList) => {
        await Promise.all(speciesList.map(async (species) => {
            const speciesResponse = await fetch(species.url);
            const speciesData = await speciesResponse.json();
            // Check for forms like Mega Evolution
            const megaForm = speciesData.varieties.find(variety => variety.is_mega);
            if (megaForm) {
                const megaPokemon = await fetchPokemonDetails(megaForm.pokemon.url);
                allPokemon.push(megaPokemon); // Add Mega Pokémon to the list
            }
        }));
    };

    const displayPokemon = (pokemonList) => {
        pokedex.innerHTML = '';
        pokemonList.forEach(pokemon => {
            const pokemonElement = document.createElement('div');
            pokemonElement.classList.add('pokemon');
            const colorStyle = `color: ${pokemon.color};`;
            pokemonElement.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h2 style="${colorStyle}">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <p>Type: ${pokemon.types.map(type => {
                    const typeName = type;
                    const typeColor = typeColors[typeName] || '#ffffff'; // Default to white if no color found
                    return `<span class="pokemon-type" style="background-color: ${typeColor};">${typeName}</span>`;
                }).join(', ')}</p>
            `;
            pokemonElement.addEventListener('click', () => openModal(pokemon));
            pokedex.appendChild(pokemonElement);
        });
        updatePagination();
    };

    const openModal = (pokemon) => {
        const colorStyle = `color: ${pokemon.color};`;
        modalContent.innerHTML = `
            <div class="modal-header">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
                <h2 style="${colorStyle}">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            </div>
            <div class="modal-body">
                <p>Type: ${pokemon.types.map(type => {
                    const typeName = type;
                    const typeColor = typeColors[typeName] || '#ffffff'; // Default to white if no color found
                    return `<span class="pokemon-type" style="background-color: ${typeColor};">${typeName}</span>`;
                }).join(' and ')}</p>
                <p>Height: ${pokemon.height.toFixed(1)} m</p>
                <p>Weight: ${pokemon.weight.toFixed(1)} kg</p>
                <p>Abilities: ${pokemon.abilities.join(' or ')}</p>
                <p>Habitat: ${pokemon.habitat}</p>
                <a class="pokemon-link" href="https://pokemondb.net/pokedex/${pokemon.name}" target="_blank">More details on PokemonDB</a>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeModal.forEach(element => {
        element.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    const updatePagination = () => {
        offset = (currentPage - 1) * limit;
        const totalPages = Math.ceil(filteredPokemon.length / limit);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || filteredPokemon.length === 0;
    };

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            displayPokemon(filteredPokemon.slice(offset, offset + limit));
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredPokemon.length / limit);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            displayPokemon(filteredPokemon.slice(offset, offset + limit));
        }
    });

    searchButton.addEventListener('click', () => {
        filterPokemon();
    });

    searchInput.addEventListener('input', () => {
        filterPokemon();
    });

    typeFilter.addEventListener('change', () => {
        filterPokemon();
    });

    const populateTypeFilter = () => {
        const allTypes = allPokemon.reduce((types, pokemon) => {
            pokemon.types.forEach(type => {
                if (!types.includes(type)) {
                    types.push(type);
                }
            });
            return types;
        }, []);

        // Sort types alphabetically
        allTypes.sort();

        // Clear and populate type filter dropdown
        typeFilter.innerHTML = '<option value="">All types</option>';
        allTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.toLowerCase();
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeFilter.appendChild(option);
        });
    };

    const filterPokemon = () => {
        const query = searchInput.value.trim().toLowerCase();
        const selectedType = typeFilter.value.toLowerCase();

        // Filter by name and selected type
        filteredPokemon = allPokemon.filter(pokemon => {
            const nameMatches = pokemon.name.includes(query);
            const typeMatches = selectedType === '' || pokemon.types.includes(selectedType);
            return nameMatches && typeMatches;
        });

        currentPage = 1;
        updatePagination();
        displayPokemon(filteredPokemon.slice(offset, offset + limit));
    };

    fetchAllPokemon();
});

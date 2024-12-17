document.addEventListener("DOMContentLoaded", function() {
    let pokemonData = [];
    const pokemonMap = {}; // Lookup map for Pokémon by name
    let filteredData = [];
    let searchTerm = '';
    let typesToFilter = [];
    let legendaryFilter = false;
    let mythicalFilter = false;
    let currentPage = 1;
    const pokemonPerPage = 20;

    const typeColors = {
        normal: '#a8a878',
        fighting: '#c03028',
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
    };

    // Placeholder Images
    const PLACEHOLDER_SPRITE = 'https://via.placeholder.com/150?text=No+Sprite';
    const PLACEHOLDER_ART = 'https://via.placeholder.com/300?text=No+Art';
    const PLACEHOLDER_PREV_EVO = 'https://via.placeholder.com/150?text=No+Previous+Evolution';
    const PLACEHOLDER_NEXT_EVO = 'https://via.placeholder.com/150?text=No+Upcoming+Evolution';

    // Fetch and display Pokémon data from API
    function fetchPokemonData() {
        fetch('/api/pokemons') // Replace with your actual API endpoint
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok (Status: ${response.status})`);
                }
                return response.json(); // Parse the response as JSON
            })
            .then(data => {
                pokemonData = data; // Assign the fetched data to the global pokemonData variable

                // Create the lookup map
                data.forEach(pokemon => {
                    pokemonMap[pokemon.name.toLowerCase()] = pokemon;
                });

                displayPokemonData(); // Display the Pokémon data
                updatePaginationControls(); // Initialize pagination controls
            })
            .catch(error => {
                console.error('Error fetching Pokémon data:', error);
                // Optionally, display an error message to the user
                const pokemonList = document.getElementById('pokemon-list');
                if (pokemonList) {
                    pokemonList.innerHTML = `<p style="color: red;">Failed to load Pokémon data. Please try again later.</p>`;
                }
            });
    }
    // Function to display Pokémon data based on current filters and pagination
    function displayPokemonData() {
        const hpMin = parseInt(document.getElementById('hp-slider').value) || 0;
        const attackMin = parseInt(document.getElementById('attack-slider').value) || 0;
        const defenseMin = parseInt(document.getElementById('defense-slider').value) || 0;
        const specialAttackMin = parseInt(document.getElementById('special-attack-slider').value) || 0;
        const specialDefenseMin = parseInt(document.getElementById('special-defense-slider').value) || 0;
        const speedMin = parseInt(document.getElementById('speed-slider').value) || 0;
        const totalBaseStatsMin = parseInt(document.getElementById('total-base-stats-slider').value) || 0;

        // Filter the data based on search, type, legendary, mythical, and slider values
        filteredData = pokemonData.filter(pokemon => {
            const nameMatch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typesToFilter.length === 0 || typesToFilter.every(type => pokemon.types.map(t => t.toLowerCase()).includes(type.toLowerCase()));
            const legendaryMatch = !legendaryFilter || pokemon.isLegendary === true;
            const mythicalMatch = !mythicalFilter || pokemon.isMythical === true;
            const hpMatch = pokemon.stats.hp >= hpMin;
            const attackMatch = pokemon.stats.attack >= attackMin;
            const defenseMatch = pokemon.stats.defense >= defenseMin;
            const specialAttackMatch = pokemon.stats.specialAttack >= specialAttackMin;
            const specialDefenseMatch = pokemon.stats.specialDefense >= specialDefenseMin;
            const speedMatch = pokemon.stats.speed >= speedMin;
            const totalBaseStatsMatch = pokemon.totalBaseStats >= totalBaseStatsMin;

            return nameMatch && typeMatch && legendaryMatch && mythicalMatch && hpMatch && attackMatch && defenseMatch && specialAttackMatch && specialDefenseMatch && speedMatch && totalBaseStatsMatch;
        });

        // Calculate pagination
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = Math.min(startIndex + pokemonPerPage, filteredData.length);
        const pokemonList = document.getElementById('pokemon-list');
        pokemonList.innerHTML = ''; // Clear existing content

        for (let i = startIndex; i < endIndex; i++) {
            const pokemon = filteredData[i];
            const pokemonElement = document.createElement('div');
            pokemonElement.classList.add('pokemon-card');

            const typeHTML = pokemon.types.map(type => {
                const color = typeColors[type.toLowerCase()] || '#000';
                return `<span style="color: ${color}">${capitalizeFirstLetter(type)}</span>`;
            }).join(' | ');

            if (pokemon.isLegendary || pokemon.isMythical) {
                pokemonElement.innerHTML = `
                    <h2 class="pokemon-name" style="
                        background: linear-gradient(to right, #6666ff, #0099ff, #00ff00, #ff3399, #6666ff);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                        animation: rainbow_animation 6s alternate-reverse linear infinite;
                        background-size: 400% 100%;
                    ">${capitalizeFirstLetter(pokemon.name)}</h2>
                    <p>${typeHTML}</p>
                    <img 
                        src="${pokemon.spriteLink || PLACEHOLDER_SPRITE}" 
                        alt="${capitalizeFirstLetter(pokemon.name)} sprite" 
                        class="pokemon-image" 
                        onerror="this.onerror=null; this.src='${PLACEHOLDER_SPRITE}';"
                    >
                    <img 
                        src="${pokemon.officialArtLink || PLACEHOLDER_ART}" 
                        alt="${capitalizeFirstLetter(pokemon.name)} official art" 
                        class="officialimage" 
                        onerror="this.onerror=null; this.src='${PLACEHOLDER_ART}';"
                    >
                `;
            } else {
                pokemonElement.innerHTML = `
                    <h2 class="pokemon-name" style="color: ${pokemon.color || '#000'};">${capitalizeFirstLetter(pokemon.name)}</h2>
                    <p>${typeHTML}</p>
                    <img 
                        src="${pokemon.spriteLink || PLACEHOLDER_SPRITE}" 
                        alt="${capitalizeFirstLetter(pokemon.name)} sprite" 
                        class="pokemon-image" 
                        onerror="this.onerror=null; this.src='${PLACEHOLDER_SPRITE}';"
                    >
                    <img 
                        src="${pokemon.officialArtLink || PLACEHOLDER_ART}" 
                        alt="${capitalizeFirstLetter(pokemon.name)} official art" 
                        class="officialimage" 
                        onerror="this.onerror=null; this.src='${PLACEHOLDER_ART}';"
                    >
                `;
            }

            // Add click event to open modal with details
            pokemonElement.addEventListener('click', () => {
                displayPokemonDetails(pokemon);
            });

            pokemonList.appendChild(pokemonElement);
        }

        updatePaginationControls(); // Update pagination after filtering
    }

    // Function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Function to get complementary color (if needed)
    function getComplementaryColor(hex) {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = (255 - r).toString(16).padStart(2, '0');
        g = (255 - g).toString(16).padStart(2, '0');
        b = (255 - b).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    // Slider Elements
    const hpSlider = document.getElementById('hp-slider');
    const attackSlider = document.getElementById('attack-slider');
    const defenseSlider = document.getElementById('defense-slider');
    const specialAttackSlider = document.getElementById('special-attack-slider');
    const specialDefenseSlider = document.getElementById('special-defense-slider');
    const speedSlider = document.getElementById('speed-slider');
    const totalBaseStatsSlider = document.getElementById('total-base-stats-slider');

    // Slider Value Display Elements
    const hpValue = document.getElementById('hp-value');
    const attackValue = document.getElementById('attack-value');
    const defenseValue = document.getElementById('defense-value');
    const specialAttackValue = document.getElementById('special-attack-value');
    const specialDefenseValue = document.getElementById('special-defense-value');
    const speedValue = document.getElementById('speed-value');
    const totalBaseStatsValue = document.getElementById('total-base-stats-value');

    // Update Slider Values and Refresh Display
    function updateSliderValues() {
        hpValue.textContent = hpSlider.value;
        attackValue.textContent = attackSlider.value;
        defenseValue.textContent = defenseSlider.value;
        specialAttackValue.textContent = specialAttackSlider.value;
        specialDefenseValue.textContent = specialDefenseSlider.value;
        speedValue.textContent = speedSlider.value;
        totalBaseStatsValue.textContent = totalBaseStatsSlider.value;
        displayPokemonData();
    }

    // Reset Sliders to Default
    function resetSliders() {
        hpSlider.value = 0;
        attackSlider.value = 0;
        defenseSlider.value = 0;
        specialAttackSlider.value = 0;
        specialDefenseSlider.value = 0;
        speedSlider.value = 0;
        totalBaseStatsSlider.value = 0;
        updateSliderValues();
    }

    // Add Event Listeners to Sliders
    hpSlider.addEventListener('input', updateSliderValues);
    attackSlider.addEventListener('input', updateSliderValues);
    defenseSlider.addEventListener('input', updateSliderValues);
    specialAttackSlider.addEventListener('input', updateSliderValues);
    specialDefenseSlider.addEventListener('input', updateSliderValues);
    speedSlider.addEventListener('input', updateSliderValues);
    totalBaseStatsSlider.addEventListener('input', updateSliderValues);

    // Toggle Sliders Visibility
    const toggleSlidersButton = document.getElementById('toggle-sliders');
    const sliderFilters = document.getElementById('slider-filters');

    toggleSlidersButton.addEventListener('click', () => {
        sliderFilters.classList.toggle('hidden');
    });

    // Pagination Controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredData.length / pokemonPerPage);
        const pageSelect = document.getElementById('page-select');
        if (!pageSelect) return;

        pageSelect.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Page ${i}`;
            if (i === currentPage) {
                option.selected = true;
            }
            pageSelect.appendChild(option);
        }

        // Disable/Enable Pagination Buttons
        document.getElementById('first-page').disabled = currentPage === 1;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
        document.getElementById('last-page').disabled = currentPage === totalPages || totalPages === 0;
    }

    // Pagination Event Listeners
    document.getElementById('first-page').addEventListener('click', () => {
        currentPage = 1;
        displayPokemonData();
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPokemonData();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / pokemonPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPokemonData();
        }
    });

    document.getElementById('last-page').addEventListener('click', () => {
        currentPage = Math.ceil(filteredData.length / pokemonPerPage);
        displayPokemonData();
    });

    document.getElementById('page-select').addEventListener('change', (event) => {
        currentPage = parseInt(event.target.value);
        displayPokemonData();
    });

    // Define Pokémon Types
    const types = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter) {
        console.error('Type filter element not found');
        return;
    }

    // Setup Type Filters
    types.forEach(type => {
        const label = document.createElement('label');
        label.htmlFor = `type-${type}`;
        label.textContent = type;
        label.classList.add('pokemon-type-label', 'type-filter-label'); // Added 'pokemon-type-label'

        if (typeColors[type.toLowerCase()]) {
            const textColor = typeColors[type.toLowerCase()];
            const backgroundColor = getComplementaryColor(textColor);

            label.style.color = textColor;
            label.style.backgroundColor = backgroundColor;

            label.addEventListener('click', () => {
                label.classList.toggle('checked');
                // Select only labels with 'pokemon-type-label' class
                typesToFilter = Array.from(typeFilter.querySelectorAll('.pokemon-type-label.checked'))
                    .map(label => label.textContent.toLowerCase());
                currentPage = 1;
                displayPokemonData();
            });
        }

        typeFilter.appendChild(label);
    });

    // Separate Setup for Legendary and Mythical Filters
    function setupLegendaryAndMythicalFilters() {
        const legendaryLabel = document.createElement('label');
        legendaryLabel.htmlFor = 'filter-legendary';
        legendaryLabel.classList.add('legendary-mythical-label', 'filter-type-label', 'legendary-label'); // Added 'legendary-mythical-label'
        legendaryLabel.textContent = 'Legendary';

        legendaryLabel.addEventListener('click', () => {
            legendaryLabel.classList.toggle('checked');
            legendaryFilter = !legendaryFilter;
            currentPage = 1;
            displayPokemonData();
            legendaryLabel.classList.toggle('active', legendaryFilter);
        });

        const mythicalLabel = document.createElement('label');
        mythicalLabel.htmlFor = 'filter-mythical';
        mythicalLabel.classList.add('legendary-mythical-label', 'filter-type-label','mythic-label'); // Added 'legendary-mythical-label'
        mythicalLabel.textContent = 'Mythical';

        mythicalLabel.addEventListener('click', () => {
            mythicalLabel.classList.toggle('checked');
            mythicalFilter = !mythicalFilter;
            currentPage = 1;
            displayPokemonData();
            mythicalLabel.classList.toggle('active', mythicalFilter);
        });

        typeFilter.appendChild(legendaryLabel);
        typeFilter.appendChild(mythicalLabel);
    }

    // Pokedex Click Event (Reset Functionality)
    const pokedex = document.getElementById('pokedex');
    if (!pokedex) {
        console.error('Pokédex element not found');
    } else {
        pokedex.addEventListener('click', () => {
            // Reset Filters
            legendaryFilter = false;
            mythicalFilter = false;
            searchTerm = '';
            typesToFilter = [];
            currentPage = 1;
            resetSliders();

            // Reset Search Bar
            const searchBar = document.getElementById('search-bar');
            if (searchBar) {
                searchBar.value = '';
            }

            // Reset Type and Legendary/Mythical Filters
            const typeFilterLabels = typeFilter.querySelectorAll('.type-filter-label, .legendary-mythical-label');
            typeFilterLabels.forEach(label => {
                label.classList.remove('checked', 'active');
            });

            displayPokemonData();
        });
    }

    // Search Bar Functionality
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        console.error('Search bar element not found');
    } else {
        searchBar.addEventListener('input', event => {
            searchTerm = event.target.value.trim();
            currentPage = 1;
            displayPokemonData();
        });
    }

    // Initialize Filters
    setupLegendaryAndMythicalFilters();

    // Initialize by fetching data
    fetchPokemonData();

    // Modal Functionality
    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.querySelector('.modal-content');
    const closeButtons = document.querySelectorAll('.close, .close2');

    // Close modal when clicking outside the modal content or on close buttons
    window.onclick = function(event) {
        if (event.target === modal || event.target.classList.contains('close') || event.target.classList.contains('close2')) {
            modal.classList.remove('show'); // Remove the animation class
            modal.style.display = 'none';
        }
    };

    // Function to display Pokémon details in the modal
    function displayPokemonDetails(pokemon) {
        if (!modal) {
            console.error('Modal element not found');
            return;
        }

        const modalDetails = document.getElementById('pokemon-details');
        const modalStats = document.getElementById('pokemon-stats');
        const modalEffects = document.getElementById('pokemon-effectiveness');

        if (!modalDetails || !modalStats || !modalEffects) {
            console.error('One or more modal elements not found');
            return;
        }

        const typeHTML = pokemon.types.map(type => {
            const color = typeColors[type.toLowerCase()] || '#000';
            return `<span style="color: ${color};">${capitalizeFirstLetter(type)}</span>`;
        }).join(' | ');

        let legendaryMythicalHTML = '';
        if (pokemon.isLegendary) {
            legendaryMythicalHTML += `<p class="PPP Pleg">Legendary</p>`;
        }
        if (pokemon.isMythical) {
            legendaryMythicalHTML += `<p class="PPP Pmyth">Mythical</p>`;
        }
    
        document.getElementById('pokemon-image').src = pokemon.sprite;
        if (pokemon.isLegendary || pokemon.isMythical) {
            modalDetails.innerHTML = `
            <div style="background: linear-gradient(to left, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: rainbow_animation 6s alternate-reverse linear infinite;
            background-size: 400% 100%;">${pokemon.name}</div>
            <p class="Mtypes">${typeHTML}</p>
            ${legendaryMythicalHTML}
            <p class='height'>Height: ${pokemon.height}</p>
            <p class='weight'>Weight: ${pokemon.weight}</p>
            <img src="${pokemon.officialArtLink}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
            <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
            <p>Habitat: ${pokemon.habitat}</p>
            <p>Abilities: ${pokemon.abilities}</p>
            <p>Previous Evolution: ${pokemon.previousEvolution}</p>
            <p>Upcoming Evolution: ${pokemon.upcomingEvolution}</p>
    
        `;} else { 
            if(pokemon.color === 'white'){ 
                modalDetails.innerHTML = `
                <div style="color: black">${pokemon.name}</div>
                <p class="Mtypes">${typeHTML}</p>
                ${legendaryMythicalHTML}
                <p class='height'>Height: ${pokemon.height}</p>
                <p class='weight'>Weight: ${pokemon.weight}</p>
                <img src="${pokemon.officialArtLink}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
                <p>Habitat: ${pokemon.habitat}</p>
                <p>Abilities: ${pokemon.abilities}</p>
                <p>Previous Evolution: ${pokemon.previousEvolution}</p>
                <p>Upcoming Evolution: ${pokemon.upcomingEvolution}</p>
    
            `;} else {
                modalDetails.innerHTML = `
                <div style="color: ${pokemon.color}">${pokemon.name}</div>
                <p class="Mtypes">${typeHTML}</p>
                ${legendaryMythicalHTML}
                <p class='height'>Height: ${pokemon.height}</p>
                <p class='weight'>Weight: ${pokemon.weight}</p>
                <img src="${pokemon.officialArtLink}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
                <p>Habitat: ${pokemon.habitat}</p>
                <p>Abilities: ${pokemon.abilities}</p>
                <p>Previous Evolution: ${pokemon.previousEvolution}</p>
                <p>Upcoming Evolution: ${pokemon.upcomingEvolution}</p>
            `;} 
        }

        
       // Handle Upcoming Evolution Image
       if (pokemon.upcomingEvolution && pokemon.upcomingEvolution.toLowerCase() !== "none") {
        const nextEvo = pokemonMap[pokemon.upcomingEvolution.toLowerCase()];
        if (nextEvo && nextEvo.spriteLink) {
            document.getElementById('pokemon-image-next-evo').src = nextEvo.spriteLink;
            document.getElementById('pokemon-image-next-evo').alt = capitalizeFirstLetter(pokemon.upcomingEvolution);
        } else {
            // Evolution name provided but not found in the dataset
            document.getElementById('pokemon-image-next-evo').src = PLACEHOLDER_PREV_EVO;
            document.getElementById('pokemon-image-next-evo').alt = "Upcoming Evolution Not Found";
        }
    } else {
        // No previous evolution
        document.getElementById('pokemon-image-next-evo').src = PLACEHOLDER_PREV_EVO;
        document.getElementById('pokemon-image-next-evo').alt = "No Upcoming Evolution";
    }

    /// Handle Previous Evolution Image
    if (pokemon.previousEvolution && pokemon.previousEvolution.toLowerCase() !== "none") {
        const prevEvo = pokemonMap[pokemon.previousEvolution.toLowerCase()];
        if (prevEvo && prevEvo.spriteLink) {
            document.getElementById('pokemon-image-prev-evo').src = prevEvo.spriteLink;
            document.getElementById('pokemon-image-prev-evo').alt = capitalizeFirstLetter(pokemon.previousEvolution);
        } else {
            // Evolution name provided but not found in the dataset
            document.getElementById('pokemon-image-prev-evo').src = PLACEHOLDER_PREV_EVO;
            document.getElementById('pokemon-image-prev-evo').alt = "Previous Evolution Not Found";
        }
    } else {
        // No previous evolution
        document.getElementById('pokemon-image-prev-evo').src = PLACEHOLDER_PREV_EVO;
        document.getElementById('pokemon-image-prev-evo').alt = "No Previous Evolution";
    }

    document.getElementById('pokemon-image').src = pokemon.spriteLink;

        // Populate Modal Stats
        modalStats.innerHTML = `
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-hp" style="width: ${Math.min(pokemon.stats.hp / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">HP:</span>
                        <span class="stat-value">${pokemon.stats.hp}</span>
                    </div>
                </div>
            </div>
            <!-- Repeat similar blocks for other stats: Attack, Defense, etc. -->
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-attack" style="width: ${Math.min(pokemon.stats.attack / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Attack:</span>
                        <span class="stat-value">${pokemon.stats.attack}</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-defense" style="width: ${Math.min(pokemon.stats.defense / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Defense:</span>
                        <span class="stat-value">${pokemon.stats.defense}</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-special-attack" style="width: ${Math.min(pokemon.stats.specialAttack / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Sp. Atk:</span>
                        <span class="stat-value">${pokemon.stats.specialAttack}</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-special-defense" style="width: ${Math.min(pokemon.stats.specialDefense / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Sp. Def:</span>
                        <span class="stat-value">${pokemon.stats.specialDefense}</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-speed" style="width: ${Math.min(pokemon.stats.speed / 150 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Speed:</span>
                        <span class="stat-value">${pokemon.stats.speed}</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-stat-bar">
                <div class="stat-bar">
                    <div class="stat-bar-inner stat-total" style="width: ${Math.min(pokemon.totalBaseStats / 900 * 100, 100)}%;"></div>
                    <div class="stat-text">
                        <span class="stat-label">Total:</span>
                        <span class="stat-value">${pokemon.totalBaseStats}</span>
                    </div>
                </div>
            </div>
        `;

        // Populate Modal Type Effectiveness
        modalEffects.innerHTML = `
            <div class="type-effectiveness">
                <h3>Damage From</h3>
                <p>0X: ${formatEffectiveness(pokemon.typeEffectiveness.no_damage)}</p>
                <p>1/4X: ${formatEffectiveness(pokemon.typeEffectiveness.quarter_damage)}</p>
                <p>1/2X: ${formatEffectiveness(pokemon.typeEffectiveness.half_damage)}</p>
                <p>1X: ${formatEffectiveness(pokemon.typeEffectiveness.normal_damage)}</p>
                <p>2X: ${formatEffectiveness(pokemon.typeEffectiveness.double_damage)}</p>
                <p>4X: ${formatEffectiveness(pokemon.typeEffectiveness.quadruple_damage)}</p>
            </div>
        `;

        // Show the modal
        modal.classList.add('show'); // Add class to show the modal with animation
        modal.style.display = 'block'; // Display the modal
    }

    // Function to format type effectiveness
    function formatEffectiveness(types) {
        if (!types || types.length === 0) return 'None';
        return types.map(type => {
            const color = typeColors[type.toLowerCase()] || '#000';
            return `<span style="color: ${color};">${capitalizeFirstLetter(type)}</span>`;
        }).join(', ');
    }

    // Function to handle modal close buttons (if any)
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('show'); // Remove the animation class
                modal.style.display = 'none'; // Hide the modal
            }
        });
    });

    const darkModeToggle = document.createElement('button');
    darkModeToggle.textContent = 'Toggle Dark Mode';
    darkModeToggle.classList.add('dark-mode-toggle');
    document.querySelector('.pokedex-header').appendChild(darkModeToggle);

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});

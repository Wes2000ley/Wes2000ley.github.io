import { firebaseConfig } from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function() {
    // Your existing code...
});

document.addEventListener("DOMContentLoaded", function() {
    let pokemonData;

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
    };

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

    const hpSlider = document.getElementById('hp-slider');
    const attackSlider = document.getElementById('attack-slider');
    const defenseSlider = document.getElementById('defense-slider');
    const specialAttackSlider = document.getElementById('special-attack-slider');
    const specialDefenseSlider = document.getElementById('special-defense-slider');
    const speedSlider = document.getElementById('speed-slider');
    const totalBaseStatsSlider = document.getElementById('total-base-stats-slider');

    const hpValue = document.getElementById('hp-value');
    const attackValue = document.getElementById('attack-value');
    const defenseValue = document.getElementById('defense-value');
    const specialAttackValue = document.getElementById('special-attack-value');
    const specialDefenseValue = document.getElementById('special-defense-value');
    const speedValue = document.getElementById('speed-value');
    const totalBaseStatsValue = document.getElementById('total-base-stats-value');

    function updateSliderValues() {
        hpValue.textContent = hpSlider.value;
        attackValue.textContent = attackSlider.value;
        defenseValue.textContent = defenseSlider.value;
        specialAttackValue.textContent = specialAttackSlider.value;
        specialDefenseValue.textContent = specialDefenseSlider.value;
        speedValue.textContent = speedSlider.value;
        totalBaseStatsValue.textContent = totalBaseStatsSlider.value;
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter, currentPage, pokemonPerPage);
    }

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

    hpSlider.addEventListener('input', updateSliderValues);
    attackSlider.addEventListener('input', updateSliderValues);
    defenseSlider.addEventListener('input', updateSliderValues);
    specialAttackSlider.addEventListener('input', updateSliderValues);
    specialDefenseSlider.addEventListener('input', updateSliderValues);
    speedSlider.addEventListener('input', updateSliderValues);
    totalBaseStatsSlider.addEventListener('input', updateSliderValues);

    const toggleSlidersButton = document.getElementById('toggle-sliders');
    const sliderFilters = document.getElementById('slider-filters');
    
    toggleSlidersButton.addEventListener('click', () => {
        sliderFilters.classList.toggle('hidden');
    });

    let currentPage = 1;
    const pokemonPerPage = 20;

    function updatePaginationControls(filteredData) {
        const totalPages = Math.ceil(filteredData.length / pokemonPerPage);
        const pageSelect = document.getElementById('page-select');
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

        document.getElementById('first-page').disabled = currentPage === 1;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages;
        document.getElementById('last-page').disabled = currentPage === totalPages;
    }

    function displayPokemonData(data, searchTerm, typesToFilter, legendaryFilter, mythicalFilter) {
        const hpMin = parseInt(hpSlider.value);
        const attackMin = parseInt(attackSlider.value);
        const defenseMin = parseInt(defenseSlider.value);
        const specialAttackMin = parseInt(specialAttackSlider.value);
        const specialDefenseMin = parseInt(specialDefenseSlider.value);
        const speedMin = parseInt(speedSlider.value);
        const totalBaseStatsMin = parseInt(totalBaseStatsSlider.value);
    
        filteredData = data.filter(pokemon => {
            const nameMatch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typesToFilter.length === 0 || typesToFilter.every(type => pokemon.types.includes(type.toLowerCase()));
            const legendaryMatch = !legendaryFilter || pokemon.legendary;
            const mythicalMatch = !mythicalFilter || pokemon.mythical;
            const hpMatch = pokemon.stats.hp >= hpMin;
            const attackMatch = pokemon.stats.attack >= attackMin;
            const defenseMatch = pokemon.stats.defense >= defenseMin;
            const specialAttackMatch = pokemon.stats.specialAttack >= specialAttackMin;
            const specialDefenseMatch = pokemon.stats.specialDefense >= specialDefenseMin;
            const speedMatch = pokemon.stats.speed >= speedMin;
            const totalBaseStatsMatch = pokemon.totalBaseStats >= totalBaseStatsMin;
    
            return nameMatch && typeMatch && legendaryMatch && mythicalMatch && hpMatch && attackMatch && defenseMatch && specialAttackMatch && specialDefenseMatch && speedMatch && totalBaseStatsMatch;
        });
    
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = Math.min(startIndex + pokemonPerPage, filteredData.length);
        const pokemonList = document.getElementById('pokemon-list');
        pokemonList.innerHTML = '';
    
        for (let i = startIndex; i < endIndex; i++) {
            const pokemon = filteredData[i];
            const pokemonElement = document.createElement('div');
            pokemonElement.classList.add('pokemon-card');
    
            const typeHTML = pokemon.types.map(type => {
                if (typeColors[type.toLowerCase()]) {
                    return `<span style="color: ${typeColors[type.toLowerCase()]}">${type}</span>`;
                } else {
                    return type;
                }
            }).join(' | ');
    
            const nameColor = typeColors[pokemon.types[0].toLowerCase()] || '#000';
    
            if (pokemon.legendary || pokemon.mythical) {
                pokemonElement.innerHTML = `
                    <h2 class="pokemon-name" style="background: linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: rainbow_animation 6s alternate-reverse linear infinite;
                    background-size: 400% 100%;">${pokemon.name}</h2>
                    <p>${typeHTML}</p>
                    <img src="${pokemon.sprite}" alt="${pokemon.name} sprite" class="pokemon-image" onError="this.onerror=null;this.src='${pokemon.art}';">
                    <img src="${pokemon.art}" alt="${pokemon.name} official art" class="officialimage" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                `;
            } else {
                pokemonElement.innerHTML = `
                    <h2 class="pokemon-name" style="color: ${pokemon.color}">${pokemon.name}</h2>
                    <p>${typeHTML}</p>
                    <img src="${pokemon.sprite}" alt="${pokemon.name} sprite" class="pokemon-image" onError="this.onerror=null;this.src='${pokemon.art}';">
                    <img src="${pokemon.art}" alt="${pokemon.name} official art" class="officialimage" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                `;
            }
            pokemonElement.addEventListener('click', () => {
                displayPokemonDetails(pokemon);
            });
            pokemonList.appendChild(pokemonElement);
        }
    
        updatePaginationControls(filteredData);
    }
    document.getElementById('first-page').addEventListener('click', () => {
        currentPage = 1;
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / pokemonPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
    }
});

document.getElementById('last-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / pokemonPerPage);
    currentPage = totalPages;
    displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
});

    document.getElementById('page-select').addEventListener('change', (event) => {
        currentPage = parseInt(event.target.value);
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
    });

    const types = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

    const typeFilter = document.getElementById('type-filter');
    if (!typeFilter) {
        console.error('Type filter element not found');
        return;
    }

    let searchTerm = '';
    let typesToFilter = [];
    let legendaryFilter = false;
    let mythicalFilter = false;

    function setupLegendaryAndMythicalFilters() {
        const legendaryLabel = document.createElement('label');
        legendaryLabel.htmlFor = 'filter-legendary';
        legendaryLabel.classList.add('legendary');
        legendaryLabel.textContent = 'Legendary';

        legendaryLabel.addEventListener('click', () => {
            legendaryFilter = !legendaryFilter;
            currentPage = 1;
            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
            if (legendaryFilter) {
                legendaryLabel.classList.add('click');
                legendaryLabel.style.animation = 'rainbow 5s infinite';
                legendaryLabel.style.fontWeight = '900';
                legendaryLabel.style.scale = '1.1';
                legendaryLabel.style.border = 'solid black 2px';
                legendaryLabel.style.boxShadow = '0px 0px 0px 2px black inset';
                legendaryLabel.style.padding = '5px 10px';
            } else {
                legendaryLabel.classList.remove('click');
                legendaryLabel.style.animation = '';
                legendaryLabel.style.backgroundColor = '#FFD700';
                legendaryLabel.style.fontWeight = '600';
                legendaryLabel.style.border = '1px solid #ccc';
                legendaryLabel.style.boxShadow = '';
                legendaryLabel.style.padding = '5px 10px';
                legendaryLabel.style.scale = '1';
            }
        });

        const mythicalLabel = document.createElement('label');
        mythicalLabel.htmlFor = 'filter-mythical';
        mythicalLabel.classList.add('mythical');
        mythicalLabel.textContent = 'Mythical';

        mythicalLabel.addEventListener('click', () => {
            mythicalFilter = !mythicalFilter;
            currentPage = 1;
            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
            if (mythicalFilter) {
                mythicalLabel.classList.add('click');
                mythicalLabel.style.animation = 'rainbow 5s infinite';
                mythicalLabel.style.fontWeight = '900';
                mythicalLabel.style.scale = '1.1';
                mythicalLabel.style.border = 'solid black 2px';
                mythicalLabel.style.boxShadow = '0px 0px 0px 2px black inset';
                mythicalLabel.style.padding = '5px 10px';
            } else {
                mythicalLabel.classList.remove('click');
                mythicalLabel.style.animation = '';
                mythicalLabel.style.backgroundColor = '#C0C0C0';
                mythicalLabel.style.fontWeight = '600';
                mythicalLabel.style.border = '1px solid #ccc';
                mythicalLabel.style.boxShadow = '';
                mythicalLabel.style.padding = '5px 10px';
                mythicalLabel.style.scale = '1';
            }
        });

        typeFilter.appendChild(legendaryLabel);
        typeFilter.appendChild(mythicalLabel);
    }

    types.forEach(type => {
        const label = document.createElement('label');
        label.htmlFor = `type-${type}`;
        label.textContent = type;
        if (typeColors[type.toLowerCase()]) {
            const textColor = typeColors[type.toLowerCase()];
            const backgroundColor = getComplementaryColor(textColor);

            label.style.color = textColor;
            label.style.backgroundColor = backgroundColor;

            label.addEventListener('click', () => {
                label.classList.toggle('checked');
                typesToFilter = Array.from(typeFilter.querySelectorAll('.checked')).map(label => label.textContent.toLowerCase());
                displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
            });
        }

        typeFilter.appendChild(label);
    });

    const pokedex = document.getElementById('pokedex');
    if (!pokedex) {
        console.error('Pokédex element not found');
        return;
    }

    pokedex.addEventListener('click', () => {
        legendaryFilter = false;
        mythicalFilter = false;
        searchTerm = '';
        typesToFilter = [];
        currentPage = 1;
        resetSliders();
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);

        document.querySelector('.legendary').classList.remove('click');
        document.querySelector('.legendary').style.animation = '';
        document.querySelector('.legendary').style.backgroundColor = '#FFD700';
        document.querySelector('.legendary').style.fontWeight = '600';
        document.querySelector('.legendary').style.border = '1px solid #ccc';
        document.querySelector('.legendary').style.boxShadow = '';
        document.querySelector('.legendary').style.padding = '5px 10px';
        document.querySelector('.legendary').style.scale = '1';

        document.querySelector('.mythical').classList.remove('click');
        document.querySelector('.mythical').style.animation = '';
        document.querySelector('.mythical').style.backgroundColor = '#C0C0C0';
        document.querySelector('.mythical').style.fontWeight = '600';
        document.querySelector('.mythical').style.border = '1px solid #ccc';
        document.querySelector('.mythical').style.boxShadow = '';
        document.querySelector('.mythical').style.padding = '5px 10px';
        document.querySelector('.mythical').style.scale = '1';

        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.value = '';
        }

        const typeFilterCheckboxes = document.querySelectorAll('#type-filter label');
        typeFilterCheckboxes.forEach(label => {
            label.classList.remove('checked');
            label.style.color = typeColors[label.textContent.toLowerCase()];
            label.style.backgroundColor = getComplementaryColor(typeColors[label.textContent.toLowerCase()]);
        });

        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
    });

    setupLegendaryAndMythicalFilters();

    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        console.error('Search bar element not found');
        return;
    }
    searchBar.addEventListener('input', event => {
        searchTerm = event.target.value.trim();
        displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
    });

    fetch('pokemon_data.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const lines = data.trim().split('\n');
            pokemonData = lines.map(line => {
                const [name, types, height, weight, abilities, sprite, art, totalBaseStats, habitat, color, legendary, mythical, hp, attack, defense, specialAttack, specialDefense, speed, noDamageFrom, quarterDamageFrom, halfDamageFrom, normalDamageFrom, doubleDamageFrom, quadrupleDamageFrom] = line.split(';');
                
                const typeList = types.split(',').map(type => {
                    return {
                        type: {
                            name: type.trim()
                        }
                    };
                });
            
                return {
                    name: name.trim(),
                    types: typeList.map(type => type.type.name),
                    height: parseFloat(height.trim()),
                    weight: parseFloat(weight.trim()),
                    abilities: abilities.trim(),
                    sprite: sprite.trim(),
                    art: art.trim(),
                    totalBaseStats: parseInt(totalBaseStats.trim()),
                    habitat: habitat.trim(),
                    color: color.trim(),
                    legendary: legendary === 'true',
                    mythical: mythical === 'true',
                    stats: {
                        hp: parseInt(hp),
                        attack: parseInt(attack),
                        defense: parseInt(defense),
                        specialAttack: parseInt(specialAttack),
                        specialDefense: parseInt(specialDefense),
                        speed: parseInt(speed)
                    },
                    typeEffectiveness: {
                        noDamageFrom: noDamageFrom.split(',').filter(x => x),
                        quarterDamageFrom: quarterDamageFrom.split(',').filter(x => x),
                        halfDamageFrom: halfDamageFrom.split(',').filter(x => x),
                        normalDamageFrom: normalDamageFrom.split(',').filter(x => x),
                        doubleDamageFrom: doubleDamageFrom.split(',').filter(x => x),
                        quadrupleDamageFrom: quadrupleDamageFrom.split(',').filter(x => x)
                    }
                };
            });

            displayPokemonData(pokemonData, searchTerm, typesToFilter, legendaryFilter, mythicalFilter);
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
        });

    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.querySelector('.modal-content');
    const closeButtons = document.querySelectorAll('.close, .close2');

    window.onclick = function(event) {
        if (event.target === modal || event.target.classList.contains('close') || event.target.classList.contains('close2')) {
            modal.classList.remove('show'); // Remove the animation class
            modal.style.display = 'none';
        }
    };

    function displayPokemonDetails(pokemon) {
        const modalDetails = document.getElementById('pokemon-details');
        const modalStats = document.getElementById('pokemon-stats');
        const modalEffects = document.getElementById('pokemon-effectiveness');
    
        const typeHTML = pokemon.types.map(type => {
            if (typeColors[type.toLowerCase()]) {
                return `<span style="color: ${typeColors[type.toLowerCase()]}">${type}</span>`;
            } else {
                return type; // Fallback if no color is defined for the type
            }
        }).join(' | ');
    
        let legendaryMythicalHTML = '';
        if (pokemon.legendary) {
            legendaryMythicalHTML += `<p class="PPP Pleg">Legendary</p>`;
        }
        if (pokemon.mythical) {
            legendaryMythicalHTML += `<p class="PPP Pmyth">Mythical</p>`;
        }
    
        document.getElementById('pokemon-image').src = pokemon.sprite;
        if (pokemon.legendary || pokemon.mythical) {
            modalDetails.innerHTML = `
            <div style="background: linear-gradient(to left, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: rainbow_animation 6s alternate-reverse linear infinite;
            background-size: 400% 100%;">${pokemon.name}</div>
            <p class="Mtypes">${typeHTML}</p>
            ${legendaryMythicalHTML}
            <p class='height'>Height: ${pokemon.height} m</p>
            <p class='weight'>Weight: ${pokemon.weight} kg</p>
            <img src="${pokemon.art}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
            <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
            <p>Habitat: ${pokemon.habitat}</p>
            <p>Abilities: ${pokemon.abilities}</p>
    
        `;} else { 
            if(pokemon.color === 'white'){ 
                modalDetails.innerHTML = `
                <div style="color: black">${pokemon.name}</div>
                <p class="Mtypes">${typeHTML}</p>
                ${legendaryMythicalHTML}
                <p class='height'>Height: ${pokemon.height} m</p>
                <p class='weight'>Weight: ${pokemon.weight} kg</p>
                <img src="${pokemon.art}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
                <p>Habitat: ${pokemon.habitat}</p>
                <p>Abilities: ${pokemon.abilities}</p>
            `;} else {
                modalDetails.innerHTML = `
                <div style="color: ${pokemon.color}">${pokemon.name}</div>
                <p class="Mtypes">${typeHTML}</p>
                ${legendaryMythicalHTML}
                <p class='height'>Height: ${pokemon.height} m</p>
                <p class='weight'>Weight: ${pokemon.weight} kg</p>
                <img src="${pokemon.art}" alt="${pokemon.name} official art" onError="this.onerror=null;this.src='${pokemon.sprite}';">
                <a href="https://pokemondb.net/pokedex/${pokemon.name.toLowerCase()}" target="_blank" class="pdlink">Pokémon Database</a>
                <p>Habitat: ${pokemon.habitat}</p>
                <p>Abilities: ${pokemon.abilities}</p>
            `;} 
        }
    
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
    
        const getTypeEffectivenessHTML = (types) => {
            return types.map(type => {
                const color = typeColors[type.toLowerCase()] || '#000';
                return `<span style="color: ${color}">${type}</span>`;
            }).join(', ') || 'None';
        };
    
        modalEffects.innerHTML =`
            <div class="type-effectiveness">
                <h3>Damage From</h3>
                <p>0X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.noDamageFrom)}</p>
                <p>1/4X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.quarterDamageFrom)}</p>
                <p>1/2X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.halfDamageFrom)}</p>
                <p>1X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.normalDamageFrom)}</p>
                <p>2X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.doubleDamageFrom)}</p>
                <p>4X: ${getTypeEffectivenessHTML(pokemon.typeEffectiveness.quadrupleDamageFrom)}</p>
            </div>
        `;
    
        modal.classList.add('show'); // Add class to show the modal with animation
        modal.style.display = 'block'; // Display the modal
    }
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('user-name').textContent = user.email;
            document.getElementById('login-register').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
        } else {
            document.getElementById('login-register').style.display = 'block';
            document.getElementById('user-info').style.display = 'none';
        }
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('auth-forms').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('auth-forms').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });

    document.getElementById('login-button').addEventListener('click', () => {
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                document.getElementById('auth-forms').style.display = 'none';
            })
            .catch(error => {
                console.error('Error logging in:', error);
            });
    });

    document.getElementById('register-button').addEventListener('click', () => {
        const email = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                document.getElementById('auth-forms').style.display = 'none';
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        auth.signOut();
    });

    function saveUserPreferences(userId, preferences) {
        db.collection('users').doc(userId).set({ preferences }, { merge: true })
            .then(() => {
                console.log('Preferences saved successfully');
            })
            .catch(error => {
                console.error('Error saving preferences:', error);
            });
    }

    function saveFavoritePokemon(userId, favoritePokemon) {
        db.collection('users').doc(userId).set({ favoritePokemon }, { merge: true })
            .then(() => {
                console.log('Favorite Pokémon saved successfully');
            })
            .catch(error => {
                console.error('Error saving favorite Pokémon:', error);
            });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            // Retrieve user preferences and favorite Pokémon from Firestore
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const preferences = userData.preferences || {}; // Replace with actual preferences structure
                    const favoritePokemon = userData.favoritePokemon || []; // Replace with actual favorite Pokémon list
    
                    // Apply user preferences and favorite Pokémon list
                    applyUserPreferences(preferences);
                    applyFavoritePokemon(favoritePokemon);
                } else {
                    console.log('No such document!');
                }
            }).catch(error => {
                console.error('Error getting document:', error);
            });
    
            // Example preferences and favorite Pokémon list
            const examplePreferences = {
                darkMode: true,
                showLegendary: true,
            };
    
            const exampleFavoritePokemon = ['Pikachu', 'Charmander', 'Bulbasaur'];
    
            // Save example preferences and favorite Pokémon list
            saveUserPreferences(user.uid, examplePreferences);
            saveFavoritePokemon(user.uid, exampleFavoritePokemon);
        }
    });
    
    function applyUserPreferences(preferences) {
        if (preferences.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Apply other preferences as needed
    }
    
    function applyFavoritePokemon(favoritePokemon) {
        // Apply the favorite Pokémon list to your UI or logic
        console.log('Favorite Pokémon:', favoritePokemon);
    }

    const darkModeToggle = document.createElement('button');
    darkModeToggle.textContent = 'Toggle Dark Mode';
    darkModeToggle.classList.add('dark-mode-toggle');
    document.querySelector('.pokedex-header').appendChild(darkModeToggle);

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});



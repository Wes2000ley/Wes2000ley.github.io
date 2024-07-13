const axios = require('axios');
const fs = require('fs');

async function fetchPokemonData() {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
        const data = response.data;

        const outputFile = fs.createWriteStream('pokemon_data.txt');
        outputFile.write('Name;Type(s);Height;Weight;Abilities;Sprite Link;Official Art Link;Total Base Stats;Habitat;Color;Is Legendary;Is Mythical\n');

        for (const pokemon of data.results) {
            try {
                const pokemonResponse = await axios.get(pokemon.url);
                const pokemonData = pokemonResponse.data;

                const types = pokemonData.types.map(type => type.type.name).join(',');
                const height = `${pokemonData.height / 10} m`;
                const weight = `${pokemonData.weight / 10} kg`;
                const abilities = pokemonData.abilities.map(ability => ability.ability.name).join(' or ');
                const spriteLink = pokemonData.sprites.front_default;
                const officialArtLink = pokemonData.sprites.other['official-artwork'].front_default;

                const totalBaseStats = pokemonData.stats.reduce((total, stat) => total + stat.base_stat, 0);

                // Fetch the species data to get the color information, habitat, is_legendary, and is_mythical
                let habitat = 'Unknown';
                let color = 'Black';
                let isLegendary = false;
                let isMythical = false;
                try {
                    const speciesResponse = await axios.get(pokemonData.species.url);
                    const speciesData = speciesResponse.data;

                    // Fetch habitat
                    if (speciesData.habitat) {
                        habitat = speciesData.habitat.name;
                    }

                    // Fetch color
                    color = speciesData.color.name;

                    // Fetch is_legendary and is_mythical
                    isLegendary = speciesData.is_legendary;
                    isMythical = speciesData.is_mythical;
                } catch (error) {
                    console.error(`Error fetching species details for ${pokemonData.name}:`, error);
                }

                const outputLine = `${pokemonData.name};${types};${height};${weight};${abilities};${spriteLink};${officialArtLink};${totalBaseStats};${habitat};${color};${isLegendary};${isMythical}\n`;
                outputFile.write(outputLine);
            } catch (pokemonError) {
                console.error(`Error fetching data for ${pokemon.name}:`, pokemonError);
            }
        }

        outputFile.end(() => {
            console.log('Data has been written to pokemon_data.txt');
        });
    } catch (error) {
        console.error('Error fetching initial Pokémon list:', error);
    }
}

fetchPokemonData();

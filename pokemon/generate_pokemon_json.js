const axios = require('axios');
const fs = require('fs');

const allTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'];

async function fetchTypeEffectiveness(typeName) {
    try {
        const typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
        const typeData = typeResponse.data;

        return {
            no_damage_from: typeData.damage_relations.no_damage_from.map(type => type.name),
            half_damage_from: typeData.damage_relations.half_damage_from.map(type => type.name),
            double_damage_from: typeData.damage_relations.double_damage_from.map(type => type.name)
        };
    } catch (error) {
        console.error(`Error fetching type details for ${typeName}:`, error);
        return null;
    }
}

function combineTypeEffectiveness(typesEffectiveness) {
    const combinedEffectiveness = {};

    typesEffectiveness.forEach(typeEffectiveness => {
        if (!typeEffectiveness) return;

        typeEffectiveness.no_damage_from.forEach(type => {
            combinedEffectiveness[type] = (combinedEffectiveness[type] || 1) * 0;
        });

        typeEffectiveness.half_damage_from.forEach(type => {
            combinedEffectiveness[type] = (combinedEffectiveness[type] || 1) * 0.5;
        });

        typeEffectiveness.double_damage_from.forEach(type => {
            combinedEffectiveness[type] = (combinedEffectiveness[type] || 1) * 2;
        });
    });

    return combinedEffectiveness;
}

function formatEffectiveness(effectiveness) {
    const result = {
        no_damage: [],
        quarter_damage: [],
        half_damage: [],
        normal_damage: [],
        double_damage: [],
        quadruple_damage: []
    };

    const typesPresent = new Set(Object.keys(effectiveness));

    for (const type of allTypes) {
        if (!typesPresent.has(type)) {
            result.normal_damage.push(type);
        }
    }

    for (const [type, multiplier] of Object.entries(effectiveness)) {
        if (multiplier === 0) {
            result.no_damage.push(type);
        } else if (multiplier === 0.25) {
            result.quarter_damage.push(type);
        } else if (multiplier === 0.5) {
            result.half_damage.push(type);
        } else if (multiplier === 2) {
            result.double_damage.push(type);
        } else if (multiplier === 4) {
            result.quadruple_damage.push(type);
        }
    }

    return result;
}

async function fetchPokemonData() {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
        const data = response.data;

        const outputFile = fs.createWriteStream('pokemon_data.txt');
        outputFile.write('Name;Type(s);Height;Weight;Abilities;Sprite Link;Official Art Link;Total Base Stats;Habitat;Color;Is Legendary;Is Mythical;HP;Attack;Defense;Special Attack;Special Defense;Speed;No Damage From;Quarter Damage From;Half Damage From;Normal Damage From;Double Damage From;Quadruple Damage From\n');

        for (const pokemon of data.results) {
            try {
                const pokemonResponse = await axios.get(pokemon.url);
                const pokemonData = pokemonResponse.data;

                const types = pokemonData.types.map(type => type.type.name);
                const height = `${pokemonData.height / 10} m`;
                const weight = `${pokemonData.weight / 10} kg`;
                const abilities = pokemonData.abilities.map(ability => ability.ability.name).join(' or ');
                const spriteLink = pokemonData.sprites.front_default;
                const officialArtLink = pokemonData.sprites.other['official-artwork'].front_default;

                const totalBaseStats = pokemonData.stats.reduce((total, stat) => total + stat.base_stat, 0);
                const hp = pokemonData.stats.find(stat => stat.stat.name === 'hp').base_stat;
                const attack = pokemonData.stats.find(stat => stat.stat.name === 'attack').base_stat;
                const defense = pokemonData.stats.find(stat => stat.stat.name === 'defense').base_stat;
                const specialAttack = pokemonData.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
                const specialDefense = pokemonData.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
                const speed = pokemonData.stats.find(stat => stat.stat.name === 'speed').base_stat;

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

                // Fetch type effectiveness data
                const typesEffectiveness = await Promise.all(types.map(type => fetchTypeEffectiveness(type)));
                const combinedEffectiveness = combineTypeEffectiveness(typesEffectiveness);
                const formattedEffectiveness = formatEffectiveness(combinedEffectiveness);

                const outputLine = `${pokemonData.name};${types.join(',')};${height};${weight};${abilities};${spriteLink};${officialArtLink};${totalBaseStats};${habitat};${color};${isLegendary};${isMythical};${hp};${attack};${defense};${specialAttack};${specialDefense};${speed};${formattedEffectiveness.no_damage.join(',')};${formattedEffectiveness.quarter_damage.join(',')};${formattedEffectiveness.half_damage.join(',')};${formattedEffectiveness.normal_damage.join(',')};${formattedEffectiveness.double_damage.join(',')};${formattedEffectiveness.quadruple_damage.join(',')}\n`;
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

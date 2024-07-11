const axios = require('axios');

const fs = require('fs');

 

async function fetchPokemonData() {

  try {

    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10000');

    const data = response.data;

 

    const outputFile = fs.createWriteStream('pokemon_data.txt');

    outputFile.write('Name;Type(s);Height;Weight;Abilities;Sprite Link;Official Art Link\n');

 

    for (const pokemon of data.results) {

      const pokemonResponse = await axios.get(pokemon.url);

      const pokemonData = pokemonResponse.data;

 

      const types = pokemonData.types.map(type => type.type.name).join(',');

      const height = `${pokemonData.height / 10} m`;

      const weight = `${pokemonData.weight / 10} kg`;

      const abilities = pokemonData.abilities.map(ability => ability.ability.name).join(',');

      const spriteLink = pokemonData.sprites.front_default;

      const officialArtLink = pokemonData.sprites.other['official-artwork'].front_default;

 

      const outputLine = `${pokemon.name};${types};${height};${weight};${abilities};${spriteLink};${officialArtLink}\n`;

      outputFile.write(outputLine);

    }

 

    outputFile.end();

  } catch (error) {

    console.error(error);

  }

}

 

fetchPokemonData();
import axios from 'axios';

export function getPokemonImgApi(pokemonId: string) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
}

export function getPokemonSpeciesApi(pokemonId: string) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
}
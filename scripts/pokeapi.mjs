import axios from 'axios';

function getPokemonApi(pokemonId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
}

function getPokemonSpeciesApi(pokemonId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
}

function getPokemonTypeApi(typeId) {
  return axios.get(`https://pokeapi.co/api/v2/type/${typeId}`);
}

function getPokemonAbilityApi(abilityId) {
  return axios.get(`https://pokeapi.co/api/v2/ability/${abilityId}`);
}

function getPokemonEvolutionChainApi(ecId) {
  return axios.get(`https://pokeapi.co/api/v2/evolution-chain/${ecId}`);
}

function getPokemonVersionApi(versionId) {
  return axios.get(`https://pokeapi.co/api/v2/version/${versionId}`);
}

function getPokemonMoveApi(moveId) {
  return axios.get(`https://pokeapi.co/api/v2/move/${moveId}`);
}

function getPokemonItemApi(itemId) {
  return axios.get(`https://pokeapi.co/api/v2/item/${itemId}`);
}

function getPokemonItemCategoryApi(icId) {
  return axios.get(`https://pokeapi.co/api/v2/item-category/${icId}`);
}

function getPokemonItemPocketApi(ipId) {
  return axios.get(`https://pokeapi.co/api/v2/item-pocket/${ipId}`);
}

function getPokemonGenerationsApi() {
  return axios.get(`https://pokeapi.co/api/v2/generation/`);
}

function getPokemonLanguagesApi() {
  return axios.get(`https://pokeapi.co/api/v2/language/`);
}

function get(url) {
  return axios.get(url);
}

export const api = {
  'pokemon': getPokemonApi,
  'pokemonSpecies': getPokemonSpeciesApi,
  'type': getPokemonTypeApi,
  'ability': getPokemonAbilityApi,
  'evolutionChain': getPokemonEvolutionChainApi,
  'version': getPokemonVersionApi,
  'move': getPokemonMoveApi,
  'item': getPokemonItemApi,
  'itemCategory': getPokemonItemCategoryApi,
  'itemPocket': getPokemonItemPocketApi,
  'generations': getPokemonGenerationsApi,
  'languages': getPokemonLanguagesApi,
  'get': get
}
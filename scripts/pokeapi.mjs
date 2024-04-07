import axios from 'axios';

function getPokemonApi(pokemonId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
}

function getPokemonSpecieApi(specieId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-species/${specieId}/`)
}

function getPokemonFormApi(formId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-form/${formId}/`);
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

function getPokemonVersionGroupApi(vgId) {
  return axios.get(`https://pokeapi.co/api/v2/version-group/${vgId}`);
}

function getPokemonVersionApi(versionId) {
  return axios.get(`https://pokeapi.co/api/v2/version/${versionId}`);
}

function getPokemonColorApi(colorId) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-color/${colorId}`);
}

function getPokemonStatApi(statId) {
  return axios.get(`https://pokeapi.co/api/v2/stat/${statId}`);
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

function getPokemonGenerationApi(gId) {
  return axios.get(`https://pokeapi.co/api/v2/generation/${gId}`);
}

function getPokemonMoveClassApi(mcId) {
  return axios.get(`https://pokeapi.co/api/v2/move-damage-class/${mcId}`);
}

function getPokemonLanguagesApi() {
  return axios.get(`https://pokeapi.co/api/v2/language/`);
}

function get(url) {
  return axios.get(url);
}

export const api = {
  'pokemon': getPokemonApi,
  'specie': getPokemonSpecieApi,
  'form': getPokemonFormApi,
  'type': getPokemonTypeApi,
  'color': getPokemonColorApi,
  'stat': getPokemonStatApi,
  'ability': getPokemonAbilityApi,
  'evolutionChain': getPokemonEvolutionChainApi,
  'version': getPokemonVersionApi,
  'versionGroup': getPokemonVersionGroupApi,
  'move': getPokemonMoveApi,
  'moveClass': getPokemonMoveClassApi,
  'item': getPokemonItemApi,
  'itemCategory': getPokemonItemCategoryApi,
  'itemPocket': getPokemonItemPocketApi,
  'generation': getPokemonGenerationApi,
  'languages': getPokemonLanguagesApi,
  'get': get
}
import axios from 'axios';

export function getPokemonApi(pokemonId: string) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
}

export function getPokemonSpeciesApi(pokemonId: string) {
  return axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
}

export function getPokemonTypeApi(typeId: string) {
  return axios.get(`https://pokeapi.co/api/v2/type/${typeId}`);
}

export function getPokemonAbilityApi(abilityId: string) {
  return axios.get(`https://pokeapi.co/api/v2/ability/${abilityId}`);
}

export function getPokemonEvolutionChainApi(ecId: string) {
  return axios.get(`https://pokeapi.co/api/v2/evolution-chain/${ecId}`);
}

export function getPokemonVersionApi(versionId: string) {
  return axios.get(`https://pokeapi.co/api/v2/version/${versionId}`);
}

export function getPokemonMoveApi(moveId: string) {
  return axios.get(`https://pokeapi.co/api/v2/move/${moveId}`);
}

export function getPokemonItemApi(itemId: string) {
  return axios.get(`https://pokeapi.co/api/v2/item/${itemId}`);
}

export function getPokemonGenerationsApi() {
  return axios.get(`https://pokeapi.co/api/v2/generation/`);
}

export function getPokemonLanguagesApi() {
  return axios.get(`https://pokeapi.co/api/v2/language/`);
}



// export async function getPokemonAllImgApi(pokemonId: string) {
//   interface Sprites {
//     [key: string]: any; // 使用索引签名，因为sprites的确切结构是未知的
//   }
//   try {
//     const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
//     const data = response.data;
//     const sprites: Sprites = data.sprites;
//     const frontSprites: string[] = [];

//     const findAllFrontSprites = (object: any): void => {
//       for (const key in object) {
//         if (typeof object[key] === 'object' && object[key] !== null) {
//           findAllFrontSprites(object[key]);
//         } else if (key.includes('front') && object[key]) {
//           frontSprites.push(object[key]);
//         }
//       }
//     }

//     findAllFrontSprites(sprites);
//     return frontSprites;
//   } catch (error) {
//     console.error("Error fetching or processing data:", error);
//     return [];
//   }
// }
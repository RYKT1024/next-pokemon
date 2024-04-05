'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'redis'

import { TrainerInfo, TrainerInfoHash } from './types'
import { getPokemonApi, getPokemonSpeciesApi  } from './api' 

const client = createClient()
client.connect()

export async function revalidatePokemon(pid: number) {
  let path = '/pokemon/'+pid.toString()
  revalidatePath(path)
  redirect(path)
}

export async function selectPokemonPage(pid: string) {
  redirect(`/pokemon/${pid}`)
}

export async function getPokemonImg(pid: string) {
  try {
    const res = await getPokemonApi(pid);
    const pokemon = res.data;
    const pokemonImg = pokemon.sprites.front_default;
    return pokemonImg;
  }
  catch (error) {
    // 处理错误
    // console.error(error);
    return '/retry.svg';
  }
}

export async function getPokemonName(pid: string) {
  interface PokemonName {
    language: {
      name: string;
    },
    name: string;
  }
  interface PokemonSpecies {
    names: Array<PokemonName>;
  }
  try {
    const res = await getPokemonSpeciesApi(pid);
    const pokemonSpecies: PokemonSpecies = res.data;
    const pokemonNames = pokemonSpecies.names;
    const pokemonName = pokemonNames.find((name: { language: { name: string; }; }) => name.language.name === 'zh-Hans')?.name;
    if (pokemonName === undefined) {
      return 'unknown';
    }
    return pokemonName;
  }
  catch (error) {
    // 处理错误
    // console.error(error);
    return 'unknown';
  }
}

export async function getTrainerInfo(uid: string) {
  try {
    const info_hash = await client.hGetAll(uid).then(info => {
      return info as unknown as TrainerInfoHash
    });
    const pokemonsId = await client.LRANGE(info_hash.pokemonsKey, 0, -1);
    const pokemonsName = await Promise.all(pokemonsId.map(string=>getPokemonName(string)))
    const pokemons = pokemonsName.map((name, _) => {
      return {
        name: name
      }
    })
    const info_obj: TrainerInfo = {
      uid: uid,
      name: info_hash.name,
      pokemons,
    }
    return info_obj;
  }
  catch (error) {
    // 处理错误
    // console.error(error);
    const info_obj: TrainerInfo = {
      uid: uid,
      name: 'unknown',
    }
    return info_obj;
  }
}

export async function addPokemon(uid: string, pid: string) {
  try {
    const info_hash = await client.hGetAll(uid).then(info => {
      return info as unknown as TrainerInfoHash
    });
    client.RPUSH(info_hash.pokemonsKey, pid)
  }
  catch (error) {
    // 处理错误
    // console.error(error);
  }
}

// export async function getPokemonAllImg(pid: string) {
//   const frontSprites = getPokemonAllImgApi(pid).then(frontSprites => {return frontSprites;});
//   return frontSprites;
// }

export async function checkFounded() {
  // return Math.random() >= 0.5 // 随机布尔值
}
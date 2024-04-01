'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'redis'

import { TrainerInfo, TrainerInfoHash } from './types'
import { getPokemonImgApi, getPokemonSpeciesApi } from './api'
 
const client = createClient()
client.connect()

export async function revalidatePokemon(pokemonId: number) {
  let path = '/pokemon/'+pokemonId.toString()
  revalidatePath(path)
  redirect(path)
}

export async function selectPokemonPage(pokemonId: string) {
  redirect(`/pokemon/${pokemonId}`)
}

export async function getPokemonImg(pokemonId: string) {
  try {
    const res = await getPokemonImgApi(pokemonId);
    const pokemon = res.data;
    const pokemonImg = pokemon.sprites.front_default;
    return pokemonImg;
  }
  catch (error) {
    // 处理错误
    // console.error(error);
    return 'unknown';
  }
}

export async function getPokemonName(pokemonId: string) {
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
    const res = await getPokemonSpeciesApi(pokemonId);
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

export async function addPokemon(uid: string, pokemonId: string) {
  try {
    const info_hash = await client.hGetAll(uid).then(info => {
      return info as unknown as TrainerInfoHash
    });
    client.RPUSH(info_hash.pokemonsKey, pokemonId)
  }
  catch (error) {
    // 处理错误
    // console.error(error);
  }
}
'use server'

import axios from 'axios' 
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'redis'

import { TrainerInfo } from './types'
 
export async function revalidatePokemon(id: number) {
  let path = '/pokemon/'+id.toString()
  revalidatePath(path)
  redirect(path)
}

export async function selectPokemon(id: string) {
  redirect(`/pokemon/${id}`)
}

export async function getPokemonImg(id: string) {
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`)
  const pokemon = res.data;
  const pokemonImg = pokemon.sprites.front_default;
  return pokemonImg;
}

export async function getPokemonName(id: string) {
  interface PokemonName {
    language: {
      name: string;
    },
    name: string;
  }
  interface PokemonSpecies {
    names: Array<PokemonName>;
  }
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
  const pokemonSpecies: PokemonSpecies = res.data;
  const pokemonNames = pokemonSpecies.names;
  const pokemonName = pokemonNames.find((name: { language: { name: string; }; }) => name.language.name === 'zh-Hans')?.name;
  return pokemonName;
}

const client = createClient()
client.connect()

export async function getTrainerInfo(uid: string) {
  interface TrainerInfoHash {
    name: string;
    pokemonsKey: string; 
  }
  const info_hash = await client.hGetAll(uid).then(info => {
    return info as unknown as TrainerInfoHash
  });
  const pokemonsId = await client.LRANGE(info_hash.pokemonsKey, 0, -1);
  const pokemonsName = await Promise.all(pokemonsId.map(string=>getPokemonName(string)))
  const pokemons = pokemonsName.map((name, index) => {
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

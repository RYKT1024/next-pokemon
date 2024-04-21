'use server'
import dotenv from 'dotenv'

// import { createClient } from 'redis'
//@ts-ignore
import { Pool } from 'pg'

import { TrainerDataType } from './types';

dotenv.config()

const { 
  PGD_USER: dbUser, 
  PGD_PASS: dbPass, 
  PGD_HOST: dbHost, 
  PGD_PORT: dbPort, 
  PGD_NAME: dbName 
} = process.env;


// Redis 客户端
// const client = createClient({

// })
// client.connect()

// PG 连接池
const pool = new Pool({
  user: dbUser,
  password: dbPass,
  host: dbHost,
  port: dbPort,
  database: dbName,
});

export async function fetchPokemonName(pid: string, language: string = 'en'): Promise<string> {
  try {
    const res = await pool.query('SELECT name FROM pokemondetail WHERE pid = $1 and language = $2', [pid, language]);
    return res.rows[0].name;
  } catch (err) {
    console.error(err);
    return 'unknown';
  }
}

export async function fetchPokemonImage(pid: string, brief: string): Promise<string> {
  try {
    const typeRes = await pool.query('SELECT itid FROM pokemonimagetype WHERE brief = $1', [brief]);
    const itid = typeRes.rows[0].itid;
    const res = await pool.query('SELECT url FROM pokemonimage WHERE pid = $1 and itid = $2', [pid, itid]);
    return res.rows[0].url;
  }
  catch (err) {
    console.error(err);
    return '/retry.svg';
  }
}

export async function fetchTrainerData(tid: number): Promise<TrainerDataType | null> {
  try {
    const trainerRes = await pool.query('SELECT * FROM trainers WHERE tid = $1', [tid]);
    const pokemonsRes = await pool.query('SELECT * FROM pokemons WHERE tid = $1', [tid]);
    const data: TrainerDataType = {
      tid: tid,
      name: trainerRes.rows[0].name,
      userid: trainerRes.rows[0].userid,
      email: trainerRes.rows[0].email,
      pokemons: pokemonsRes.rows.map((pokemon: { pid: number; amount:number}) => {
        return {
          pid: pokemon.pid,
          amount: pokemon.amount
        }
      })
    }
    return data;
  }
  catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchPokemonFounded(tid:number, pid: string): Promise<number> {
  try {
    const res = await pool.query('SELECT amount FROM pokemons WHERE tid = $1 and pid = $2', [tid, pid]);
    if (res.rows.length === 0) {
      return 0;
    }
    return res.rows[0].amount;
  }
  catch (err) {
    console.error(err);
    return -1;
  } 
}

export async function fetchPokemonIds(): Promise<Array<number>> {
  try {
    const res = await pool.query('SELECT pid FROM pokemon');
    return res.rows.map((row: { pid: number }) => row.pid);
  }
  catch (err) {
    console.error(err);
    return [];
  }
}
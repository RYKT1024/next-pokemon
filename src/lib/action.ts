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

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function revalidatePokemon(pid: number) {
  let path = '/pokemon/'+pid.toString()
  revalidatePath(path)
  redirect(path)
}

export async function selectPokemonPage(pid: string) {
  redirect(`/pokemon/${pid}`)
}

export async function addPokemon(tid: number, pid: string) {
  try {
    await pool.query(`INSERT INTO Pokemons (tid, pid, amount)
                      VALUES (${tid}, ${pid}, 1)
                      ON CONFLICT (tid, pid)
                      DO UPDATE SET amount = Pokemons.amount + 1;
    `);
  }
  catch (error) {
    console.log(error)
  }
}

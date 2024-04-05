import dotenv from 'dotenv'

// import { createClient } from 'redis'
//@ts-ignore
import { Pool } from 'pg'

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

export async function fetchNow() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
}
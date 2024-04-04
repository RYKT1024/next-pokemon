import dotenv from 'dotenv'

// import { createClient } from 'redis'
//@ts-ignore
import { Pool } from 'pg'

dotenv.config()

const dbUser = process.env.PGD_USER;
const dbPass = process.env.PGD_PASS;
const dbHost = process.env.PGD_HOST;
const dbPort = process.env.PGD_PORT;
const dbName = process.env.PGD_NAME;

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


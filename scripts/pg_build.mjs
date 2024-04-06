import dotenv from 'dotenv';
import fs from 'fs';
import pg from 'pg';

dotenv.config();

const pgconfig = {
  user: process.env.PGD_USER,
  password: process.env.PGD_PASS,
  host: process.env.PGD_HOST,
  port: process.env.PGD_PORT,
  database: process.env.PGD_NAME,
}

async function main() {
  const pool = new pg.Pool(pgconfig);

  try {
    // 读取 SQL 文件
    const sqlFilePath = '.pg.build.sql';
    const sqlQuery = fs.readFileSync(sqlFilePath, { encoding: 'utf-8' });
    // 执行 SQL 文件中的查询
    await pool.query(sqlQuery);
    console.log('SQL query executed successfully');
  } catch (err) {
    console.error('Error executing SQL query:', err);
  }

  await pool.end();
}

main().catch((err) => console.error(err));

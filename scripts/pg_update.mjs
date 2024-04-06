import dotenv from 'dotenv';
import pg from 'pg';

import { api } from './pokeapi.mjs'
import { readFile, writeFile } from 'node:fs/promises';

dotenv.config();

const pgconfig = {
  user: process.env.PGD_USER,
  password: process.env.PGD_PASS,
  host: process.env.PGD_HOST,
  port: process.env.PGD_PORT,
  database: process.env.PGD_NAME,
}

const getId = (url) => {
  return url.split('/').filter(Boolean).pop()
}

async function updateLanguages(pool) {
  try {
    const res = await api.languages();
    const languages = res.data.results;
    const names = languages.map((language) => language.name);
    const languagesQuery = `
      INSERT INTO Languages(name) VALUES 
      ${names.map(name => `('${name}')`).join(", ")}
      ON CONFLICT (name) DO NOTHING;
    `;
    
    await pool.query(languagesQuery);
    console.log("Languages inserted successfully.");
  } 
  catch (err) {
    console.error('Error updateing languages:', err);
    throw err;
  }
}

async function updateErrorJson(errorKey, errorValues, silent=false) {
  let errorData = {};
  errorData[errorKey] = errorValues;
  try {
    // 尝试读取现有的 error.json 文件
    const data = await readFile('scripts/error.json', 'utf8');
    errorData = JSON.parse(data);
    // 更新 errorKey 键值
    errorData[errorKey] = errorValues;
  } 
  catch (error) {
    if (error.code !== 'ENOENT') {
      // 如果错误不是因为文件不存在，抛出错误
      throw error;
    } else{
      // 如果文件不存在，将创建一个新文件并写入 errorData 对象
    }
  }
  // 将更新后的对象写回 error.json 文件
  await writeFile('scripts/error.json', JSON.stringify(errorData, null, 2));
  if (!silent) console.log(`Error ${errorKey} have been written to scripts/error.json.`);
}

async function updateErrorKey(pool, errorKey='all', silent=false) {
  const data = await readFile(`scripts/error.json`, 'utf8');
  const errorData = JSON.parse(data);
  if (errorKey != 'all') {
    try {
      const errorValues = errorData[errorKey];
      if (errorValues.length) {
        switch (errorKey) {
          case 'Pokemon':
            const _errorValues = await updatePokemon(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
        }
        if (errorData[errorKey].length){
          // 递归直到解决所有errorKey error
          updateErrorKey(pool, errorKey, true);
        }
      }
      else return
      await writeFile('scripts/error.json', JSON.stringify(errorData, null, 2));
      if (!silent) console.log(`\nError ${errorKey} fixed successfully.`);
    } 
    catch (err) {
      if (!silent) console.error(`Error updateing error ${errorKey}:`, err);
    }
  }
  else {
    // 更新所有errorKey
    for (const errorKey of Object.keys(errorData)) {
      await updateErrorKey(pool, errorKey);
    }
    console.log('\nAll errors fixed successfully.');
  }
}

async function updateTypes(pool) {
  try {
    // 添加类型
    const res = await api.type('');
    const types = res.data.results;
    const names = types.map((type) => type.name);
    const typeIds = types.map(type => {
      return getId(type.url);
    });
    const typeQuery = `
      INSERT INTO PokemonType(tid, brief) VALUES 
      ${typeIds.map((id, index) => 
        `(${id}, '${names[index]}')`
        ).join(", ")}
      ON CONFLICT (brief) DO UPDATE SET
      tid = EXCLUDED.tid,
      UpdatedAt = CURRENT_TIMESTAMP;
    `;
    await pool.query(typeQuery);
    console.log("Pokemon type inserted successfully.");

    // 添加类型名称和关系
    for (const typeId of typeIds) {
      const res = await api.type(typeId);
      const data = res.data;
      const typeNameQuery = `
        INSERT INTO PokemonTypeDetail(tid, language, name) VALUES 
        ${data.names.map(name => 
          `(${typeId}, '${name.language.name}', '${name.name}')`
        ).join(', ')}
        ON CONFLICT (tid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `;
      await pool.query(typeNameQuery);
      console.log(`Pokemon type ${typeId} names inserted successfully.`);

      for (const relation in data.damage_relations) {
        const toTypeIds = data.damage_relations[relation].map(target => getId(target.url));
        const values = toTypeIds
          .filter(toTypeId => toTypeId) // 确保toTypeId有效
          .map(toTypeId => 
            `(${typeId}, ${toTypeId}, '${relation}')`
          ).join(', ');

        if (values) { // 确保values非空
          const typeRelationQuery = `
            INSERT INTO PokemonTypeRelation(tid, toTid, relation) VALUES
            ${values}
            ON CONFLICT (tid, toTid, relation) DO NOTHING;
          `;
          await pool.query(typeRelationQuery);
        }
      }
      console.log(`Pokemon type ${typeId} relations inserted successfully.`);
    }
    console.log("Pokemon typenames and relations inserted successfully.");
  }
  catch (err) {
    console.error('Error updateing types:', err);
    throw err;
  }
}

async function updatePokemon(pool, pokemonIds=[], type='default') {
  const errorPids = []; // 用于收集错误的pid
  const total = await (async () => {
    if (!pokemonIds.length) {
      // 获取所有 Pokemon ID
      const pokemonsRes = await api.pokemon(`?limit=1`);
      return pokemonsRes.data.count;
    }
    else return pokemonIds.length;
  })()
  let processed = 0;
  const processContent = (() => {
    if (type=='default') return 'Updating Pokemons...';
    else return 'Fixing Error Pokemons...';
  })()
  const updateProcess = (length = 0) => {
    processed += length;
    process.stdout.write(`\r${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = type=='default' ? false : true;
  // 定义一个异步函数来处理单个 Pokemon ID
  async function processPokemonId(pid) {
    try {
      const pokemonRes = await api.pokemon(pid);
      const data = pokemonRes.data;
      const sid = getId(data.species.url);
      const pokemonSpeciesRes = await api.pokemonSpecies(sid);
      const ecid = getId(pokemonSpeciesRes.data.evolution_chain.url);

      await pool.query(`
        INSERT INTO PokemonEvolutionChain(ecid) VALUES ('${ecid}')
        ON CONFLICT (ecid) DO NOTHING;
      `);

      await pool.query(`
        INSERT INTO PokemonSpecie(sid, ecid) VALUES ('${sid}', '${ecid}')
        ON CONFLICT (sid) DO UPDATE SET ecid = EXCLUDED.ecid;
      `);

      await pool.query(`
        INSERT INTO Pokemon(pid, sid) VALUES ('${pid}', '${sid}')
        ON CONFLICT (pid) DO UPDATE SET sid = EXCLUDED.sid;
      `);

    } catch (error) {
      process.stdout.write('\x1b[2K\r');
      // console.error(`Failed to insert Pokemon ${pid}:`, error);
      if (!silent) console.error(`Failed to update Pokemon ${pid}`);
      errorPids.push(pid); // 收集出错的pid
      updateProcess();
    }
  }

  try {
    if (pokemonIds.length === 0) {
      // 获取指定的 Pokemon ID
      const pokemonsRes = await api.pokemon(`?limit=${total}`);
      const pokemons = pokemonsRes.data.results;
      pokemonIds = pokemons.map((pokemon) => getId(pokemon.url));
    }

    // 将 pokemonIds 分成每次20个的批次
    const chunkSize = 20;
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = pokemonIds.slice(i, i + chunkSize);
      await Promise.all(chunk.map(pid => processPokemonId(pid)));
      // 更新进度条
      updateProcess(chunk.length);
    }

    if (!silent) console.log('\nAll pokemons have been processed.');
  } catch (err) {
    if (!silent) console.error('Error updating pokemon:', err);
  }
  // 将出错的pid写入到 error.json 文件
  await updateErrorJson('Pokemon', errorPids, silent);
  return errorPids
}

async function main() {
  const pool = new pg.Pool(pgconfig);

  // await updateLanguages(pool);
  // await updateTypes(pool);
  // await updatePokemon(pool);
  await updateErrorKey(pool);


  await pool.end();
}

main().catch((err) => console.error(err));
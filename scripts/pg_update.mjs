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

async function updateErrorKey(pool, errorKey = 'all', silent = false, depth = 0) {
  const data = await readFile(`scripts/error.json`, 'utf8');
  const errorData = JSON.parse(data);
  
  if (errorKey != 'all') {
    try {
      const errorValues = errorData[errorKey];
      if (errorValues.length) {
        let _errorValues;
        switch (errorKey) {
          case 'Pokemon':
            _errorValues = await updatePokemon(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
          case 'Generation':
            _errorValues = await updateGeneration(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
        }
        
        if (errorData[errorKey].length) {
          // 递归直到解决所有errorKey error，但不超过8层深度
          if (depth >= 8) {
            console.error(`\rError ${errorKey} failed to fix: retry over 8 times.`);
            return;
          }
          await updateErrorKey(pool, errorKey, true, depth + 1);
        }
      }
      else return;
      
      if (!silent) console.log(`\rError ${errorKey} fixed successfully.`);
    } 
    catch (err) {
      if (!silent) console.error(`\nError updating error ${errorKey}:`, err);
    }
  }
  else {
    // 更新所有errorKey，首次调用不计入递归深度
    for (const key of Object.keys(errorData)) {
      await updateErrorKey(pool, key, false, depth + 1);
    }
    if (!silent) console.log('\nAll errors fixed successfully.');
  }
}


async function updateTypes(pool) {
  try {
    const res = await api.type('');
    const types = res.data.results;
    const names = types.map((type) => type.name);
    const typeIds = types.map(type => {
      return getId(type.url);
    });
    // 宝可梦类型 Type
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

    for (const typeId of typeIds) {
      const res = await api.type(typeId);
      const data = res.data;
      // 宝可梦类型名称 TypeDetail
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

        if (values) {
          // 宝可梦类型关系 TypeRelation
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

async function updateGeneration(pool, generations = [], mode = 'all') {
  let errorGeneration = [];

  try {
    if (!generations.length) {
      // 如果没有传入 generations，则从 API 获取所有 generations
      const generationsRes = await api.generation('');
      const generationsData = generationsRes.data.results;
      generations = generationsData.map((generation) => getId(generation.url));
    }

    // 宝可梦世代 Generation
    await pool.query(`
      INSERT INTO PokemonGeneration(gid) VALUES
      ${generations.map(generation =>
        `('${generation}')`
      ).join(', ')}
      ON CONFLICT (gid) DO NOTHING;
    `);

    // 获取所有版本组的数量用于进度条
    const versionGroupsRes = await api.versionGroup('');
    let totalVersionGroups = versionGroupsRes.data.count;
    let processedVersionGroups = 0;

    // 并发处理世代
    await Promise.all(generations.map(async (gid) => {
      try {
        const res = await api.generation(gid);
        const generationData = res.data;

        // 宝可梦世代名称 GenerationDetail
        await Promise.all(generationData.names.map(async (name) => {
          const escapedName = name.name.replace(/'/g, "''");
          await pool.query(`INSERT INTO PokemonGenerationDetail(gid, language, name) VALUES ('${gid}', '${name.language.name}', '${escapedName}') ON CONFLICT (gid, language) DO UPDATE SET name = EXCLUDED.name;`);
        }));

        // 并发处理版本组
        await Promise.all(generationData.version_groups.map(async (versionGroup) => {
          const versionGroupId = getId(versionGroup.url);
          const versionGroupRes = await api.versionGroup(versionGroupId);
          const versionGroupData = versionGroupRes.data;

          // 宝可梦版本 Version
          await Promise.all(versionGroupData.versions.map(async (version) => {
            const versionId = getId(version.url);
            const escapedVersionName = version.name.replace(/'/g, "''");
            await pool.query(`INSERT INTO PokemonVersion(vid, gid, brief) VALUES (${versionId}, '${gid}', '${escapedVersionName}') ON CONFLICT (vid) DO UPDATE SET gid = EXCLUDED.gid, brief = EXCLUDED.brief;`);

            // 获取每个版本的详细信息并并发插入 PokemonVersionDetail
            const versionRes = await api.version(versionId);
            const versionData = versionRes.data;

            // 宝可梦版本名称 VersionDetail
            await Promise.all(versionData.names.map(async (name) => {
              const escapedName = name.name.replace(/'/g, "''");
              const queryValues = `('${versionId}', '${name.language.name}', '${escapedName}')`;
              if (queryValues) {
                return pool.query(`
                INSERT INTO PokemonVersionDetail(vid, language, name) VALUES
                (${versionId}, '${name.language.name}', '${escapedName}')
                ON CONFLICT (vid, language) DO UPDATE SET
                name = EXCLUDED.name;
              `);
              }
              return Promise.resolve();
            }));
          }));

          processedVersionGroups++;
          if (mode !== 'errorFix') {
            const progress = ((processedVersionGroups / totalVersionGroups) * 100).toFixed(2);
            process.stdout.write(`\rProcessing version groups... ${progress}% [${processedVersionGroups}/${totalVersionGroups}]`);
          } else {
            process.stdout.write(`\rFixing generation-${gid} version groups... [${processedVersionGroups}/~]`);
          }
        }));

      } catch (err) {
        if (mode !== 'errorFix') console.log(`\nFailed to update generation ${gid}`);
        errorGeneration.push(gid);
      }
    }));

    if (mode !== 'errorFix') console.log("\nGeneration data inserted successfully.");
  } catch (err) {
    if (mode !== 'errorFix') console.error('Error updating generations:', err);
  }
  await updateErrorJson('Generation', errorGeneration, mode == 'errorFix' || !errorGeneration.length);

  return errorGeneration;
}


async function updatePokemon(pool, pokemonIds=[], mode='default') {
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
    if (mode=='default') return 'Updating Pokemons...';
    else return 'Fixing Error Pokemons...';
  })()
  const updateProcess = (length = 0) => {
    processed += length;
    process.stdout.write(`\r${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = mode=='default' ? false : true;
  // 定义一个异步函数来处理单个 Pokemon ID
  async function processPokemonId(pid) {
    try {
      const pokemonRes = await api.pokemon(pid);
      const data = pokemonRes.data;
      const sid = getId(data.species.url);
      const pokemonSpeciesRes = await api.specie(sid);
      const sdata = pokemonSpeciesRes.data;
      const ecid = getId(sdata.evolution_chain.url);

      // 宝可梦进化链 EvolutionChain
      await pool.query(`
        INSERT INTO PokemonEvolutionChain(ecid) VALUES ('${ecid}')
        ON CONFLICT (ecid) DO NOTHING;
      `);

      // 宝可梦属别 Genus
      const genus = sdata.genera.find(genus => genus.language.name === 'en');
      await pool.query(`
        INSERT INTO PokemonGenus(brief) VALUES
        ('${genus.genus}')
        ON CONFLICT (brief) DO NOTHING;
      `)
      const genusId = await pool.query(`
        SELECT gid FROM PokemonGenus WHERE brief = '${genus.genus}'
      `)
      const gid = genusId.rows[0].gid;

      // 宝可梦属别名称 GenusDetail
      await pool.query(`
        INSERT INTO PokemonGenusDetail(gid, language, name) VALUES
        ${sdata.genera.map(genus =>
          `('${gid}', '${genus.language.name}', '${genus.genus}')`
        ).join(', ')}
        ON CONFLICT (gid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `)

      // 宝可梦种族 Specie
      await pool.query(`
        INSERT INTO PokemonSpecie(sid, ecid, gid) VALUES ('${sid}', '${ecid}', '${gid}')
        ON CONFLICT (sid) DO UPDATE SET 
        ecid = EXCLUDED.ecid,
        gid = EXCLUDED.gid;
      `);

      // 宝可梦 Pokemon
      await pool.query(`
        INSERT INTO Pokemon(pid, sid) VALUES ('${pid}', '${sid}')
        ON CONFLICT (pid) DO UPDATE SET sid = EXCLUDED.sid;
      `);

      // 宝可梦名称 Detail
      const names = sdata.names;
      await pool.query(`
        INSERT INTO PokemonDetail(pid, language, name) VALUES
        ${names.map(name =>
          `('${pid}', '${name.language.name}', '${name.name}')`
        ).join(', ')}
        ON CONFLICT (pid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);

      // 宝可梦属性 TypeLink
      const types = data.types;
      const typeIds = types.map(type => getId(type.type.url));
      await pool.query(`
        INSERT INTO PokemonTypeLink(pid, tid) VALUES
        ${typeIds.map(tid =>
          `('${pid}', '${tid}')`
        ).join(', ')}
        ON CONFLICT (pid, tid) DO NOTHING;
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

    // 每次并发 60 个请求
    const chunkSize = 60;
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = pokemonIds.slice(i, i + chunkSize);
      await Promise.all(chunk.map(pid => processPokemonId(pid)));
      // 更新进度条
      updateProcess(chunk.length);
      // 更新 error.json 文件
      await updateErrorJson('Pokemon', errorPids, true);
    }

    if (!silent) console.log('\nAll pokemons have been processed.');
  } catch (err) {
    if (!silent) console.error('Error updating pokemon:', err);
  }
  if (!silent) console.log(`Error Pokemon have been written to scripts/error.json.`);
  await updateErrorJson('Pokemon', errorPids, true);
  return errorPids
}

async function main() {
  const pool = new pg.Pool(pgconfig);

  // await updateLanguages(pool);
  // await updateTypes(pool);
  // await updateGeneration(pool);

  // await updatePokemon(pool);
  await updateErrorKey(pool);


  await pool.end();
}

main().catch((err) => console.error(err));
import dotenv from 'dotenv';
import pg from 'pg';
import pLimit from 'p-limit';

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
  if (!silent) console.log(`\nError ${errorKey} have been written to scripts/error.json.`);
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
          case 'Move':
            _errorValues = await updateMove(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
          case 'EvolutionChain':
            _errorValues = await updateEvolutionChain(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
          case 'Item':
            _errorValues = await updateItem(pool, errorValues, 'errorFix');
            errorData[errorKey] = _errorValues;
            break;
        }
        
        if (errorData[errorKey].length) {
          // 递归直到解决所有errorKey error，但不超过8层深度
          if (depth >= 8) {
            process.stdout.write('\x1b[2K\r');
            console.error(`Failed to fix error ${errorKey}: retry over 8 times.`);
            return;
          }
          await updateErrorKey(pool, errorKey, true, depth + 1);
        }
      }
      else return;
      
      if (!silent) {
        process.stdout.write('\x1b[2K\r');
        console.log(`Error ${errorKey} resolved.`);
      }
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
    if (!silent) console.log('\nAll errors resolved.');
  }
}

// 待更新： 纠错、并发type
async function updateCommons(pool) {
  try {
    // 宝可梦物品类型
    const itemPocketsRes = await api.itemPocket('');
    const itemPockets = itemPocketsRes.data.results;
    await pool.query(`
      INSERT INTO PokemonItemPocket(ipid, brief) VALUES
      ${itemPockets.map(itemPoket =>
        `('${getId(itemPoket.url)}', '${itemPoket.name}')`
      ).join(', ')}
      ON CONFLICT (brief) DO NOTHING;
    `);
    // 宝可梦物品类型名称
    const itemPocketIds = itemPockets.map(itemPoket => getId(itemPoket.url));
    await Promise.all(itemPocketIds.map(async (itemPoketId) => {
      const itemPoketRes = await api.itemPocket(itemPoketId);
      const itemPoketData = itemPoketRes.data;
      await pool.query(`
        INSERT INTO PokemonItemPocketDetail(ipid, language, name) VALUES
        ${itemPoketData.names.map(name =>
          `('${itemPoketId}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (ipid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);
    }))
    console.log("ItemPokets inserted successfully.");
  }
  catch (err) {
    console.error('Error updating ItemPokets:', err);
  }
  try {
    // 宝可梦叫声类型 CrieType
    await pool.query(`
      INSERT INTO PokemonCrieType(brief) VALUES
      ('latest'), ('legacy')
      ON CONFLICT (brief) DO NOTHING;
    `);
    // 宝可梦图片类型
    await pool.query(`
      INSERT INTO PokemonImageType(brief) VALUES
      ('front_default'), ('front_shiny'), ('front_female'), ('front_shiny_female'), 
      ('back_default'), ('back_shiny'), ('back_female'), ('back_shiny_female'),
      ('front_transparent'), ('front_shiny_transparent'), 
      ('back_transparent'), ('back_shiny_transparent')
      ON CONFLICT (brief) DO NOTHING;
    `)
    // 宝可梦基本属性类型 StatType
    const statTypesRes = await api.stat('');
    const statTypes = statTypesRes.data.results;
    await pool.query(`
      INSERT INTO PokemonStatType(stid ,brief) VALUES
      ${statTypes.map(statType =>
        `('${getId(statType.url)}', '${statType.name}')`
      ).join(', ')}
      ON CONFLICT (brief) DO NOTHING;
    `);
    // 宝可梦基本属性名称 StatTypeDetail
    await Promise.all(statTypes.map(async (statType) => {
      const stid = getId(statType.url);
      const statTypeRes = await api.stat(stid);
      const statTypeData = statTypeRes.data;
      await pool.query(`
        INSERT INTO PokemonStatTypeDetail(stid, language, name) VALUES
        ${statTypeData.names.map(name =>
          `('${stid}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (stid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);
    }));
    console.log("Stat types and details inserted successfully.");
  }
  catch (err) {
    console.error('Error updating Stats:', err);
  }
  try {
    // 宝可梦招式类型 MoveClass
    const moveClassesRes = await api.moveClass('');
    const moveClassesData = moveClassesRes.data.results;
    await pool.query(`
      INSERT INTO PokemonMoveClass(mcid,brief) VALUES
      ${moveClassesData.map(moveClass =>
        `('${getId(moveClass.url)}', '${moveClass.name}')`
      ).join(', ')}
      ON CONFLICT (mcid) DO UPDATE SET brief = EXCLUDED.brief;
    `);
    // 宝可梦招式类型信息 MoveClassDetail
    await Promise.all(moveClassesData.map(async (moveClass) => {
      const mcid = getId(moveClass.url);
      const moveClassRes = await api.moveClass(mcid);
      const moveClassData = moveClassRes.data;
      await pool.query(`
        INSERT INTO PokemonMoveClassDetail(mcid, language, description) VALUES
        ${moveClassData.descriptions.map(description =>
          `('${mcid}', '${description.language.name}', '${description.description.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (mcid, language) DO UPDATE SET
        description = EXCLUDED.description;
      `)
    }))
    console.log("Move classes and details inserted successfully.");
  }
  catch (err) {
    console.error('Error updating move classes:', err);
  }
  try {
    // 宝可梦颜色 Color
    const colorRes = await api.color('');
    const colors = colorRes.data.results;
    await pool.query(`
      INSERT INTO PokemonColor(brief) VALUES
      ${colors.map(color =>
        `('${color.name}')`
      ).join(', ')}
      ON CONFLICT (brief) DO NOTHING;
    `);
    // 宝可梦颜色名称 ColorDetail
    await Promise.all(colors.map(async (color) => {
      const colorId = getId(color.url);
      const colorRes = await api.color(colorId);
      const colorData = colorRes.data;
      await pool.query(`
        INSERT INTO PokemonColorDetail(cid, language, name) VALUES
        ${colorData.names.map(name =>
          `('${colorId}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (cid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);
    }))
    console.log("Colors and details inserted successfully.");
  }
  catch (err) {
    console.error('Error updating colors:', err);
  }
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
      // console.log(`Pokemon type ${typeId} names inserted successfully.`);

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
      // console.log(`Pokemon type ${typeId} relations inserted successfully.`);
    }
    console.log("Pokemon typenames and relations inserted successfully.");
  }
  catch (err) {
    console.error('Error updateing types:', err);
    throw err;
  }
}

async function updateGeneration(pool, generations=[], mode='default') {
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
          // 宝可梦版本组 VersionGroup
          await pool.query(`
            INSERT INTO PokemonVersionGroup(vgid, gid, brief) VALUES
            ('${versionGroupId}', '${gid}', '${versionGroupData.name.replace(/'/g, "''")}')
            ON CONFLICT (vgid) DO UPDATE SET gid = EXCLUDED.gid, brief = EXCLUDED.brief;
          `);

          // 宝可梦版本组名称 VersionGroupDetail
          await pool.query(`
            INSERT INTO PokemonVersionGroupDetail(vgid, language, name) VALUES
            ('${versionGroupId}', '${'en'}', '${versionGroupData.name.replace(/'/g, "''")}')
            ON CONFLICT (vgid, language) DO UPDATE SET name = EXCLUDED.name;
          `);

          // 宝可梦版本 Version
          await Promise.all(versionGroupData.versions.map(async (version) => {
            const versionId = getId(version.url);
            const escapedVersionName = version.name.replace(/'/g, "''");
            await pool.query(`
              INSERT INTO PokemonVersion(vid, vgid, brief) VALUES 
              (${versionId}, '${versionGroupId}', '${escapedVersionName}') 
              ON CONFLICT (vid) DO UPDATE SET vgid = EXCLUDED.vgid, brief = EXCLUDED.brief;`);

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

      } 
      catch (err) {
        if (mode !== 'errorFix') console.log(`\nFailed to update generation ${gid}`);
        // console.error(err);
        errorGeneration.push(gid);
      }
    }));

    if (mode !== 'errorFix') console.log("\nGeneration data inserted successfully.");
  } 
  catch (err) {
    if (mode !== 'errorFix') console.error('Error updating generations:', err);
  } 
  finally {
    await updateErrorJson('Generation', errorGeneration, mode == 'errorFix' || !errorGeneration.length);
    return errorGeneration;
  }
}

async function updateMove(pool, moveIds=[], mode='default') {
  const errorMids = [];
  const total = await (async () => {
    if (!moveIds.length) {
      const moveRes = await api.move(`?limit=1`);
      return moveRes.data.count;
    }
    else return moveIds.length;
  })()
  let processed = 0;
  const processContent = (() => {
    if (mode=='default') return 'Updating Moves...';
    else return 'Fixing Error Moves...';
  })()
  const updateProcess = (length = 0) => {
    processed += length;
    process.stdout.write('\x1b[2K\r');
    process.stdout.write(`${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = mode=='default' ? false : true;
  const limit = pLimit(60); // 设置并发限制为60

  // 异步函数处理单个 Move ID
  const processMoveId = (mid) => limit(async () => {
    try {
      const moveRes = await api.move(mid).catch(err => {
        throw new Error(`Failed to fetch move data: ${err.message}`);
      });
      const data = moveRes.data;
      const tid = getId(data.type.url);
      const mcid = getId(data.damage_class.url);
      const generation = getId(data.generation.url);
      const power = data.power ? data.power : 0;
      const pp = data.pp ? data.pp : 0;
      const priority = data.priority ? data.priority : 0;
      const accuracy = data.accuracy ? data.accuracy : 100;
      // 宝可梦招式 Move
      await pool.query(`
        INSERT INTO PokemonMove(mid, tid, mcid, generation, power, pp, priority, accuracy) VALUES
        ('${mid}', '${tid}', '${mcid}', '${generation}', '${power}', '${pp}', '${priority}', '${accuracy}')
        ON CONFLICT (mid) DO UPDATE SET
        tid = EXCLUDED.tid, mcid = EXCLUDED.mcid, generation = EXCLUDED.generation, power = EXCLUDED.power, pp = EXCLUDED.pp, priority = EXCLUDED.priority, accuracy = EXCLUDED.accuracy;
      `);

      let descriptions = data.flavor_text_entries;
      if (!descriptions.length) {
        await pool.query(`
          INSERT INTO PokemonMoveDetail(mid, language, name, description) VALUES
          ${data.names.map(name =>
            `('${mid}', '${name.language.name}', '${name.name.replace(/'/g, "''")}', 'null')`
          ).join(', ')}
          ON CONFLICT (mid, language) DO UPDATE SET
          name = EXCLUDED.name, description = EXCLUDED.description;
        `);
      }
      else {
        const uniqueMoveDetails = {}; // 保证使用同一语言的最新描述信息
        descriptions.forEach(description => {
          const language = description.language.name;
          const name = data.names.find(name => name.language.name === language)?.name.replace(/'/g, "''") || '';
          const escapedDescription = description.flavor_text.replace(/'/g, "''");
          const key = `${language}`;
          uniqueMoveDetails[key] = [language, name, escapedDescription];
        });
        // 将对象的值转换回数组形式
        const moveDetails = Object.values(uniqueMoveDetails);
        const moveDetailValue = moveDetails.map(moveDetail => 
          `('${mid}', '${moveDetail[0]}', '${moveDetail[1]}', '${moveDetail[2]}')`
        );
        // 宝可梦招式信息 MoveDetail
        await pool.query(`
          INSERT INTO PokemonMoveDetail(mid, language, name, description) VALUES
          ${moveDetailValue.join(",")}
          ON CONFLICT (mid, language) DO UPDATE SET
          name = EXCLUDED.name, description = EXCLUDED.description;
        `);
      }
    }
    catch (error) {
      process.stdout.write('\x1b[2K\r');
      // console.error(`Failed to update Move ${mid}:`, error);
      if (!silent) console.error(`Failed to update Move ${mid}`);
      errorMids.push(mid); // 收集出错的pid
    }
    finally {
      // 更新进度条
      updateProcess(1);
    }
  });

  try {
    if (moveIds.length === 0) {
      // 获取全部 Move ID
      const movesRes = await api.move(`?limit=${total}`);
      const moves = movesRes.data.results;
      moveIds = moves.map((move) => getId(move.url));
    }
    // 创建Promise数组，并等待所有Promise完成
    const tasks = moveIds.map(mid => processMoveId(mid));
    await Promise.all(tasks);
    if (!silent) console.log('\nAll moves have been processed.');
  }
  catch (err) {
    if (!silent) console.error('Error updating moves:', err);
  }
  finally {
    await updateErrorJson('Move', errorMids, mode == 'errorFix' || !errorMids.length);
    return errorMids;
  }
}

async function updateItem(pool, itemIds=[], mode='default') {
  const errorIids = [];
  const total = await (async () => {
    if (!itemIds.length) {
      const itemRes = await api.item(`?limit=1`);
      return itemRes.data.count;
    }
    else return itemIds.length;
  })();
  let processed = 0;
  const processContent = mode=='default' ? 
    'Updating Items...': 'Fixing Error Items...';
  const updateProcess = (length = 0) => {
    processed += length;
    process.stdout.write('\x1b[2K\r');
    process.stdout.write(`${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = mode=='default' ? false : true;
  const limit = pLimit(60); // 设置并发限制为60

  // 异步函数处理单个 Item ID
  const processItemId = (iid) => limit(async () => {
    try {
      const itemRes = await api.item(iid);
      const data = itemRes.data;
      const cid = getId(data.category.url);
      const itemCategoryRes = await api.itemCategory(cid);
      const itemCategoryData = itemCategoryRes.data;
      const ipid = getId(itemCategoryData.pocket.url);
      const url = data.sprites.default ? data.sprites.default : 'null';
      const cost = data.cost ? data.cost : -1;
      // 宝可梦道具 Item
      await pool.query(`
        INSERT INTO PokemonItem(iid, ipid, cost, url) VALUES
        ('${iid}', '${ipid}', '${cost}', '${url}')
        ON CONFLICT (iid) DO UPDATE SET
        ipid = EXCLUDED.ipid, cost = EXCLUDED.cost, url = EXCLUDED.url;
      `);

      const names = data.names;
      const itemDetailValue = names.map(name => {
        const language = name.language.name;
        const nameValue = name.name.replace(/'/g, "''");
        let description = 'null';
        const textEntries = data.flavor_text_entries;
        if (textEntries.length) {
          const texts = textEntries.filter(textEntry => textEntry.language.name === language);
          const text = texts.length ? texts[texts.length-1] : false;
          if (text) {
            description = text.text.replace(/'/g, "''");
          }
        }
        return `('${iid}', '${language}', '${nameValue}', '${description}')`;
      });
      if (!itemDetailValue.length) return Promise.resolve();
      // 宝可梦道具名称 ItemDetail
      await pool.query(`
        INSERT INTO PokemonItemDetail(iid, language, name, description) VALUES
        ${itemDetailValue.join(",")}
        ON CONFLICT (iid, language) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description;
      `);
    }
    catch (error) {
      process.stdout.write('\x1b[2K\r');
      // console.error(`Failed to update Item ${iid}:`, error);
      if (!silent) console.error(`Failed to update Item ${iid}`);
      errorIids.push(iid); // 收集出错的iid
    }
    finally {
      // 更新进度条
      updateProcess(1);
    }
  });

  try {
    if (itemIds.length === 0) {
      // 获取全部 Item ID
      const itemsRes = await api.item(`?limit=${total}`);
      const items = itemsRes.data.results;
      itemIds = items.map((item) => getId(item.url));
    }
    // 创建Promise数组，并等待所有Promise完成
    const tasks = itemIds.map(iid => processItemId(iid));
    await Promise.all(tasks);

    if (!silent) console.log('\nAll items have been processed.');
  }
  catch (err) {
    if (!silent) console.error('Error updating items:', err);
  }
  finally {
    await updateErrorJson('Item', errorIids, mode == 'errorFix' || !errorIids.length);
    return errorIids;
  }
}

async function updatePokemon(pool, pokemonIds=[], mode='default') {
  const errorPids = []; // 用于收集错误的pid
  const total = await (async () => {
    if (!pokemonIds.length) {
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
    process.stdout.write('\x1b[2K\r');
    process.stdout.write(`${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = mode=='default' ? false : true;
  const limit = pLimit(60); // 设置并发限制为60

  // 异步处理单个 Pokemon ID
  const processPokemonId = (pid) => limit(async () => {
    try {
      const pokemonRes = await api.pokemon(pid);
      const data = pokemonRes.data;
      const sid = getId(data.species.url);
      const fid = getId(data.forms[0].url);
      const pokemonSpeciesRes = await api.specie(sid);
      const sdata = pokemonSpeciesRes.data;
      const pokemonFormRes = await api.form(fid);
      const fdata = pokemonFormRes.data;
      const ecid = getId(sdata.evolution_chain.url);

      // 宝可梦进化链 EvolutionChain
      await pool.query(`
        INSERT INTO PokemonEvolutionChain(ecid) VALUES ('${ecid}')
        ON CONFLICT (ecid) DO NOTHING;
      `);

      // 宝可梦属别 Genus
      const genus = sdata.genera.find(genus => genus.language.name === 'en') ?
        sdata.genera.find(genus => genus.language.name === 'en') : 'unknown';
      await pool.query(`
        INSERT INTO PokemonGenus(brief) VALUES
        ('${genus.genus}')
        ON CONFLICT (brief) DO NOTHING;
      `);

      const genusId = await pool.query(`
        SELECT gid FROM PokemonGenus WHERE brief = '${genus.genus}'
      `);
      const gid = genusId.rows[0].gid;

      if (genus !== 'unknown') {
        // 宝可梦属别信息 GenusDetail
        await pool.query(`
          INSERT INTO PokemonGenusDetail(gid, language, name) VALUES
          ${sdata.genera.map(genus =>
            `('${gid}', '${genus.language.name}', '${genus.genus}')`
          ).join(', ')}
          ON CONFLICT (gid, language) DO UPDATE SET
          name = EXCLUDED.name;
        `);
      }

      // 宝可梦种族 Specie
      await pool.query(`
        INSERT INTO PokemonSpecie(sid, ecid, gid, generation, cid) VALUES 
        ('${sid}', '${ecid}', '${gid}', '${getId(sdata.generation.url)}', '${getId(sdata.color.url)}')
        ON CONFLICT (sid) DO UPDATE SET 
        ecid = EXCLUDED.ecid,
        gid = EXCLUDED.gid,
        generation = EXCLUDED.generation,
        cid = EXCLUDED.cid;
      `);

      // 宝可梦种族信息 SpecieDetail
      const snames = sdata.names;
      await pool.query(`
        INSERT INTO PokemonSpecieDetail(sid, language, name) VALUES
        ${snames.map(name =>
          `('${sid}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (sid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);

      // 宝可梦种族描述 SpecieText
      let texts = sdata.flavor_text_entries;
      if (!texts.length) {
        await pool.query(`
          INSERT INTO PokemonSpecieText(sid, language, flavorText) VALUES
          ${sdata.names.map(name =>
            `('${sid}', '${name.language.name}', 'null')`
          ).join(', ')}
          ON CONFLICT (sid, language, flavorText) DO NOTHING;
        `);
      }
      else {
        const flavorTextsValue = texts.map(text => {
          const language = text.language.name;
          const flavorText = text.flavor_text.replace(/'/g, "''");
          return `('${sid}', '${language}', '${flavorText}')`;
        });
        await pool.query(`
          INSERT INTO PokemonSpecieText(sid, language, flavorText) VALUES
          ${flavorTextsValue.join(",")}
          ON CONFLICT (sid, language, flavorText) DO NOTHING;
        `);
      }

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
          `('${pid}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
        ).join(', ')}
        ON CONFLICT (pid, language) DO UPDATE SET
        name = EXCLUDED.name;
      `);
      if (fdata.names.length) {
        try {
          await pool.query(`
          INSERT INTO PokemonDetail(pid, language, name) VALUES
          ${fdata.names.map(name =>
            `('${pid}', '${name.language.name}', '${name.name.replace(/'/g, "''")}')`
          ).join(', ')}
          ON CONFLICT (pid, language) DO UPDATE SET
          name = EXCLUDED.name;
        `);
        } catch (error) {}
      }

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
      
      // 宝可梦基本信息 Base
      const experience = data.base_experience ? data.base_experience : 9999;
      await pool.query(`
        INSERT INTO PokemonBase(pid, height, weight, experience) VALUES
        ('${pid}', ${data.height}, ${data.weight}, ${experience})
        ON CONFLICT (pid) DO UPDATE SET
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        experience = EXCLUDED.experience;
      `);
      
      // 宝可梦基本属性 Stat
      const stats = data.stats;
      await pool.query(`
        INSERT INTO PokemonStat(pid, stid, baseStat, effort) VALUES
        ${stats.map(stat =>
          `('${pid}', '${getId(stat.stat.url)}', '${stat.base_stat}', '${stat.effort}')`
        ).join(', ')}
        ON CONFLICT (pid, stid) DO UPDATE SET
        baseStat = EXCLUDED.baseStat,
        effort = EXCLUDED.effort;
      `);

      // 宝可梦叫声 Crie
      const cries = data.cries;
      if (cries.latest) 
        await pool.query(`
          INSERT INTO PokemonCrie(pid, ctid_, url) VALUES
          ('${pid}', '${1}', '${cries.latest}')
          ON CONFLICT (pid, ctid_) DO UPDATE SET
          url = EXCLUDED.url;
        `);
      if (cries.legacy)
        await pool.query(`
          INSERT INTO PokemonCrie(pid, ctid_, url) VALUES
          ('${pid}', '${2}', '${cries.legacy}')
          ON CONFLICT (pid, ctid_) DO UPDATE SET
          url = EXCLUDED.url;
        `);

      // 宝可梦物品 ItemLink
      const itemIds = data.held_items.map(item => getId(item.item.url));
      if (itemIds.length) 
        await pool.query(`
          INSERT INTO PokemonItemLink(pid, iid) VALUES
          ${itemIds.map(iid =>
            `('${pid}', '${iid}')`
          ).join(', ')}
          ON CONFLICT (pid, iid) DO NOTHING;
        `);

      // 宝可梦招式关系 MoveLink
      const moves = data.moves;
      const moveLinkValues = moves.map(move => {
        const mid = getId(move.move.url);
        const versionGroupDetails = move.version_group_details;
        const level = (() => {
          if (versionGroupDetails.length && 
            versionGroupDetails[versionGroupDetails.length-1].move_learn_method.name!="level-up")
            return -1;  // 非等级学习招式
          let level = 0;
          // 获取最高的学习等级
          for (let i = 0; i < versionGroupDetails.length; i++) {
            if (versionGroupDetails[i].level_learned_at > level) {
              level = versionGroupDetails[i].level_learned_at;
            }
          }
          return level;
        })()
        
        return `('${pid}', '${mid}', '${level}')`;
      });
      if (moveLinkValues.length) {
        await pool.query(`
          INSERT INTO PokemonMoveLink(pid, mid, level) VALUES
          ${moveLinkValues.join(', ')}
          ON CONFLICT (pid, mid) DO UPDATE SET
          level = EXCLUDED.level;
        `);
      }

      // 宝可梦图片 Image
      const imageTypeRes = await pool.query('SELECT itid, brief FROM PokemonImageType');
      const imageTypeObject = imageTypeRes.rows.reduce((obj, row) => {
        obj[row.brief] = row.itid;
        return obj;
      }, {}); // 获取 ImageType 键值对
      const imgs = data.sprites;
      // 初始化结果对象
      const result = {};
      // 递归函数来提取URL
      function extractUrls(obj) {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && value.startsWith('http')) {
                // 如果是URL字符串，将其添加到结果对象
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(value);
            } else if (typeof value === 'object' && value !== null) {
                // 如果是对象，递归调用
                extractUrls(value);
            }
        }
      }
      // 提取sprites对象中的所有URL
      extractUrls(imgs);
      await Promise.all(Object.entries(result).map(async ([key, value]) => {
        if (imageTypeObject[key]) {
          const itid = imageTypeObject[key];
          const urls = value;
          const urlsValue = urls.map(url => `('${pid}', '${itid}', '${url}')`);
          await pool.query(`
            INSERT INTO PokemonImage(pid, itid, url) VALUES
            ${urlsValue.join(', ')}
            ON CONFLICT (url) DO NOTHING;
          `);
        }
        else {
          console.log(`\nUnknown brief: ${key}`);
          await pool.query(`
            INSERT INTO PokemonImageType(brief) VALUES
            ('${key}')
            ON CONFLICT (brief) DO NOTHING;
          `);
        }
      }))

    } catch (error) {
      process.stdout.write('\x1b[2K\r');
      // console.error(`Failed to update Pokemon ${pid}:`, error);
      if (!silent) console.error(`Failed to update Pokemon ${pid}`);
      errorPids.push(pid); // 收集出错的pid
    }
    finally {
      // 更新进度条
      updateProcess(1)
    }
  });

  try {
    if (pokemonIds.length === 0) {
      // 获取全部 Pokemon ID
      const pokemonsRes = await api.pokemon(`?limit=${total}`);
      const pokemons = pokemonsRes.data.results;
      pokemonIds = pokemons.map((pokemon) => getId(pokemon.url));
    }
    // 创建Promise数组，并等待所有Promise完成
    const tasks = pokemonIds.map(pid => processPokemonId(pid));
    await Promise.all(tasks);

    if (!silent) console.log('\nAll pokemons have been processed.');
  } 
  catch (err) {
    if (!silent) console.error('Error updating pokemon:', err);
  }
  finally {
    await updateErrorJson('Pokemon', errorPids, mode == 'errorFix' || !errorPids.length);
    return errorPids
  }
}

async function updateEvolutionChain(pool, ecIds=[], mode='default') {
  let errorEcids = [];
  const total = await (async () => {
    if(ecIds.length)
      return ecIds.length;
    const res = await pool.query('SELECT COUNT(*) FROM PokemonEvolutionChain');
    return res.rows[0].count;
  })()
  let processed = 0;
  const processContent = (() => {
    if (mode=='default') return 'Updating EvolutionChains...';
    else return 'Fixing Error EvolutionChains...';
  })()
  const updateProcess = (length = 0) => {
    processed += length;
    process.stdout.write('\x1b[2K\r');
    process.stdout.write(`${processContent} ${((processed / total) * 100).toFixed(2)}%  [${processed}/${total}]`);
  }
  const silent = mode=='default' ? false : true;
  const limit = pLimit(60);  // 每次并发 60 个请求

  // 异步处理单个 EvolutionChainID
  const processEvolutionChainId = (ecid) => limit(async () => {
    try {
      const res = await api.evolutionChain(ecid);
      const chain = res.data.chain;
      // 进化关系数组
      const evolutionPairs = ((evolutionChains) => {
        let evolutionPairs = [];
        function traverse(chain) {
          // 如果当前阶段有演化结果
          if (chain.evolves_to && chain.evolves_to.length) {
            // 对于每一个可能的演化结果
            chain.evolves_to.forEach(nextChain => {
              // 将当前宝可梦和下一阶段宝可梦的名称配对
              evolutionPairs.push([getId(chain.species.url), getId(nextChain.species.url)]);
              // 递归遍历下一阶段的演化结果
              traverse(nextChain);
            });
          }
        }
        // 从演化链的最初阶段开始递归遍历
        traverse(evolutionChains);
        return evolutionPairs;
      })(chain);
      if (!evolutionPairs.length) return Promise.resolve();
      // 宝可梦进化关系 Evolution
      await pool.query(`
        INSERT INTO PokemonEvolution(ecid, sid, toSid) VALUES
        ${evolutionPairs.map(pair => `('${ecid}', '${getId(pair[0])}', '${getId(pair[1])}')`).join(', ')}
        ON CONFLICT (sid, toSid) DO NOTHING;
      `);
    }
    catch (err) {
      process.stdout.write('\x1b[2K\r');
      // console.error(`Failed to update EvolutionChain ${ecid}:`, err);
      if (!silent) console.error(`Error updating evolution chain ${ecid}`);
      errorEcids.push(ecid);
    }
    finally {
      // 更新进度条
      updateProcess(1)
    }
  });

  try {
    if (ecIds.length === 0) {
      // 获取全部 EvolutionChain ID
      const evolutionChainsRes = await pool.query('SELECT ecid FROM PokemonEvolutionChain');
      ecIds = evolutionChainsRes.rows.map((ec) => ec.ecid);
    }
    // 创建Promise数组，并等待所有Promise完成
    const tasks = ecIds.map(ecid => processEvolutionChainId(ecid));
    await Promise.all(tasks);
    if (!silent) console.log('\nAll evolution chains have been processed.');
  }
  catch (err) {
    if (!silent) console.error('Error updating evolution chains:', err);
  }
  finally {
    if (!silent) console.log(`Error EvolutionChain have been written to scripts/error.json.`);
    await updateErrorJson('EvolutionChain', errorEcids, mode == 'errorFix' || !errorEcids.length);
    return errorEcids
  }
}

async function main() {
  const pool = new pg.Pool(pgconfig);

  // await updateLanguages(pool);
  // await updateCommons(pool);
  // await updateGeneration(pool);
  // await updateMove(pool);
  // await updateItem(pool);
  await updatePokemon(pool);
  // await updateEvolutionChain(pool);
  await updateErrorKey(pool);


  await pool.end();
}

main().catch((err) => console.error(err));

// TODO: 特性
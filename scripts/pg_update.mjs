import dotenv from 'dotenv';
import pg from 'pg';

import { api } from './pokeapi.mjs'

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

async function updatePokemon(pool) {
  try {
    const pokemonsRes = await api.pokemon('?limit=1302');
    const pokemons = pokemonsRes.data.results;
    const pokemonIds = pokemons.map((pokemon) => getId(pokemon.url));
    for (const pid of pokemonIds) {
      const pokemonRes = await api.pokemon(pid);
      const data = pokemonRes.data;
      const sid = getId(data.species.url);
      const pokemonSpeciesRes = await api.pokemonSpecies(sid);
      const ecid = getId(pokemonSpeciesRes.data.evolution_chain.url);
      const getPokemonEvolutionChainQuery = `
        INSERT INTO PokemonEvolutionChain(ecid) VALUES
        ('${ecid}')
        ON CONFLICT (ecid) DO NOTHING;
      `;
      await pool.query(getPokemonEvolutionChainQuery);
      const pokemonSpecieQuery = `
        INSERT INTO PokemonSpecie(sid, ecid) VALUES
        ('${sid}', '${ecid}')
        ON CONFLICT (sid) DO UPDATE SET
        ecid = EXCLUDED.ecid;
      `;
      await pool.query(pokemonSpecieQuery);
      const pokemonQuery = `
        INSERT INTO Pokemon(pid, sid) VALUES
        ('${pid}', '${sid}')
        ON CONFLICT (pid) DO UPDATE SET
        sid = EXCLUDED.sid;
      `;
      await pool.query(pokemonQuery);

      await pool.query(pokemonQuery);
      console.log(`Pokemon ${pid} inserted successfully.`);

    }
  }
  catch (err) {
    console.error('Error updateing pokemon:', err);
    throw err;
  }
}

async function main() {
  const pool = new pg.Pool(pgconfig);

  // await updateLanguages(pool);
  // await updateTypes(pool);
  await updatePokemon(pool);


  await pool.end();
}

main().catch((err) => console.error(err));
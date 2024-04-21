'use client'

import { fetchPokemonName } from '@/lib/data';
import PokemonUI from './pokemonUI';
import PokemonButton from './changePokemon';
import SelectPokemon from './selectPokemon';
import { useState, useEffect } from 'react';
import useLocalStorage from "@/lib/local";

export default function Pokemon({id} : {
  id:string;
}) {

  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [language, setLanguage] = useLocalStorage<string>('language', 'zh-Hans');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPokemonName(id, language).then((name) => {
      setName(name);
      setLoaded(true);
    });
    return () => {
      setLoaded(false);
    }
  }, [id, refresh, language])
  
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
          <PokemonUI id={id} name={name} refresh={refresh} pkLoaded={loaded}/>
          <div className='flex pt-4'>
            <PokemonButton id={(Number(id)-1).toString()} sKey='KeyZ'>
              &lt;</PokemonButton>
            <SelectPokemon id={id} className='mx-2' sKey='KeyX' setRefresh={setRefresh}/>
            <PokemonButton id={(Number(id)+1).toString()} sKey='KeyC'>
              &gt;</PokemonButton>
          </div>
        </div>
      </>
    );
}
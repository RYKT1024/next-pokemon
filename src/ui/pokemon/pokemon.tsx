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
  const [language, setLanguage] = useLocalStorage<string>('language', 'zh-Hans');

  useEffect(() => {
    fetchPokemonName(id, language).then((name) => {
      setName(name);
    });
  }, [id, language])
  
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
          <PokemonUI id={id} name={name}/>
          <div className='flex pt-4'>
            <PokemonButton id={(Number(id)-1).toString()} sKey='KeyZ'>
              &lt;</PokemonButton>
            <SelectPokemon id={id} className='mx-2' sKey='KeyX'/>
            <PokemonButton id={(Number(id)+1).toString()} sKey='KeyC'>
              &gt;</PokemonButton>
          </div>
        </div>
      </>
    );
}
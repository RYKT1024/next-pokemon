'use client'

import { fetchPokemonName, fetchPokemonImage } from '@/lib/data';
import PokemonUI from './pokemonUI';
import PokemonButton from './changePokemon';
import SelectPokemon from './selectPokemon';
import { useState, useEffect } from 'react';
import useLocalStorage from "@/lib/local";

export default function Pokemon({id} : {
  id:string;
}) {

  const [img, setImg] = useState('');
  const [name, setName] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [language, setLanguage] = useLocalStorage<string>('language', 'zh-Hans');

  useEffect(() => {
    Promise.all([
      fetchPokemonImage(id, 'front_default'),
      fetchPokemonName(id, language)
    ]).then(([img, name]) => {
      setImg(img);
      setName(name);
    })
  }, [id, refresh, language])
  
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
          <PokemonUI id={id} img={img} name={name} refresh={refresh}/>
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
'use client'

import BlackWhiteImg from "@/ui/common/blackWhiteImg"
import { fetchPokemonFounded, fetchPokemonImage } from "@/lib/data"
import { useState, useEffect } from "react"
import { useLocalShowPokemon, useLocalShowPokemonKey } from "@/lib/local"
import { useGlobalContext } from "@/lib/context"

import Image from 'next/image'

export default function PokemonUI({id, name, className}: {
  id:string, name: string, className?: string
}) {
  const [img, setImg] = useState('') 
  const [showPokemon, setShowPokemon] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [localShowPokemonKey,] = useLocalShowPokemonKey()
  
  const refresh = useGlobalContext().globals.refresh;
  const [localShowPokemon, ] = useLocalShowPokemon([refresh])

  useEffect(() => {
    Promise.all([fetchPokemonFounded(1, id), fetchPokemonImage(id, 'front_default')]).then(([foundedRes, imgRes]) => {
      setShowPokemon(foundedRes>0 && localShowPokemon);
      setImg(imgRes);
      setLoaded(true);
    })
    return () => {
      setLoaded(false);
    };
  }, [id, refresh, localShowPokemon]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if(event.code === localShowPokemonKey) {
        setShowPokemon(prevShowPokemon => !prevShowPokemon);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [localShowPokemonKey])
  
  return (
    <div className={`${className} w-80 h-full rounded-3xl shadow-2xl bg-white flex flex-col items-center`}>
      <div className='h-80 mt-6 mb-4 flex flex-col items-center text-center'>
        {
          loaded ?
            !showPokemon ? (
              <>
                <p className='h-16 mt-4 text-3xl font-bold text-gray-800'>*未发现*</p> 
                <BlackWhiteImg className='w-64 h-64 select-none'
                              width={256} height={256}
                              src={img} alt='未发现的宝可梦' />
              </>
              ) : (
              <>
                <p className='h-16 mt-4 text-3xl font-bold text-gray-800'>{name}</p> 
                <Image  className='w-64 h-64 select-none'
                        width={256} height={256}
                        src={img} alt={name} 
                        draggable='false' />
              </>
            )
          : (
            <></>
          )
        }
      </div>
    </div>
  )
}

  
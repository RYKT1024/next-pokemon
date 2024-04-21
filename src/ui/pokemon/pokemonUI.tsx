'use client'

import BlackWhiteImg from "@/ui/common/blackWhiteImg"
import { fetchPokemonFounded } from "@/lib/data"
import { useState, useEffect } from "react"
import useLocalStorage from "@/lib/local"

import Image from 'next/image'

export default function PokemonUI({id, img, name, refresh, className}: {
  id:string, img: string, name: string, refresh: boolean ,className?: string
}) {
  const [showPokemon, setShowPokemon] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [localShowPokemonKey,] = useLocalStorage<string>("showPokemonKey", "KeyP")
  const [localShowPokemon,] = useLocalStorage<boolean>("showPokemon", true)

  useEffect(() => {
    if (img)
    fetchPokemonFounded(1, id).then(res => {
      setShowPokemon(res>0 && localShowPokemon);
      setLoaded(true);
    })
    // 处理键盘按键事件
    const handleKeyPress = (event: KeyboardEvent) => {
      if(event.code === localShowPokemonKey) {
        setShowPokemon(prevShowPokemon => !prevShowPokemon);
      }
    };
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [id, img, refresh, localShowPokemonKey, localShowPokemon]);
  
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

  
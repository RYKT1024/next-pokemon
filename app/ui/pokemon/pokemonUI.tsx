'use client'

import BlackWhiteImg from "../common/blackWhiteImg"
import { fetchPokemonFounded } from "@/app/lib/data"
import { useState, useEffect } from "react"
import useLocalStorage from "@/app/lib/local"

import Image from 'next/image'
import PokemonButton from "./changePokemon"
import SelectPokemon from "./selectPokemon"

export default function PokemonUI({id, img, name, className}: {
  id:string, img: string, name: string, className?: string
}) {
  const [showPokemon, setShowPokemon] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [localShowPokemonKey,] = useLocalStorage("showPokemonKey", "KeyP")
  const [localShowPokemon,] = useLocalStorage("showPokemon", true)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
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
  }, [id, refresh, localShowPokemonKey, localShowPokemon]);
  
  return (
    <>
      <div className={`${className} w-80 h-full rounded-3xl shadow-2xl bg-white flex flex-col items-center`}>
        <div className='h-80 mt-6 mb-4 flex flex-col items-center text-center'>
          {
          loaded ?
            !showPokemon ? (
            <>
              <p className='h-16 mt-4 z-10 text-3xl font-bold text-gray-800'>*未发现*</p> 
              <BlackWhiteImg className='w-64 h-64'
                            width={256} height={256}
                            src={img} alt='未发现的宝可梦' />
            </>
            ) : (
            <>
              <p className='h-16 mt-4 z-10 text-3xl font-bold text-gray-800'>{name}</p> 
              <Image  className='w-64 h-64'
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
      <div className='flex pt-4'>
        <PokemonButton id={(Number(id)-1).toString()} sKey='KeyZ'>
          &lt;</PokemonButton>
        <SelectPokemon id={id} className='mx-2' sKey='KeyX' refresh={setRefresh}/>
        <PokemonButton id={(Number(id)+1).toString()} sKey='KeyC'>
          &gt;</PokemonButton>
      </div>
    </>
    
  )
}

  
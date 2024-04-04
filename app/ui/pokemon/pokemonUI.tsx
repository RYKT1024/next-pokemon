'use client'

import BlackWhiteImg from "../common/blackWhiteImg"
import { checkFounded } from "@/app/lib/action"
import { useState, useEffect } from "react"

import Image from 'next/image'

export default function PokemonUI({img, name, className}: {
  img: string, name: string, className?: string
}) {
  const isNotFound = (notFounded: boolean) => {
    return notFounded ? (
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
  }
  const [notFounded, setNotFounded] = useState(true)

  // 处理键盘按键事件
  const handleKeyPress = (event: KeyboardEvent) => {
    if(event.code === 'KeyP') {
      setNotFounded(prevNotFounded => !prevNotFounded);
    }
  };

  useEffect(() => {
    // checkFounded().then(res => (
    //   setNotFounded(res)
    // )
    // )
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [])
  
  return (
    <div className={`${className} w-80 h-full rounded-3xl shadow-2xl bg-white flex flex-col items-center`}>
      <div className='h-80 mt-6 mb-4 flex flex-col items-center text-center'>
        {isNotFound(notFounded)}
      </div>
  </div>
  )
}

  
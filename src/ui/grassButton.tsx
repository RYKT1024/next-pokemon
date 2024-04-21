'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/lib/context";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/lib/local";

export default function GrassButton({className}: {
  className?: string
}) {
  const router = useRouter()
  let randomPid: number;
  const [pid, setPid] = useState<number>(0)
  // 断言 useContext(GlobalContext) 非空
  const globals = useGlobalContext().globals;
  const [sKey, ] = useLocalStorage('grassButtonKey', 'KeyQ');
  const pids = globals.pokemonIds;

  const getRandomPid = () => {
    randomPid = pids[Math.floor(Math.random() * pids.length)];
    setPid(randomPid);
  }
  
  const updatePokemon = () => {
    router.push(`/play?id=${pid}`)
    getRandomPid()
    router.prefetch(`/play?id=${pid}`)
  }

  useEffect(() => {
    // 处理键盘按键事件
    const handleKeyPress = (event: KeyboardEvent) => {
      if(sKey !== undefined && event.code === sKey) {
        event.preventDefault();
        router.push(`/play?id=${randomPid}`)
        getRandomPid()
        router.prefetch(`/play?id=${randomPid}`)
      }
    };

    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      console.log('bye')
    };
  }, [])

  useEffect(() => {
    getRandomPid()
    router.prefetch(`/play?id=${pid}`)
  }, [pids])

  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={updatePokemon}>
      <Image src="/grass.png" alt="found pokemon"
                    width={56} height={56} />
      <p className="select-none text-green-700 text-xl mx-1 pt-1 font-semibold">探索草丛！</p>
    </div>
  )
}
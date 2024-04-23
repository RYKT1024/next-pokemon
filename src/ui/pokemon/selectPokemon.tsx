'use client'

import { addPokemon } from "@/lib/action";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/lib/context";

export default function SelectPokemon({id, className, sKey}: {
  id:string, className?:string, sKey?:string
}){
  const context = useGlobalContext();
  const refresh = context.globals.refresh;
  const setRefresh = () => context.changeGlobals('refresh', !refresh);
  const router = useRouter();
  const onClickHandler = () => {
    addPokemon(1, id).then(() => 
      // location.reload()
    setRefresh()
    )
  }

  useEffect(() => {
    // 处理键盘按键事件
    const handleKeyPress = (event: KeyboardEvent) => {
      if(sKey && event.code === sKey) {
        event.preventDefault();
        addPokemon(1, id).then(() => location.reload())
      }
    };
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [sKey, id])
  return (
    <button className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${className}`}
                    onClick={onClickHandler}>选择</button>
  )
}
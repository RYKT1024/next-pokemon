'use client'

import { addPokemon } from "../../lib/action";
import { useEffect } from "react";

export default function selectPokemon({id, className, sKey}: {
  id:string, className?:string, sKey?:string
}){
  const onClickHandler = () => {
    addPokemon('0001', id)
  }
  // 处理键盘按键事件
  const handleKeyPress = (event: KeyboardEvent) => {
    if(sKey && event.code === sKey) {
      onClickHandler()
    }
  };

  useEffect(() => {
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [])
  return (
    <button className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${className}`}
                    onClick={onClickHandler}>选择</button>
  )
}
'use client'

import { useEffect } from "react"
import { selectPokemonPage } from "../../lib/action"

export default function PokemonButton({ id, children, sKey }: {
  id: string, children: React.ReactNode, sKey?: string
}) {
  const onClickHandler = () => {
    selectPokemonPage(id)
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
    }
  },[])
  return (
    <button className="bg-blue-500 hover:bg-blue-600 hover:text-gray-100 text-white font-bold py-2 px-4 rounded"
            onClick={onClickHandler}
          >{children}</button>
  )
}
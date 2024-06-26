'use client'

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGlobalContext } from "@/lib/context"

export default function PokemonButton({ id, children, sKey }: {
  id: string, children: React.ReactNode, sKey?: string
}) {
  const router = useRouter() 
  const numId = Number(id)
  const pokemonIds = useGlobalContext().globals.pokemonIds

  useEffect(() => {
    // 处理键盘按键事件
    const handleKeyPress = (event: KeyboardEvent) => {
      if(sKey && event.code === sKey) {
        event.preventDefault();
        router.push(`/pokemon/${id}`)
      }
    };
    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyPress);

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  },[sKey, id, router])

  return (pokemonIds.includes(numId)) ?
  (
    <Link   className="bg-blue-500 hover:bg-blue-600 hover:text-gray-100 text-white font-bold py-2 px-4 rounded"
            href={`/play?id=${id}`}
            draggable='false'
      >{children}</Link>
  ) : (
    <span   className="bg-gray-500 text-white font-bold py-2 px-4 rounded cursor-not-allowed select-none"
      >{children}</span>
  )
}
'use client'
import { addPokemon } from "../../lib/action";

export default function selectPokemon({id, className}: {
  id:string, className?:string
}){
  return (
    <button className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${className}`}
                    onClick={() => {
                      addPokemon('0001', id)
                    }}>选择</button>
  )
}
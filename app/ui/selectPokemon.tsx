'use client'
import { addPokemon } from "../lib/action";

export default function selectPokemon({id}: {id:string}){
  return (
    <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      addPokemon('0001', id)
                    }}>选</button>
  )
}
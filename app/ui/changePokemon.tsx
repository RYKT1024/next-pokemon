'use client'

import React from "react"
import { selectPokemonPage } from "../lib/action"

export default function PokemonButton({ id, children}: { id: string, children: React.ReactNode}) {
  return (
    <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {selectPokemonPage(id)}}
          >{children}</button>
  )
}
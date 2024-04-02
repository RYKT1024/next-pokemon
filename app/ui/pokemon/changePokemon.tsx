'use client'

import React from "react"
import { selectPokemonPage } from "../../lib/action"

export default function PokemonButton({ id, children}: {
  id: string, children: React.ReactNode
}) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 hover:text-gray-100 text-white font-bold py-2 px-4 rounded"
            onClick={() => {selectPokemonPage(id)}}
          >{children}</button>
  )
}
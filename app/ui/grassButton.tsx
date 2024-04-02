'use client'

import { selectPokemonPage } from "../lib/action";
import Image from "next/image";

export default function GrassButton({className}: {
  className?: string
}) {
  const randomRedirect = () => {
    selectPokemonPage((Math.floor(Math.random() * 1025) + 1).toString());
  }

  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={randomRedirect}>
      <Image src="/grass.png" alt="found pokemon"
                    width={56} height={56} />
      <p className="select-none text-green-700 text-xl mx-1 pt-1 font-semibold">探索草丛！</p>
    </div>
  )
}
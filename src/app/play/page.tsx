'use client'

import Pokemon from "@/ui/pokemon/pokemon";
import Pokebag from "@/ui/pokebag/pokebag";
import GrassButton from "@/ui/grassButton";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPokemonIds } from "@/lib/data";
import { LocalGlobals } from "@/lib/types";

import GlobalContext from "@/lib/context";

function PokemonComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  const numId = parseInt(id!);

  const [globals, setGlobals] = useState<LocalGlobals>({
    loginStatus: 0,
    refresh:false,
    pokemonIds: [],
  });
  const changeGlobals = useCallback((key:string, value:any) => {
    setGlobals((prev) => ({...prev, [key]: value}));
  }, [])
  const value = useMemo(() => ({ globals, changeGlobals }), [globals]);

  useEffect(() => {
    fetchPokemonIds().then((ids) => {
      changeGlobals("pokemonIds", ids);
    });
  },[])

  useEffect(() => {
    fetchPokemonIds().then((ids) => {
      if (!ids.includes(numId)) {
        console.log("Invalid ID");
        router.replace("/");
      }
    });
  }, [numId, router])

  return (
    <GlobalContext.Provider value={value}>
      <p className="text-3xl font-bold pt-4 pl-4 select-none">{"Pokémon #" + id}</p>
      <GrassButton className="absolute pt-4 pl-4"/>
      <Pokemon id={id}/>
      <Pokebag />
    </GlobalContext.Provider>
  )
}

export default function Page() {
  return (
    <>
      <div className="relative h-screen">
        <Suspense>
          <PokemonComponent />
        </Suspense>
        <div className="fixed inset-x-0 bottom-0 items-center flex pb-2 pt-2 bg-gray-100">
          <p className="text-xl pl-4 select-none font-medium">Pokémon Play @RYKT.SITE</p>
          <div className="ml-auto pr-2">
            <button className="bg-blue-600 hover:bg-blue-700 hover:text-gray-100 text-white font-bold py-1 px-3 rounded">
              联系我们</button>
          </div>
        </div>
      </div>
    </>
  )
}
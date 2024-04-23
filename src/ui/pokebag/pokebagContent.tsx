'use client'

import { useEffect, useState } from "react"
import { TrainerDataType } from "@/lib/types"
import { fetchTrainerData } from "@/lib/data";
import { useGlobalContext } from "@/lib/context";
import { useLocalShowPokemon } from "@/lib/local";

export default function PokebagContent() {
  const [trainerInfo, setTrainerInfo] = useState<TrainerDataType | null>(null);
  const context = useGlobalContext();
  const refresh = context.globals.refresh;
  const setRefresh = () => context.changeGlobals('refresh', !refresh);
  const [localShowPokemon, setLocalShowPokemon] = useLocalShowPokemon();

  useEffect(() => {
    const tid = 1;
    fetchTrainerData(tid).then((data) => {
      setTrainerInfo(data);
    });
  }, []);

  return (
    <div>
      {trainerInfo ? (
        <div>
          <p>showPokemon:{(localShowPokemon).toString()}</p>
          <button onClick={() => {
            setLocalShowPokemon(!localShowPokemon);
            setRefresh();
          }}>change</button>
          <p>训练师信息:</p>
          <p>{JSON.stringify(trainerInfo)}</p>
        </div>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  )
}
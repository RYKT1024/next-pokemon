'use client'

import { useEffect, useState } from "react"
import { TrainerDataType } from "@/lib/types"
import { fetchTrainerData } from "@/lib/data";

export default function PokebagContent({config}: {config: any}) {
  const [trainerInfo, setTrainerInfo] = useState<TrainerDataType | null>(null);

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
          <p>showPokemon:{(config.localShowPokemon).toString()}</p>
          <button onClick={() => {
            config.setLocalShowPokemon(!config.localShowPokemon);
            location.reload();
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
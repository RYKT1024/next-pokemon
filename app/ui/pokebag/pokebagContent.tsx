'use client'

import { getTrainerInfo } from "@/app/lib/action"
import { useEffect, useState } from "react"
import { TrainerInfo } from "@/app/lib/types"

export default function PokebagContent() {
  const [trainerInfo, setTrainerInfo] = useState<null | TrainerInfo>(null);

  useEffect(() => {
    const uid = "0001";
    getTrainerInfo(uid).then(info => {
      console.log(info);
      setTrainerInfo(info);
    });
  }, []);

  return (
    <div>
      {trainerInfo ? (
        <div>
          <p>训练师信息:</p>
          <p>{JSON.stringify(trainerInfo)}</p>
        </div>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  )
}
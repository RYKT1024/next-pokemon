import Image from "next/image";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/lib/context";
import { useRouter } from "next/navigation";
import { useLocalGrassButtonKey } from "@/lib/local";

export default function GrassButton({className}: {
  className?: string
}) {
  const router = useRouter();
  const [pid, setPid] = useState<number>(0);
  const globals = useGlobalContext().globals;
  const [sKey, ] = useLocalGrassButtonKey();
  const pids = globals.pokemonIds;

  const getRandomPid = () => {
    const newRandomPid = pids[Math.floor(Math.random() * pids.length)];
    setPid(newRandomPid);
  };
  
  useEffect(() => {
    getRandomPid(); // 获取初始 randomPid
    router.prefetch(`/play?id=${pid}`); // 预取初始 PID
  }, [pids]); // 依赖于 pids 列表

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (sKey !== undefined && event.code === sKey) {
        event.preventDefault();
        getRandomPid(); // 更新 PID
        router.push(`/play?id=${pid}`);
        router.prefetch(`/play?id=${pid}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [sKey, pid, router]); // 添加 PID 为依赖项

  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={() => {
      getRandomPid(); // 点击时获取新的 PID
      router.push(`/play?id=${pid}`);
      router.prefetch(`/play?id=${pid}`);
    }}>
      <Image src="/grass.png" alt="found pokemon"
                    width={56} height={56} />
      <p className="select-none text-green-700 text-xl mx-1 pt-1 font-semibold">探索草丛！</p>
    </div>
  );
}

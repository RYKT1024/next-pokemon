'use client'

import ImgButton from "../common/imgButton";
import PokebagWindow from "./pokebagWindow";
import PokebagContent from "./pokebagContent";
import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "@/app/lib/local";

export default function Pokebag() {
  const [isWindowVisible, setWindowVisible] = useState(false);
  const [localShowPokemon, setLocalShowPokemon] = useLocalStorage("showPokemon", true)
  
  const config = {localShowPokemon, setLocalShowPokemon}

  // 使用useCallback来包裹toggleWindow函数
  const toggleWindow = useCallback(() => {
    setWindowVisible(prevState => !prevState);
  }, []); // 依赖项数组为空，因为这个函数不依赖于任何外部变量

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b') {
        toggleWindow();
      }
    };

    // 添加键盘事件监听器
    window.addEventListener('keydown', handleKeyDown);

    // 组件卸载时移除监听器
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWindowVisible, toggleWindow]); // 依赖项数组中包含isWindowVisible以确保状态正确更新


  return (
    <div>
      <ImgButton src='/pokebag.png' alt='打开宝可梦背包' onClick={toggleWindow}
                 width={56} height={56}
                 className="fixed top-5 right-5" buttonClassName="w-14 h-14"/>
      <PokebagWindow isVisible={isWindowVisible} onClose={toggleWindow}>
        <PokebagContent config={config}/>
      </PokebagWindow>
    </div>
  );
}
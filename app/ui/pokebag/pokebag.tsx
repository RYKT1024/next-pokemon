'use client'

import ImgButton from "../imgButton";
import PokebagWindow from "./pokebagWindow";
import PokebagContent from "./pokebagContent";
import { useState, useEffect } from "react";

export default function Pokebag() {
  const [isWindowVisible, setWindowVisible] = useState(false);

  const toggleWindow = () => setWindowVisible(!isWindowVisible);

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
  }, [isWindowVisible]); // 依赖项数组中包含isWindowVisible以确保状态正确更新


  return (
    <div>
      <ImgButton src='/pokebag.png' alt='打开宝可梦背包' onClick={toggleWindow}
                 className="fixed top-5 right-5" buttonClassName="w-14 h-14"/>
      <PokebagWindow isVisible={isWindowVisible} onClose={toggleWindow}>
        <PokebagContent />
      </PokebagWindow>
    </div>
  );
}
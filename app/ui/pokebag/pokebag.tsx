'use client'

import PokebagButton from "./pokebagButton";
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
      <PokebagButton onClick={toggleWindow} />
      <PokebagWindow isVisible={isWindowVisible} onClose={toggleWindow}>
        <PokebagContent />
      </PokebagWindow>
    </div>
  );
}
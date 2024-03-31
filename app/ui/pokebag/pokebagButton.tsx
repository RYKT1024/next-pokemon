'use client'

interface ImageButtonProps {
  onClick: () => void; // 定义点击事件的类型
}

export default function PokebagButton({ onClick }: ImageButtonProps) {
  return (
    <button onClick={onClick} className="fixed top-5 right-5">
      <img src="/pokebag.png" alt="打开宝可梦背包" 
           className="w-14 h-14"/>
    </button>
  );
}
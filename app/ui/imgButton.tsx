'use client'

import Image from 'next/image';

interface ImageButtonProps {
  src: string; // 定义图片的路径
  alt: string; // 定义图片的描述
  width: number; // 定义图片的宽度
  height: number; // 定义图片的高度
  className?: string; // 定义按钮的样式
  buttonClassName?: string; // 定义按钮的样式
  onClick: () => void; // 定义点击事件的类型
}

export default function ImgButton({ src, alt, width, height, className, buttonClassName, onClick }: ImageButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      <Image src={src} alt={src} 
             width={width} height={height}
             className={buttonClassName}/>
    </button>
  );
}
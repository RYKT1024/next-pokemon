'use client'

interface ImageButtonProps {
  src: string; // 定义图片的路径
  alt: string; // 定义图片的描述
  className?: string; // 定义按钮的样式
  buttonClassName?: string; // 定义按钮的样式
  onClick: () => void; // 定义点击事件的类型
}

export default function ImgButton({ src, alt, className, buttonClassName, onClick }: ImageButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      <img src={src} alt={src} 
           className={buttonClassName}/>
    </button>
  );
}
import Image from "next/image";

export default function BlackWhiteImg({ src, className, width, height, alt }: {
  src: string;
  className?: string;
  width: number;
  height: number;
  alt: string;
}) {
  // 使用CSS样式实现视觉上的二值化效果
  const style = {
    filter: 'grayscale(100%) contrast(1000%) brightness(0%)',
  };

  return <Image 
              src={src} className={className} 
              width={width} height={height}
              style={style} alt="Visual binary effect" 
              draggable='false' />;
}

'use client'

import { useRef, useEffect } from 'react';

export default function PokebagWindow({ isVisible, onClose, children }:{
  isVisible: boolean; // 控制弹窗显示的状态
  onClose: () => void; // 关闭弹窗的方法
  children: React.ReactNode; // 弹窗内部的内容
}){
  const ref = useRef<HTMLDivElement>(null); // 指向这个弹窗组件

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div ref={ref} className="fixed right-5 top-5 w-96 h-144 bg-white border border-gray-200 shadow-lg rounded-xl overflow-auto">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">关闭</button>
      {children}
    </div>
  );
}
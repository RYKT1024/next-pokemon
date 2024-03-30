'use client';
import { revalidatePokemon } from "../lib/action";

export default function Revalidate({numStr}: {numStr: string}) {
  
  const handleClick = () => {
    const num = Number(numStr);
    revalidatePokemon(num);
  };

  return (
    <div>
      <button 
        onClick={handleClick}       
        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        重新验证
      </button>
    </div>
  );
}

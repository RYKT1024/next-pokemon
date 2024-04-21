'use client';
import { revalidatePokemon } from "../../lib/action";

export default function revalidateButton({numStr}: {
  numStr: string
}) {
  
  const handleClick = () => {
    const num = Number(numStr);
    revalidatePokemon(num);
  };

  return (
    <div>
      <button 
        onClick={handleClick}       
        className="bg-blue-600 hover:bg-blue-700 hover:text-gray-100 text-white font-bold py-1 px-3 rounded"
      >
        重新验证
      </button>
    </div>
  );
}

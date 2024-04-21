import Link from "next/link";

export default function Home() {
  return (
   <main>
      <p className="text-4xl font-bold my-4 ml-4">
      Pokémon RYKT
      </p>
      <Link   className="bg-blue-500 hover:bg-blue-600 hover:text-gray-100 text-white font-bold py-2 px-4 rounded ml-4"
            href={`/play`}
      >前往宝可梦</Link>
   </main> 
  );
}

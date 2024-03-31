import Revalidate from "@/app/ui/revalidate";
import PokemonInfo from "@/app/ui/pokemonInfo";
import Pokebag from "@/app/ui/pokebag/pokebag";

export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, index) => ({
    id: `${1 + index}`
  }));
}

export default function Pokemon({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <>
      <div className="relative h-screen">
        <p className="text-3xl font-bold pt-4 pl-4">{"Pokémon #" + id}</p>
        <PokemonInfo id={id}/>
        <div className="fixed inset-x-0 bottom-0 items-center flex pb-2 pt-2 bg-gray-50">
          <p className="text-2xl pl-4">{"Generate at "+ new Date().toString()}</p>
          <div className="ml-auto pr-2">
            <Revalidate numStr={id}/>
          </div>
        </div>
        
      </div>
      <Pokebag />
    </>
  )
}
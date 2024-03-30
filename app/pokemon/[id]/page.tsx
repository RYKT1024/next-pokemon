import Revalidate from "@/app/ui/revalidate";
import PokemonInfo from "@/app/ui/pokemonInfo";

export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, index) => ({
    id: `${1 + index}`
  }));
}

export default function Pokemon({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="relative h-screen">
      <p className="text-3xl">{"param id:" + id}</p>
      <PokemonInfo id={id}/>
      <div className="absolute inset-x-0 bottom-0 flex">
        <p className="text-2xl">{"Generate at "+ new Date().toString()}</p>
        <Revalidate numStr={id}/>
      </div>
      
    </div>
  )
}
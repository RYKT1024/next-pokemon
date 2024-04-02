import RevalidateButton from "@/app/ui/revalidateButton";
import Pokemon from "@/app/ui/pokemon/pokemon";
import Pokebag from "@/app/ui/pokebag/pokebag";
import GrassButton from "@/app/ui/grassButton";

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `${1 + index}`
  }));
}

export default function Page({ params }: {
  params: { id: string } 
}) {
  const { id } = params;
  return (
    <>
      <div className="relative h-screen">
        <p className="text-3xl font-bold pt-4 pl-4 select-none">{"Pokémon #" + id}</p>
        <GrassButton className="absolute pt-4 pl-4"/>
        <Pokemon id={id}/>
        <div className="fixed inset-x-0 bottom-0 items-center flex pb-2 pt-2 bg-gray-50">
          <p className="text-xl pl-4 select-none">{"Generate at "+ new Date().toString()}</p>
          <div className="ml-auto pr-2">
            <RevalidateButton numStr={id}/>
          </div>
        </div>
        
      </div>
      <Pokebag />
    </>
  )
}
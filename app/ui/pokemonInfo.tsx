import PokemonButton from './changePokemon';
import SelectPokemon from './selectPokemon';
import { getPokemonImg, getPokemonName } from '../lib/action';

export default async function PokemonInfo({id} : {id:string}) {

  const [img, name] = await Promise.all([
    getPokemonImg(id),
    getPokemonName(id)
  ]);
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
            <div className=' w-80 h-full rounded-3xl shadow-xl bg-white flex flex-col items-center'>
                <div className='h-80 mt-6 mb-4 flex flex-col items-center text-center'>
                  <p className='h-16 mt-4 z-10 text-3xl font-bold text-gray-800'>{name}</p> 
                  <img    className='w-64 h-64'
                          src={img} 
                          alt={name} />
                </div>
            </div>
            <div className='flex pt-4'>
              <PokemonButton id={(Number(id)-1).toString()}>&lt;</PokemonButton>
              <SelectPokemon id={id} className='mx-2'/>
              <PokemonButton id={(Number(id)+1).toString()}>&gt;</PokemonButton>
            </div>
        </div>
      </>
    );
}
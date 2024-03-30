import axios from 'axios'
import PokemonButton from './changePokemon';
import SelectPokemon from './selectPokemon';

export default async function PokemonInfo({id} : {id:string}) {
  interface PokemonData {
    name: string;
    sprites: {
        front_default: string;
    }
  }
  const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const pokemon = res.data;

    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
            <div className=' w-72 h-full rounded-3xl shadow-lg bg-white flex flex-col items-center'>
                <div className='h-80 mt-2 flex flex-col items-center text-center'>
                  <h1 className='h-16 z-10'>{pokemon.name}</h1> 
                  <img    className='w-64 h-64'
                          src={pokemon.sprites.front_default} alt={pokemon.name} />
                </div>
            </div>
            <div className='flex pt-4'>
              <PokemonButton id={(Number(id)-1).toString()}>&lt;</PokemonButton>
              <SelectPokemon id={id} />
              <PokemonButton id={(Number(id)+1).toString()}>&gt;</PokemonButton>
            </div>
        </div>
      </>
    );
}
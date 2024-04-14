import { fetchPokemonName, fetchPokemonImage } from '@/app/lib/data';
import PokemonUI from './pokemonUI';

export default async function Pokemon({id} : {
  id:string;
}) {

  const [img, name] = await Promise.all([
    fetchPokemonImage(id, 'front_default'),
    fetchPokemonName(id, 'zh-Hans')
  ]);
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
            <PokemonUI id={id} img={img} name={name}/>
        </div>
      </>
    );
}
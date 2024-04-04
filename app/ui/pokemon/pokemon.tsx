import PokemonButton from './changePokemon';
import SelectPokemon from './selectPokemon';
import { getPokemonImg, getPokemonName } from '../../lib/action';
import PokemonUI from './pokemonUI';

export default async function Pokemon({id} : {
  id:string;
}) {

  const [img, name] = await Promise.all([
    getPokemonImg(id),
    getPokemonName(id)
  ]);
    return (
      <>
        <div className='pt-12 flex flex-col items-center'>
            <PokemonUI img={img} name={name}/>
            <div className='flex pt-4'>
              <PokemonButton id={(Number(id)-1).toString()} sKey='KeyZ'>
                &lt;</PokemonButton>
              <SelectPokemon id={id} className='mx-2' sKey='KeyX'/>
              <PokemonButton id={(Number(id)+1).toString()} sKey='KeyC'>
                &gt;</PokemonButton>
            </div>
        </div>
      </>
    );
}
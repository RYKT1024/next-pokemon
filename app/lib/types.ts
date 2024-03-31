export interface TrainerInfo {
  uid: string;
  name: string;
  pokemons?: Array<{
    name: string | undefined;
  }>
}

export interface TrainerInfoHash {
  name: string;
  pokemonsKey: string; 
}
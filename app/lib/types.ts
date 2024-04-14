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

export interface TrainerDataType {
  tid: number,
  name: string,
  userid: string,
  email: string,
  pokemons: Array<{
    pid: number,
    amount: number,
  }>,
}
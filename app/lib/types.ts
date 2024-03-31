export interface TrainerInfo {
  uid: string;
  name: string;
  pokemons?: Array<{
    name: string | undefined;
  }>
}

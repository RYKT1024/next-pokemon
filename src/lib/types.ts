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

export interface LocalGlobals {
  // 0: 未登录
  // 1: 已登录
  // 2: 登录失败
  loginStatus: number,
  loginInfo?: {
    tid: number,
    name: string,
    userid: string
  },
  pokemonIds: Array<number>,
  refresh: boolean,
}
import { createContext, useContext } from "react";
import { LocalGlobals } from "@/lib/types";

interface GlobalContextType {
  globals: LocalGlobals,
  changeGlobals: (key:string, value:any) => void
};

const defaultValue: GlobalContextType = {
  globals: {
    loginStatus: 0,
    refresh: false,
    pokemonIds: [],
  },
  changeGlobals: (key:string, value:any) => {} 
};

const GlobalContext = createContext<GlobalContextType>(defaultValue);

export const useGlobalContext = () => useContext(GlobalContext);
export default GlobalContext;
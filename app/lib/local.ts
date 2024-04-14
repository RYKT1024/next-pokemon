// LocalStorage 封装
import { useState } from "react";

// 定义键的类型，确保在使用setKey时类型安全
type KeyAction = 'selectPokemonKey' | 'changePokemonLeftKey' | 'changePokemonRightKey' 
                | 'grassButtonKey' | 'openBagKey' | 'showPokemonKey'
                | 'showPokemon';

function useLocalStorage(key:KeyAction, initialValue:any) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value:any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;

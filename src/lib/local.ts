// localStorage 封装
import { useState } from "react";

type KeyAction = 'selectPokemonKey' | 'changePokemonLeftKey' | 'changePokemonRightKey' 
                | 'grassButtonKey' | 'openBagKey' | 'showPokemonKey'
                | 'showPokemon' | 'language';

// 使用泛型T来指定存储和返回值的类型
function useLocalStorage<T>(key: KeyAction, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) as T : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
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

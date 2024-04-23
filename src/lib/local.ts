// localStorage 封装
import { useState, useEffect } from "react";

type KeyAction = 'selectPokemonKey' | 'changePokemonLeftKey' | 'changePokemonRightKey' 
                | 'grassButtonKey' | 'openBagKey' | 'showPokemonKey'
                | 'showPokemon' | 'language';

// 使用泛型T来指定存储和返回值的类型
function useLocalStorage<T>(key: KeyAction, initialValue: T, dependencies: any[] = []): [T, (value: T | ((val: T) => T)) => void] {
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

  useEffect(() => {
    // 更新存储的值，以确保它与 localStorage 中的值同步
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) as T : initialValue);
    } catch (error) {
      console.log(error);
    }
  }, [key, initialValue, ...dependencies]);  // 注意将 dependencies 作为依赖项列表的一部分


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

export const useLocalShowPokemon = (dependencies: any[] = []) => useLocalStorage<boolean>("showPokemon", true, dependencies);
export const useLocalLanguage = (dependencies: any[] = []) => useLocalStorage<string>("language", "en", dependencies);
export const useLocalSelectPokemonKey = (dependencies: any[] = []) => useLocalStorage<string>("selectPokemonKey", "KeyX", dependencies);
export const useLocalShowPokemonKey = (dependencies: any[] = []) => useLocalStorage<string>("showPokemonKey", "KeyP", dependencies);
export const useLocalGrassButtonKey = (dependencies: any[] = []) => useLocalStorage<string>("grassButtonKey", "KeyQ", dependencies);
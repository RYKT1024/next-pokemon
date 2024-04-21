import { create } from 'zustand'

// 定义键的类型，确保在使用setKey时类型安全
type KeyAction = 'selectPokemon' | 'changePokemonLeft' | 'changePokemonRight' 
                | 'grassButton' | 'openBag' | 'showPokemon';

interface KeyStore {
  keys: Record<KeyAction, string>,
  setKey: (key: KeyAction, value: string) => void,
}


export const useKeyStore = create<KeyStore>((set) => ({
  keys: {
    selectPokemon: 'KeyX',
    changePokemonLeft: 'KeyZ',
    changePokemonRight: 'KeyC',
    grassButton: 'KeyQ',
    openBag: 'KeyB',
    showPokemon: 'KeyP',
  },
  setKey: (key, value) => {
    set((state) => ({
      keys: {
        ...state.keys,
        [key]: value // 这里确保更新的键值对是有效的
      }
    }));
  }
}));

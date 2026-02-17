import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import authReducer from './slices/authSlice';
import type { RootState } from './types';

const isServer = typeof window === 'undefined';

const createNoopStorage = () => {
  return {
    getItem: async (_key: string) => null,
    setItem: async (_key: string, value: string) => value,
    removeItem: async (_key: string) => undefined,
  };
};

const storage = isServer ? createNoopStorage() : AsyncStorage;

// Redux Persist configuration (AsyncStorage for React Native)
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__, // Use __DEV__ for React Native
});

export const persistor = isServer ? null : persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type { RootState };

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import your reducers here
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import settingsReducer from './slices/settingsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'] // only persist auth and settings
};

const persistedReducer = persistReducer(persistConfig, combineReducers({
  auth: authReducer,
  messages: messageReducer,
  settings: settingsReducer,
}));

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);
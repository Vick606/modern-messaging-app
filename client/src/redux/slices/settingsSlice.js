import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    darkMode: false,
    emailNotifications: true,
    soundNotifications: true,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleEmailNotifications: (state) => {
      state.emailNotifications = !state.emailNotifications;
    },
    toggleSoundNotifications: (state) => {
      state.soundNotifications = !state.soundNotifications;
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { toggleDarkMode, toggleEmailNotifications, toggleSoundNotifications, updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
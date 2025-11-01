import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issuesReducer from './slices/issuesSlice';
import projectsReducer from './slices/projectsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
    projects: projectsReducer,
  },
});


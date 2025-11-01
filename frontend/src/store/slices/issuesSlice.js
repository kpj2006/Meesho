import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { issuesAPI } from '../../services/api';

const initialState = {
  issues: [],
  currentIssue: null,
  loading: false,
  error: null,
};

export const getIssues = createAsyncThunk(
  'issues/getIssues',
  async (params, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.getIssues(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const getIssue = createAsyncThunk(
  'issues/getIssue',
  async (id, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.getIssue(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (data, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.createIssue(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.updateIssue(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

export const deleteIssue = createAsyncThunk(
  'issues/deleteIssue',
  async (id, { rejectWithValue }) => {
    try {
      await issuesAPI.deleteIssue(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete issue');
    }
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Issues
      .addCase(getIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(getIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Issue
      .addCase(getIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIssue = action.payload;
      })
      .addCase(getIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Issue
      .addCase(createIssue.fulfilled, (state, action) => {
        state.issues.unshift(action.payload);
      })
      // Update Issue
      .addCase(updateIssue.fulfilled, (state, action) => {
        state.issues = state.issues.map((issue) =>
          issue._id === action.payload._id ? action.payload : issue
        );
        if (state.currentIssue?._id === action.payload._id) {
          state.currentIssue = action.payload;
        }
      })
      // Delete Issue
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.issues = state.issues.filter((issue) => issue._id !== action.payload);
        if (state.currentIssue?._id === action.payload) {
          state.currentIssue = null;
        }
      });
  },
});

export const { clearError } = issuesSlice.actions;
export default issuesSlice.reducer;


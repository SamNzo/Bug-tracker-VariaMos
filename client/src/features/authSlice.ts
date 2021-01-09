import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import authService from '../services/auth';
import storage from '../utils/localStorage';
import { UserCredentials, UserState, ResetFields } from './types';
import { getErrorMsg } from '../utils/helperFuncs';

interface InitialState {
  user: UserState | null;
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    removeUser: (state) => {
      state.user = null;
    },
    setAuthLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  removeUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export const login = (
  credentials: UserCredentials,
  resetFields: ResetFields
): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setAuthLoading());
      const userData = await authService.login(credentials);
      dispatch(setUser(userData));
      storage.saveUser(userData);
      resetFields();
    } catch (e) {
      dispatch(setAuthError(getErrorMsg(e)));
    }
  };
};

export const signup = (
  credentials: UserCredentials,
  resetFields: ResetFields
): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setAuthLoading());
      const userData = await authService.signup(credentials);
      dispatch(setUser(userData));
      storage.saveUser(userData);
      resetFields();
    } catch (e) {
      dispatch(setAuthError(getErrorMsg(e)));
    }
  };
};

export const logout = (): AppThunk => {
  return (dispatch) => {
    dispatch(removeUser());
    storage.removeUser();
  };
};

export const selectAuthState = (state: RootState) => state.auth;

export default authSlice.reducer;

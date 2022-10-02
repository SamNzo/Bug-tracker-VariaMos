
import { RootState, AppThunk } from '../store';
import { notify } from './notificationSlice';
import { getErrorMsg } from '../../utils/helperFuncs';
import categoriesService from '../../services/categories';
import { CategoryState } from '../types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialCategoriesState {
    categories: CategoryState[],
    fetchLoading: boolean;
    fetchError: string | null;
  }
  
const initialState: InitialCategoriesState = {
    categories: [],
    fetchLoading: false,
    fetchError: null,
  };

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        setCategories: (state, action: PayloadAction<CategoryState[]>) => {
            state.categories = action.payload;
          },
        addCategory: (state, action: PayloadAction<CategoryState>) => {
            state.categories.push(action.payload);
          },
        removeCategory: (state, action: PayloadAction<string>) => {
            state.categories = state.categories.filter((c) => c.id !== action.payload);
          },
        setFetchCategoriesLoading: (state) => {
            state.fetchLoading = true;
            state.fetchError = null;
          },
        setFetchCategoriesError: (state, action: PayloadAction<string>) => {
            state.fetchLoading = false;
            state.fetchError = action.payload;
          },
          
    },
});

export const {
    setCategories,
    addCategory,
    removeCategory,
    setFetchCategoriesLoading,
    setFetchCategoriesError

} = categoriesSlice.actions;

export const fetchCategories = (): AppThunk => {
    return async (dispatch) => {
      try {
        dispatch(setFetchCategoriesLoading());
        const allCategories = await categoriesService.getCategories();
        dispatch(setCategories(allCategories));
      } catch (e) {
        alert(e)
        dispatch(setFetchCategoriesError(getErrorMsg(e)));
      }
    };
  };

export const createCategory = (categoryName: string): AppThunk => {
    return async (dispatch) => {
      try {
        const newCategory = await categoriesService.createCategory(categoryName);
        dispatch(addCategory(newCategory));
        dispatch(notify('New category created!', 'success'));
      } catch (e) {
        dispatch(notify(getErrorMsg(e), 'error'));
      }
    }
  }

export const deleteCategory = (categoryName: string): AppThunk => {
    return async (dispatch) => {
      try {
        const newCategory = await categoriesService.deleteCategory(categoryName);
        dispatch(removeCategory(newCategory.id));
        dispatch(notify('Category deleted!', 'success'));
      } catch (e) {
        dispatch(notify(getErrorMsg(e), 'error'));
      }
    }
  }

  export const selectCategoriesState = (state: RootState) => state.categories;

  export default categoriesSlice.reducer;

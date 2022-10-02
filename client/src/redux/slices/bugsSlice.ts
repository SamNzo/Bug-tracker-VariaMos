import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import bugService from '../../services/bugs';
import assignmentService from '../../services/assignment';
import noteService from '../../services/notes';
import {
  BugState,
  BugSortValues,
  BugPayload,
  EditedBugData,
  ClosedReopenedBugData,
  Note,
  BugFilterValues,
  AssignedAdmins,
  User,
} from '../types';
import { notify } from './notificationSlice';
import { History } from 'history';
import { getErrorMsg } from '../../utils/helperFuncs';
import userService from '../../services/users';
import categoriesService from '../../services/categories';

interface InitialBugState {
  bugs: BugState[];
  fetchLoading: boolean;
  fetchError: string | null;
  submitLoading: boolean;
  submitError: string | null;
  sortBy: BugSortValues;
  filterBy: BugFilterValues;
}

const initialState: InitialBugState = {
  bugs: [],
  fetchLoading: false,
  fetchError: null,
  submitLoading: false,
  submitError: null,
  sortBy: 'newest',
  filterBy: 'all',
};

const bugsSlice = createSlice({
  name: 'bugs',
  initialState,
  reducers: {
    setBugs: (
      state,
      action: PayloadAction<BugState[]>
    ) => {
      state.bugs = action.payload;
      state.fetchLoading = false;
      state.fetchError = null;
    },
    addBug: (
      state,
      action: PayloadAction<BugState>
    ) => {
      state.bugs.push(action.payload);
      state.submitLoading = false;
      state.submitError = null;
    },
    updateBug: (
      state,
      action: PayloadAction<{
        data: EditedBugData;
        bugId: string;
      }>
    ) => {
      state.bugs = state.bugs.map((b) => b.id === action.payload.bugId ? {...b, ...action.payload.data } : b
      );

      state.submitLoading = false;
      state.submitError = null;
    },
    removeBug: (
      state,
      action: PayloadAction<string>
    ) => {
      state.bugs = state.bugs.filter((b) => b.id !== action.payload);
    },
    updateBugStatus: (
      state,
      action: PayloadAction<{
        data: ClosedReopenedBugData;
        bugId: string;
      }>
    ) => {
      state.bugs = state.bugs.map((b) => b.id === action.payload.bugId ? {...b, ...action.payload.data } : b
      );
    },
    assignBug: (
        state,
        action: PayloadAction<{ assignments: AssignedAdmins[]; bugId: string }>
    ) => {
      state.bugs = state.bugs.map((b) =>
        b.id === action.payload.bugId
          ? { ...b, assignments: action.payload.assignments }
          : b
      );
      state.submitLoading = false;
      state.submitError = null;
    },
    addNote: (
      state,
      action: PayloadAction<{ note: Note; bugId: string }>
    ) => {
      state.bugs = state.bugs.map((b) =>
        b.id === action.payload.bugId
          ? { ...b, notes: [...b.notes, action.payload.note] }
          : b
      );
      state.submitLoading = false;
      state.submitError = null;
    },
    updateNote: (
      state,
      action: PayloadAction<{
        data: { body: string; updatedAt: Date };
        noteId: number;
        bugId: string;
      }>
    ) => {
      const bug = state.bugs.find(
        (b) => b.id === action.payload.bugId
      );

      if (bug) {
        const updatedNotes = bug.notes.map((n) =>
          n.id === action.payload.noteId ? { ...n, ...action.payload.data } : n
        );

        state.bugs = state.bugs.map((b) =>
          b.id === action.payload.bugId ? { ...b, notes: updatedNotes } : b
        );

        state.submitLoading = false;
        state.submitError = null;
      }
    },
    removeNote: (
      state,
      action: PayloadAction<{
        noteId: number;
        bugId: string;
      }>
    ) => {
      const bug = state.bugs.find(
        (b) => b.id === action.payload.bugId
      );

      if (bug) {
        const updatedNotes = bug.notes.filter(
          (n) => n.id !== action.payload.noteId
        );

        state.bugs = state.bugs.map((b) =>
          b.id === action.payload.bugId ? { ...b, notes: updatedNotes } : b
        );
      }
    },
    setFetchBugsLoading: (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
    },
    setFetchBugsError: (state, action: PayloadAction<string>) => {
      state.fetchLoading = false;
      state.fetchError = action.payload;
    },

    setSubmitBugLoading: (state) => {
      state.submitLoading = true;
      state.submitError = null;
    },
    setSubmitBugError: (state, action: PayloadAction<string>) => {
      state.submitLoading = false;
      state.submitError = action.payload;
    },
    clearSubmitBugError: (state) => {
      state.submitError = null;
    },
    sortBugsBy: (state, action: PayloadAction<BugSortValues>) => {
      state.sortBy = action.payload;
    },
    filterBugsBy: (state, action: PayloadAction<BugFilterValues>) => {
      state.filterBy = action.payload;
    },
  }
}
)

export const {
  setBugs,
  addBug,
  updateBug,
  removeBug,
  updateBugStatus,
  addNote,
  updateNote,
  removeNote,
  setFetchBugsLoading,
  setFetchBugsError,
  setSubmitBugLoading,
  setSubmitBugError,
  clearSubmitBugError,
  sortBugsBy,
  filterBugsBy,
  assignBug,
} = bugsSlice.actions;

export const fetchBugs = (): AppThunk => {
  return async (dispatch) => {
    try {
      
      dispatch(setFetchBugsLoading());
      
      const allBugs = await bugService.getBugs();
     
      dispatch(setBugs(allBugs));
    } catch (e) {
      alert(e)
      dispatch(setFetchBugsError(getErrorMsg(e)));
    }
  };
};

export const createNewBug = (
  bugData: BugPayload,
  form: FormData,
  bugCategory: string,
  closeDialog?: () => void,
): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setSubmitBugLoading());
      const newBug = await bugService.createBug(bugData, form, bugCategory);
      dispatch(addBug(newBug));
      dispatch(notify('New bug added!', 'success'));
      closeDialog && closeDialog();
    } catch (e) {
      dispatch(setSubmitBugError(getErrorMsg(e)));
    }
  };
};

export const editBug = (
  bugId: string,
  bugData: BugPayload,
  form: FormData,
  bugCategory: string,
  closeDialog?: () => void
): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setSubmitBugLoading());
      const updatedBug = await bugService.updateBug(bugId, bugData, form, bugCategory);
      const {
        title,
        description,
        priority,
        updatedAt,
        updatedBy,
        category
      } = updatedBug as EditedBugData;

      dispatch(
        updateBug({
          data: { title, description, priority, updatedAt, updatedBy, category },
          bugId,
        })
      );
      dispatch(notify('Successfully updated the bug!', 'success'));
      closeDialog && closeDialog();
    } catch (e: any) {
      dispatch(setSubmitBugError(getErrorMsg(e)));
    }
  };
};

export const deleteBug = (
  bugId: string,
  history: History
): AppThunk => {
  return async (dispatch) => {
    try {
      await bugService.deleteBug(bugId);
      history.push(`/`);
      dispatch(removeBug(bugId));
      dispatch(notify('Deleted the bug.', 'success'));
    } catch (e: any) {
      dispatch(notify(getErrorMsg(e), 'error'));
    }
  };
};

export const closeReopenBug = (
  bugId: string,
  action: 'close' | 'reopen'
): AppThunk => {
  return async (dispatch) => {
    try {
      let returnedData;
      if (action === 'close') {
        returnedData = await bugService.closeBug(bugId);
      } else {
        returnedData = await bugService.reopenBug(bugId);
      }
      const {
        isResolved,
        closedAt,
        closedBy,
        reopenedAt,
        reopenedBy,
      } = returnedData as ClosedReopenedBugData;
      dispatch(
        updateBugStatus({
          data: { isResolved, closedAt, closedBy, reopenedAt, reopenedBy },
          bugId,
        })
      );
      dispatch(
        notify(
          `${action === 'close' ? 'Closed' : 'Re-opened'} the bug!`,
          'success'
        )
      );
    } catch (e: any) {
      dispatch(notify(getErrorMsg(e), 'error'));
    }
  };
};

export const assignBugTo = (
  bugId: string,
  admins: string[],
  closeDialog?: () => void
) : AppThunk => {
  return async (dispatch) => {
    try {
      // return an array with the assignments and the number of new admins assigned
      const AssignmentArray = await assignmentService.assignBug(bugId, admins);
      const Assignments = AssignmentArray[0];
      // array of admins assigned to this bug
      const Admins: User[] = Assignments.map((a: any) => a.admin);
      const nb_admins = AssignmentArray[1];
      dispatch(assignBug({ assignments: Assignments, bugId }));
      // we only want to send a notification to the new assigned admins
      const adminsToSendNotif = Admins.slice(Admins.length - nb_admins);
      const adminsIdsToSendNotif = adminsToSendNotif.map((a: any) => a.id);
      for (let id of adminsIdsToSendNotif) {
        await userService.sendNotification(id);
      }
      dispatch(notify('Bug assigned!', 'success'));
      closeDialog && closeDialog();
    }
    catch (e: any) {
      dispatch(notify(getErrorMsg(e), 'error'));
    }
  };
};

export const createNote = (
  bugId: string,
  noteBody: string,
  isReply: boolean,
  noteId?: number,
  closeDialog?: () => void,
) : AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setSubmitBugLoading());
      if (noteId) {
        const newNote = await noteService.createNote(bugId, noteBody, isReply, noteId);
        dispatch(addNote({ note: newNote, bugId }));
      }
      else {
        const newNote = await noteService.createNote(bugId, noteBody, isReply);
        dispatch(addNote({ note: newNote, bugId }));
      }
      dispatch(notify('New note added!', 'success'));
      closeDialog && closeDialog();
    } catch (e: any) {
      dispatch(setSubmitBugError(getErrorMsg(e)));
    }
  };
};

export const editNote = (
  bugId: string,
  noteId: number,
  noteBody: string,
  closeDialog?: () => void
): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch(setSubmitBugLoading());
      const returnedData = await noteService.editNote(
        bugId,
        noteId,
        noteBody
      );
      const { body, updatedAt } = returnedData as Note;
      dispatch(
        updateNote({ data: { body, updatedAt }, noteId, bugId })
      );
      dispatch(notify('Updated the note!', 'success'));
      closeDialog && closeDialog();
    } catch (e: any) {
      dispatch(setSubmitBugError(getErrorMsg(e)));
    }
  };
};

export const deleteNote = (
  bugId: string,
  noteId: number
): AppThunk => {
  return async (dispatch) => {
    try {
      await noteService.deleteNote(bugId, noteId);
      dispatch(removeNote({ noteId, bugId }));
      dispatch(notify('Deleted the note.', 'success'));
    } catch (e: any) {
      dispatch(notify(getErrorMsg(e), 'error'));
    }
  };
};

export const fetchNotes = (bugId: string): AppThunk => {
  return async (dispatch) => {
    try {
    const Notes = await noteService.getNotes(bugId);
    for (let note of Notes) {
      dispatch(addNote({ note: note, bugId }));
    }
    } catch (e) {
      dispatch(notify(getErrorMsg(e), 'error'));
    }
}}

export const selectBugsState = (state: RootState) => state.bugs;

export const selectBugsById = (state: RootState, bugId: string) => {
  return state.bugs.bugs.find((b) => b.id === bugId);
};

export const selectBugs = (state: RootState) => {
  return state.bugs.bugs;
};

export const selectAllAdmins = (state: RootState) => {
  return state.users.users.filter((u) => u.isAdmin === true);
};


export default bugsSlice.reducer;

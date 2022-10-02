import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuthState } from '../../redux/slices/authSlice';
import { Avatar, Collapse, Divider, Typography } from '@material-ui/core';
import { useMainPageStyles } from '../../styles/muiStyles';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatTimeAgo } from '../../utils/helperFuncs';
import NoteForm from './NoteForm';
import { Note } from '../../redux/types';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { deleteNote } from '../../redux/slices/bugsSlice';

const ReplyCard: React.FC<{
  viewReplies: boolean;
  id: number;
  noteId: number;
  bugId: string;
  notes: Note[];
}> = ({ viewReplies, id, noteId, bugId, notes }) => {
  const classes = useMainPageStyles();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuthState);
  const replies = notes.map((n) => (n.isReply) && (n.replyId===noteId) && n);
  const handleDeleteNote = (noteId: number) => {
    dispatch(deleteNote(bugId, noteId));
  };

    return (
        <Collapse
            in={viewReplies}
            timeout="auto"
            unmountOnExit
            className={classes.membersWrapper}
          >
            
            {replies.map((n) => (n !== false)? (
            <div className={classes.singleNote}>
            <Avatar className={classes.avatar}>
            {n.author.username.slice(0, 1)}
            </Avatar>
            <div>
            <Typography color="secondary" variant="caption">
                {n.author.username} replied
            </Typography>
            <Typography color="secondary" variant="caption">
                <em> • {formatTimeAgo(n.createdAt)} ago</em>
            </Typography>
            {n.updatedAt !== n.createdAt && (
                <Typography color="secondary" variant="caption">
                {' '}
                • updated <em>{formatTimeAgo(n.updatedAt)} ago</em>
                </Typography>
            )}
            <Typography
                color="secondary"
                variant="subtitle1"
                className={classes.noteBody}
            >
                {n.body}
            </Typography>
            <div className={classes.notesBtnWrapper}>
            {((n.author.id === user?.id) && (user?.username !== "user")) && (
                <FormDialog
                    triggerBtn={{
                    type: 'normal',
                    text: 'Edit',
                    icon: EditIcon,
                    variant: 'outlined',
                    size: 'small',
                    style: { marginRight: '1em' },
                    color: 'secondary',
                    }}
                    title="Edit the note"
                >
                    <NoteForm
                    isReply={false}
                    isEditMode={true}
                    bugId={bugId}
                    noteId={n.id}
                    currentBody={n.body}
                    />
                </FormDialog>
                )}
                {(((n.author.id === user?.id) || (user?.isAdmin)) && (user?.username !== "user")) && (
                <ConfirmDialog
                    title="Confirm Delete Note"
                    contentText="Are you sure you want to delete the note?"
                    actionBtnText="Delete Note"
                    triggerBtn={{
                    type: 'normal',
                    text: 'Delete',
                    icon: DeleteIcon,
                    variant: 'outlined',
                    size: 'small',
                    color: 'secondary',
                    }}
                    actionFunc={() => handleDeleteNote(n.id)}
                />
                  
                )}
                </div>
                </div>
                <Divider/>
                </div>
            ): ''
      )}
        </Collapse>
                 ) }

export default ReplyCard;

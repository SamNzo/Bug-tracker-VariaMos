import React, { useState } from 'react';
import { BugState, User, UserState } from '../../redux/types';
import BugsMenu from './BugsMenu';
import { formatDateTime } from '../../utils/helperFuncs';
import { priorityStyles, statusStyles, categoryStyles } from '../../styles/customStyles';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@material-ui/core';
import { useTableStyles } from '../../styles/muiStyles';
import BugCard from './BugCard';
import { selectAllAdmins } from '../../redux/slices/bugsSlice';
import { useSelector } from 'react-redux';

const tableHeaders = [
  'Title',
  'Priority',
  'Status',
  'Category',
  'Added by',
  'Updated by',
  'Assigned to',
  'Notes',
  'Actions',
];

const BugsTable: React.FC<{ bugs: BugState[], user: UserState | null }> = ({ bugs, user }) => {

  const isInside = (users: User[], id: string) => {
    for (let i=0; i<users.length; i++) {
      if (users[i].id === id) {
        return true;
      }
    }
    return false;
  }

  const classes = useTableStyles();
  const [viewBug, setViewBug] = useState(false);
  const [bugId, setBugId] = useState('');
  const admins = useSelector(selectAllAdmins);
  if (user?.isAdmin && !isInside(admins, user.id)) {
    admins.push(user);
  }

  
  const actionsOnClick = (bugId: string) => {
    setViewBug(!viewBug);
    setBugId(bugId);
  }

  return (
    <Paper className={classes.table}>
           
      <Table>
        <TableHead>
          <TableRow>
            {tableHeaders.map((t) => (
              <TableCell key={t} align="center">
                {t}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {bugs.map((b) => (
            <><TableRow>
              <TableCell
                align="center"
                onClick={() => actionsOnClick(b.id)}
                className={classes.clickableCell}
              >
                {b.title}
              </TableCell>

              <TableCell align="center">
                <div
                  style={{
                    ...priorityStyles(b.priority),
                    textTransform: 'capitalize',
                    margin: '0 auto',
                  }}
                >
                  {b.priority}
                </div>
              </TableCell>
              <TableCell align="center">
                <div
                  style={{
                    ...statusStyles(b.isResolved),
                    margin: '0 auto',
                  }}
                >
                  {b.isResolved ? 'Closed' : 'Open'}
                </div>
              </TableCell>
              <TableCell align="center">
              <div
                  style={{
                    ...categoryStyles(b.category),
                    margin: '0 auto',
                  }}
                >
                  {b.category !== null && b.category.name !== null ? b.category.name : 'Undetermined'}
              </div>
              </TableCell>
              <TableCell align="center">
                {formatDateTime(b.createdAt)} ~{b.createdBy.username}
              </TableCell>
              <TableCell align="center">
                {!b.updatedAt || !b.updatedBy
                  ? 'n/a'
                  : `${formatDateTime(b.updatedAt)} ~ ${b.updatedBy.username}`}
              </TableCell>
              <TableCell align="center">
              {admins.map((a) => (
                  b.assignments.map((b) => (a.id === b.adminId) ? a.username + '\n' : '')))}
              </TableCell>
              <TableCell align="center">{b.notes.length}</TableCell>
              <TableCell align="center">
                <BugsMenu
                  bugId={b.id}
                  currentData={{
                    title: b.title,
                    description: b.description,
                    priority: b.priority,
                    category: b.category }}
                  isResolved={b.isResolved}
                  isAdmin={user?.isAdmin} />
              </TableCell>
            </TableRow>
            {(b.id === bugId) && (viewBug) && ( 
              <TableRow>
                <TableCell colSpan={tableHeaders.length} >
                  <BugCard
                    viewBug={viewBug}
                    id={b.id}
                    bugId={bugId} 
                />
                </TableCell>
              </TableRow>
            )}</>
          ))}
        </TableBody>
      </Table>
           
    </Paper>

  );
};

export default BugsTable;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBugs,
  selectBugs,
  selectBugsState,
} from '../../redux/slices/bugsSlice';
import { RootState } from '../../redux/store';
import BugsTable from './BugsTable';
import BugsActionCard from './BugsActionCard';
import BugsListMobile from './BugsListMobile';
import sortBugs from '../../utils/sortBugs';
import filterBugs from '../../utils/filterBugs';
import LoadingSpinner from '../../components/LoadingSpinner';
import InfoText from '../../components/InfoText';
import { Paper, Typography } from '@material-ui/core';
import { useMainPageStyles } from '../../styles/muiStyles';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import { selectAuthState } from '../../redux/slices/authSlice';

const BugsPage: React.FC<{ isMobile: boolean }> = ({
  isMobile,
  }) => {
    const classes = useMainPageStyles();
    const dispatch = useDispatch();
    const bugs = useSelector((state: RootState) =>
    selectBugs(state)
    );
    
  const { fetchLoading, fetchError, sortBy, filterBy } = useSelector(
    selectBugsState
  );
  const [filterValue, setFilterValue] = useState('');

  const { user, loading, error } = useSelector(selectAuthState);
  const userId = user?.id;

  useEffect(() => {
    if (!bugs) {
      dispatch(fetchBugs());
    }
    // eslint-disable-next-line
  }, []);

  const filteredSortedBugs =
    bugs &&
    sortBugs(
      bugs.filter(
        (b) =>
          b.title.toLowerCase().includes(filterValue.toLowerCase()) &&
          filterBugs(filterBy, b, userId)
      ),
      sortBy
    );

  const bugsDataToDisplay = () => {
    if (fetchLoading) {
      
      return (
        <LoadingSpinner
          marginTop={isMobile ? '3em' : '4em'}
          size={isMobile ? 60 : 80}
        />
      );
    } else if (fetchError) {
      
      return (
        <InfoText
          text={`Error: ${fetchError}`}
          variant={isMobile ? 'h6' : 'h5'}
        />
      );
    } else if (!bugs || bugs.length === 0) {
      return (
        <InfoText text="No Bugs added yet." variant={isMobile ? 'h6' : 'h5'} />
      );
    } else if (!filteredSortedBugs || filteredSortedBugs.length === 0) {
      return (
        <InfoText text="No matches found." variant={isMobile ? 'h6' : 'h5'} />
      );
    } else {
      return (
        <div>
          {isMobile ? (
            <BugsListMobile bugs={filteredSortedBugs} user={user}/>
          ) : (
            <BugsTable bugs={filteredSortedBugs} user={user}/>
          )}
        </div>
      );
    }
  };

  return (
    <Paper className={classes.bugsPaper}>
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        color="secondary"
        className={classes.flexHeader}
      >
        <BugReportOutlinedIcon
          fontSize={isMobile ? 'default' : 'large'}
          style={{ marginRight: '0.2em' }}
        />
        Bugs
      </Typography>
      <div className={classes.bugsActionCard}>
        <BugsActionCard
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          isMobile={isMobile}
        />
      </div>
      {bugsDataToDisplay()}
    </Paper>
  );
};

export default BugsPage;

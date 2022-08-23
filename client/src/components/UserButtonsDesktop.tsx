import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SettingsPayload, UserState } from '../redux/types';
import DarkModeSwitch from './DarkModeSwitch';

import { Button, Avatar, Typography, MenuItem } from '@material-ui/core';
import { useNavStyles } from '../styles/muiStyles';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SettingsIcon from '@material-ui/icons/Settings';
import FormDialog from './FormDialog';
import BugForm from '../pages/Main/BugForm';
import EmailForm from '../pages/Main/EmailForm';
import { useSelector } from 'react-redux';
import { selectUsersState } from '../redux/slices/usersSlice';

interface UserMenu {
  isMobile: boolean;
  user: UserState | null;
  handleLogout: () => void;
}

const UserButtonsDesktop: React.FC<UserMenu> = ({
  isMobile,
  user,
  handleLogout,
}) => {
  const classes = useNavStyles();
  const email = user?.email;

  let emailExist: boolean = false;
  if (email) {
      emailExist = true;
  }

  if (isMobile) return null;

  return (
    <div>
      {user?.username !== "user" ? (
        <div className={classes.btnsWrapper}>
          <div className={classes.userInfo}>
          <MenuItem
              component={RouterLink}
              to="/"
            >
            <Avatar className={classes.avatar}>
              {user?.username.slice(0, 1)}
            </Avatar>
            <Typography color="secondary" variant="body1">
              

              Main Menu
            </Typography>
            </MenuItem>
          </div>
          <div>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              className={classes.lastBtn}
              onClick={handleLogout}
              startIcon={<PowerSettingsNewIcon />}
            >
              Log Out
            </Button>
            
          
            <FormDialog
            triggerBtn={
              isMobile
                ? {
                    color: "secondary",
                    type: 'fab',
                    variant: 'extended',
                    text: 'Email',
                    icon: SettingsIcon,
                  }
                : {
                    color: "secondary",
                    type: 'normal',
                    variant: 'outlined',
                    text: 'Settings',
                    icon: SettingsIcon,
                    size: 'small',
                    style: { marginLeft: '10px' },
                  }
            }
            title="Change your personal settings"
          >
            <EmailForm emailExist={emailExist} />
          </FormDialog>
        </div>
          <DarkModeSwitch isMobile={isMobile} />
        </div>
      ) : (
        <div>
          <Button
            color="secondary"
            variant="outlined"
            size="small"
            component={RouterLink}
            to="/login"
            startIcon={<ExitToAppIcon />}
          >
            Log In
          </Button>
          <Button
            color="secondary"
            variant="outlined"
            size="small"
            className={classes.lastBtn}
            component={RouterLink}
            to="/signup"
            startIcon={<PersonAddIcon />}
          >
            Sign Up
          </Button>
          <DarkModeSwitch isMobile={isMobile} />
        </div>
      )}
    </div>
  );
};

export default UserButtonsDesktop;

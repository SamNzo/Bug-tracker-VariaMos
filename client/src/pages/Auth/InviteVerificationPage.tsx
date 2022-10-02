import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
  selectAuthState,
  verifyCode,
} from '../../redux/slices/authSlice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import BugIcon from '../../svg/bug-logo.svg';

import {
  TextField,
  Button,
  InputAdornment,
  Paper,
} from '@material-ui/core';
import { useAuthPageStyles } from '../../styles/muiStyles';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DemoCredsBox from '../../components/DemoCredsBox';
import { InviteCodeData } from '../../redux/types';
import SignupPage from './SignupPage';
import ReCAPTCHA from 'react-google-recaptcha';

interface InviteVerificationPageProps {
    closeDialog?: () => void;
}

const validationSchema = yup.object({
  code: yup
    .string()
    .required('Required')

});

const InviteVerificationPage: React.FC<InviteVerificationPageProps> = ({
    closeDialog
  }) => {
  const classes = useAuthPageStyles();
  const [isVerified, setIsVerified] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const { loading, error } = useSelector(selectAuthState);

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const handleVerifyCode = (inviteCode: InviteCodeData) => {
    const verified = verifyCode(inviteCode, closeDialog);  
    verified.then(function(result) {
        setIsVerified(result);
    });
  };

  const handleReCAPTCHA = (value: any) => {
    setIsHuman(true);
  }

  return (
    <div> 
        {!isVerified ? (
            <Paper className={classes.root} elevation={2}>
            <img src={BugIcon} alt="bug-logo" className={classes.titleLogo} />

            <form onSubmit={handleSubmit(handleVerifyCode)} className={classes.form}>
            <div className={classes.inputField}>
                <TextField
                required
                fullWidth
                inputRef={register}
                name="code"
                type="text"
                label="Invitation code"
                variant="outlined"
                error={'code' in errors}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <PersonIcon color="primary" />
                    </InputAdornment>
                    ),
                }}
                />
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={handleReCAPTCHA}
              />,
            {isHuman ? (
            <Button
                color="primary"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ExitToAppIcon />}
                type="submit"
                className={classes.submitButton}
                disabled={loading}
            >
                Verify code
            </Button>
            ) : '' }
            </div>
            <DemoCredsBox adminSignup={true}/>
            </form>
            </Paper>
        ) : 
        <SignupPage adminMode={true}></SignupPage>}
    </div>
  );
};

export default InviteVerificationPage;

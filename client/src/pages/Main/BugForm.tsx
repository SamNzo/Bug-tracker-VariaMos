import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import {
  createNewBug,
  editBug,
  clearSubmitBugError,
  selectBugsState,
} from '../../redux/slices/bugsSlice';
import {
  createCategory, deleteCategory, fetchCategories, selectCategoriesState
} from '../../redux/slices/categoriesSlice';
import { BugPayload, Category } from '../../redux/types';
import ErrorBox from '../../components/ErrorBox';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import backendUrl from '../../backendUrl';
import {
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  InputAdornment,
  FormLabel,
  FormControl,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  IconButton,
} from '@material-ui/core';
import { useFormStyles } from '../../styles/muiStyles';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import RemoveCircleOutline from '@material-ui/icons/RemoveCircleOutline';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import TitleIcon from '@material-ui/icons/Title';
import SubjectIcon from '@material-ui/icons/Subject';
import React, { useEffect, useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import DemoCredsBox from '../../components/DemoCredsBox';
import { selectAuthState } from '../../redux/slices/authSlice';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Required')
    .min(3, 'Must be at least 3 characters')
    .max(60, 'Must be at most 60 characters'),

  description: yup.string().required('Required'),
  category: yup.string()
});

interface BugFormProps {
  closeDialog?: () => void;
  isEditMode: boolean;
  currentData?: BugPayload;
  bugId?: string;
}

const BugForm: React.FC<BugFormProps> = ({
  closeDialog,
  isEditMode,
  currentData,
  bugId,
}) => {
  const classes = useFormStyles();
  const dispatch = useDispatch();
  const user = useSelector(selectAuthState).user;
  const { submitError, submitLoading } = useSelector(selectBugsState);
  const [bugCategory, setBugCategory] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [addCategory, setAddCategory] = useState<boolean>(false);
  const [removeCategory, setRemoveCategory] = useState<boolean>(false);
  const [descriptionHelp, setDescriptionbHelp] = useState(false);
  const [categoryHelp, setCategoryHelp] = useState(false);
  const [imageHelp, setImageHelp] = useState(false);
  const [JSONHelp, setJSONHelp] = useState(false);

  const bugCategories = useSelector(selectCategoriesState).categories;
  const bugCategoriesNames = bugCategories.map((cat) => cat.name);

  // Fetch basic/default bug categories from database (VariaMos languages have to be added with the UI)
  useEffect(() => {
    if (bugCategories.length === 0) {
      dispatch(fetchCategories());
    }
    // eslint-disable-next-line
  }, []);

  const { register, control, handleSubmit, errors } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: currentData?.title || '',
      description: currentData?.description || '',
      priority: currentData?.priority || 'low',
      category: currentData?.category || '',
    },
  });

  const handleChangeCategory = (e: any, selectedOption: string | null) => {
    if (selectedOption) {
      setBugCategory(selectedOption);
    }
  };

  const handleViewAddCategory = () => {
    setAddCategory(!addCategory);
  }

  const handleViewRemoveCategory = () => {
    setRemoveCategory(!removeCategory);
  }

  const handleNewCategoryName = (e: any) => {
    setNewCategoryName(e.target.value);
  }

  const handleAddCategory = (e: any) => {
    dispatch(createCategory(newCategoryName))
  }

  const handleRemoveCategory = (e: any) => {
    dispatch(deleteCategory(bugCategory))
  }

  const handleCreateBug = async (data: BugPayload) => {
    const formData = new FormData(form);
    dispatch(createNewBug(data, formData, bugCategory, closeDialog));
  };

  const handleUpdateBug = (data: BugPayload) => {
    if (typeof(bugId) === "string") {
      const formData = new FormData(document.getElementById("bug-form") as HTMLFormElement);;
      dispatch(editBug(bugId, data, formData, bugCategory, closeDialog));
    }
  };

  const form = document.getElementById("bug-form") as HTMLFormElement;
  
  return (
    <><form 
    id="bug-form" 
    method="POST" 
    action={backendUrl + '/bugs/upload'} 
    encType="multipart/form-data"
    onSubmit={handleSubmit(isEditMode ? handleUpdateBug : handleCreateBug)}
    >
        <TextField
          inputRef={register}
          name="title"
          required
          fullWidth
          type="text"
          label="Bug Title"
          variant="outlined"
          error={'title' in errors}
          helperText={'title' in errors ? errors.title?.message : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon color="primary" />
              </InputAdornment>
            ),
          }} />
        <TextField
          className={classes.fieldMargin}
          multiline
          rows={1}
          rowsMax={4}
          inputRef={register}
          name="description"
          required
          fullWidth
          type="text"
          label="Description"
          variant="outlined"
          error={'description' in errors}
          helperText={'description' in errors ? errors.description?.message : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SubjectIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setDescriptionbHelp((prevState) => !prevState)}
                  size="small"
                >
                  <HelpOutlineIcon color="primary" />
                </IconButton>
              
              </InputAdornment>
            )
          }} />
            {descriptionHelp && (
          <DemoCredsBox adminSignup={false} descriptionHelp={true}></DemoCredsBox>
            )}
          <Autocomplete
              style={{ marginTop: 20 }}
              filterSelectedOptions
              onChange={handleChangeCategory}
              options={
                bugCategoriesNames
              }
              getOptionLabel={(option) => option}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Category (optional)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment
                          position="start"
                          style={{ paddingLeft: '0.4em' }}
                        >
                          <IconButton
                            onClick={() => setCategoryHelp((prevState) => !prevState)}
                            size="small"
                          >
                            <HelpOutlineIcon color="primary" />
                          </IconButton>
                        {user?.isAdmin && (
                              <><IconButton
                              onClick={() => handleViewAddCategory()}
                              size="small"
                            >
                              <AddBoxOutlined color="primary" />

                            </IconButton>
                            <IconButton
                              onClick={() => handleViewRemoveCategory()}
                              size="small"
                            >
                                <RemoveCircleOutline color="primary" />
                              </IconButton></>
                        )}
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(option) => (
                <ListItem dense component="div">
                  <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                      {option.slice(0, 1)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={option}
                    primaryTypographyProps={{
                      color: 'secondary',
                      variant: 'body1',
                    }}
                  />
                </ListItem>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    avatar={<Avatar>{option.slice(0, 1)}</Avatar>}
                    color="secondary"
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
        {categoryHelp && (
          <DemoCredsBox adminSignup={false} categoryHelp={true}></DemoCredsBox>
        )}
        {addCategory && (
          <><br></br><TextField
          name="addCategory"
          required
          fullWidth
          onChange={handleNewCategoryName}
          type="text"
          label="New category name"
          variant="outlined"
          error={'category' in errors}
          helperText={'category' in errors ? errors.category?.message : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon color="primary" />
              </InputAdornment>
            ),
          }} /><Button
            size="large"
            color="primary"
            variant="contained"
            fullWidth
            onClick={(e) => handleAddCategory(e)}
            className={classes.submitBtn}
            type="button"
            disabled={submitLoading}
          >
            Add new category
          </Button></>
          
        )}
        {removeCategory && (
          <><Autocomplete
          style={{ marginTop: 20 }}
          filterSelectedOptions
          onChange={handleChangeCategory}
          options={bugCategoriesNames}
          getOptionLabel={(option) => option}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select category to delete"
              InputProps={{
                ...params.InputProps,
              }} />
          )}
          renderOption={(option) => (
            <ListItem dense component="div">
              <ListItemAvatar>
                <Avatar className={classes.avatar}>
                  {option.slice(0, 1)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={option}
                primaryTypographyProps={{
                  color: 'secondary',
                  variant: 'body1',
                }} />
            </ListItem>
          )}
          renderTags={(value, getTagProps) => value.map((option, index) => (
            <Chip
              avatar={<Avatar>{option.slice(0, 1)}</Avatar>}
              color="secondary"
              variant="outlined"
              label={option}
              {...getTagProps({ index })} />
          ))} /><Button
            size="large"
            color="primary"
            variant="contained"
            fullWidth
            onClick={(e) => handleRemoveCategory(e)}
            className={classes.submitBtn}
            type="button"
            disabled={submitLoading}
          >
            Delete category
          </Button></>
        )}
        
        <Controller
          control={control}
          name="priority"
          as={<FormControl className={classes.radioGroupForm}>
            <RadioGroup row defaultValue="low" className={classes.radioGroup}>
              <FormLabel className={classes.radioGroupLabel}>
                Priority:
              </FormLabel>
              <div className={classes.formControlLabels}>
                <FormControlLabel
                  value="low"
                  control={<Radio color="primary" />}
                  label="Low" />
                <FormControlLabel
                  value="medium"
                  control={<Radio color="primary" />}
                  label="Medium" />
                <FormControlLabel
                  value="high"
                  control={<Radio color="primary" />}
                  label="High" />
              </div>
            
            </RadioGroup>
          </FormControl>} />

      <label htmlFor="imageInput">Image/Video:  </label>
      <input id="imageInput" type="file" name='image' accept="image/*, video/*"></input>
      <IconButton
        onClick={() => setImageHelp((prevState) => !prevState)}
        size="small"
      >
        <HelpOutlineIcon color="primary" />
      </IconButton>
      {imageHelp && (
        <DemoCredsBox adminSignup={false} imageHelp={true}></DemoCredsBox>
      )}
      <br></br>
      <label htmlFor="jsonInput">JSON file:  </label>
      <input id="jsonInput" type="file" name='json' accept=".json"></input>
      <IconButton
        onClick={() => setJSONHelp((prevState) => !prevState)}
        size="small"
      >
        <HelpOutlineIcon color="primary" />
      </IconButton>
      {JSONHelp && (
        <DemoCredsBox adminSignup={false} JSONHelp={true}></DemoCredsBox>
      )}
        <Button
          size="large"
          color="primary"
          variant="contained"
          fullWidth
          className={classes.submitBtn}
          type="submit"
          disabled={submitLoading}
        >
          {isEditMode ? 'Update Bug' : 'Create New Bug'}
        </Button>
        {submitError && (
          <ErrorBox
            errorMsg={submitError}
            clearErrorMsg={() => dispatch(clearSubmitBugError())} />
        )}
      </form></>
  );
};

export default BugForm;

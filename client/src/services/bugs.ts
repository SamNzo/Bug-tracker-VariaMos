import axios from 'axios';
import backendUrl from '../backendUrl';
import { setConfig } from './auth';
import { BugPayload } from '../redux/types';

const baseUrl = `${backendUrl}/bugs`;

const getBugs = async () => {
  const response = await axios.get(baseUrl, setConfig());
  return response.data;
};

const createBug = async (bugData: BugPayload, form: FormData, category: string) => {
  const response = await axios.post(baseUrl, [bugData, category], setConfig())
  axios.post(backendUrl + '/bugs/upload', form);
  return response.data;
};

const updateBug = async (bugId: string, bugData: BugPayload, form: FormData, category: string) => {
  const response = await axios.put(`${baseUrl}/${bugId}`, [bugData, category], setConfig());
  axios.post(backendUrl + '/bugs/upload', form);
  return response.data; 
};

const deleteBug = async (bugId: string) => {
  const response = await axios.delete(
    `${baseUrl}/${bugId}`,
    setConfig()
  );
  return response.data;
};

const closeBug = async (bugId: string) => {
  const response = await axios.post(
    `${baseUrl}/${bugId}/close`,
    null,
    setConfig()
  );
  return response.data;
};

const reopenBug = async (bugId: string) => {
  const response = await axios.post(
    `${baseUrl}/${bugId}/reopen`,
    null,
    setConfig()
  );
  return response.data;
};


const bugService = {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
  closeBug,
  reopenBug
};

export default bugService;

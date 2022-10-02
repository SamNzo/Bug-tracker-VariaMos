import axios from 'axios';
import backendUrl from '../backendUrl';
import { setConfig } from './auth';

const baseUrl = `${backendUrl}/categories`;

const getCategories = async () => {
  const response = await axios.get(baseUrl, setConfig());
  return response.data;
};

const createCategory = async (categoryName: string) => {
  const response = await axios.post(
    `${baseUrl}/create`, { categoryName }, setConfig()
  );
  return response.data;
}

const deleteCategory = async (categoryName: string) => {
  const response = await axios.delete(
    `${baseUrl}/delete/${categoryName}`, setConfig()
  );
  return response.data;
}


const categoriesService = {
    createCategory,
    deleteCategory,
    getCategories
};
  
export default categoriesService;
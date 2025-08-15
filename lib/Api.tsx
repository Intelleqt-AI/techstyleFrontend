import axios from 'axios';

const getBaseUrl = () => (typeof window === 'undefined' ? process.env.API_URL : process.env.NEXT_PUBLIC_API_URL);

const handleError = error => {
  throw new Error(error.response ? `HTTP error! status: ${error.response.status}` : error.message);
};

export const fetchData = async url => {
  if (!url) throw new Error('No URL provided');
  try {
    const response = await axios.get(`${getBaseUrl()}${url}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const postData = async ({ url, data }) => {
  if (!url) throw new Error('No post URL provided');
  try {
    const response = await axios.post(`${getBaseUrl()}${url}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteData = async ({ url }) => {
  if (!url) throw new Error('No URL provided');
  try {
    const response = await axios.delete(`${getBaseUrl()}${url}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

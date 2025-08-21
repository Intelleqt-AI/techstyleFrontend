import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const postData = async newData => {
  const formData = new FormData();

  // Add each field to FormData
  Object.keys(newData).forEach(key => {
    formData.append(key, newData[key]);
  });

  const response = await axios.post('https://clipper-ai.techstyles.ai/clipper/', formData);
  return JSON.parse(response.data);
};
export const usePostData = () => {
  return useMutation({
    mutationFn: postData,
  });
};

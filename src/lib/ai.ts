import { api } from '@/lib/axios';

export const studentChat = async (message: string) => {
  const response = await api.post('/ai/student/chat', { message });
  return response.data.response;
};

export const getStudentSuggestions = async () => {
  const response = await api.get('/ai/student/suggestions');
  return response.data.suggestions;
};

export const adminAssist = async (prompt: string) => {
  const response = await api.post('/ai/admin/assist', { prompt });
  return response.data; // Return the whole object { response, actionExecuted, details }
};

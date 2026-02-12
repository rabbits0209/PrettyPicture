import api from './index';

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  code?: string;
}

interface ForgetParams {
  email: string;
  code: string;
  password: string;
}

export const accountApi = {
  login: (data: LoginParams) => api.post('/account/login', data),
  register: (data: RegisterParams) => api.post('/account/register', data),
  sendCode: (email: string) => api.post('/account/sendCode', { email }),
  forget: (data: ForgetParams) => api.post('/account/forget', data),
};

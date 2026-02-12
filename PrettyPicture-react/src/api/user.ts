import api from './index';

interface UpdateUserParams {
  username?: string;
  email?: string;
  phone?: string;
}

interface ResetPwdParams {
  oldPwd: string;
  newPwd: string;
}

interface LogParams {
  page: number;
  size: number;
  type?: number;
  read?: number;
}

export const userApi = {
  info: () => api.get('/user/info'),
  home: () => api.get('/user/home'),
  storage: () => api.get('/user/storage'),
  log: (params: LogParams) => api.get('/user/log', { params }),
  update: (data: UpdateUserParams) => api.put('/user/update', data),
  resetPwd: (data: ResetPwdParams) => api.put('/user/resetPwd', data),
  resetKey: () => api.put('/user/resetKey'),
  uploadAvatar: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/user/uploadAvatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
};

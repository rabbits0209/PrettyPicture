import api from './index';

// 获取系统公开配置
export const getConfig = () => api.get('/index/index');

interface SetupItem {
  id: number;
  value: string | number;
}

interface SetupUpdateParams {
  createData: SetupItem[];
}

export const setupApi = {
  // type: basics, email, upload
  get: (type: string) => api.get(`/setup/index/${type}`),
  update: (data: SetupUpdateParams) => api.put('/setup/update', data),
  sendTest: () => api.post('/setup/sendTest'),
};

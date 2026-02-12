import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '',
  timeout: 30000,
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      // PHP 后端使用 'token' header
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和数据
api.interceptors.response.use(
  (response) => {
    // 后端返回格式: { code: 200, msg: '成功', data: ... }
    const res = response.data;
    if (res.code === 200) {
      return res;
    }
    // code 为 -1 表示登录失效
    if (res.code === -1) {
      useAuthStore.getState().logout();
      window.location.href = '/#/login';
      return Promise.reject(res);
    }
    return Promise.reject(res);
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === -1) {
      useAuthStore.getState().logout();
      window.location.href = '/#/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

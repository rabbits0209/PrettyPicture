import api from './index';

interface QueryParams {
  page: number;
  size: number;
  name?: string;
  type?: number;
  folder_id?: number;
}

export const imagesApi = {
  query: (params: QueryParams) => api.get('/images/query', { params }),
  delete: (id: number) => api.delete('/images/delete', { params: { id } }),
  move: (ids: number[], folder_id: number) => api.post('/images/move', { ids, folder_id }),
  // API 上传使用 key 认证，不走 token
  upload: (formData: FormData, key: string, onProgress?: (percent: number) => void) =>
    api.post('/api/upload', formData, {
      params: { key },
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),
};

import api from './index';

interface StorageParams {
  id?: number;
  name: string;
  type: string;
  AccessKey?: string;
  SecretKey?: string;
  Bucket?: string;
  Endpoint?: string;
  Domain?: string;
  Region?: string;
}

interface QueryParams {
  page: number;
  size: number;
}

export const storageApi = {
  query: (params: QueryParams) => api.get('/storage/query', { params }),
  type: () => api.get('/storage/type'),
  save: (data: StorageParams) => api.post('/storage/save', data),
  update: (data: StorageParams) => api.put('/storage/update', data),
  delete: (id: number) => api.delete('/storage/delete', { params: { id } }),
};

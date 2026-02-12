import api from './index';

interface FolderParams {
  id?: number;
  name: string;
  is_public?: number;
}

export const folderApi = {
  query: () => api.get('/folder/query'),
  save: (data: FolderParams) => api.post('/folder/save', data),
  update: (data: FolderParams) => api.put('/folder/update', data),
  delete: (id: number) => api.delete('/folder/delete', { params: { id } }),
};

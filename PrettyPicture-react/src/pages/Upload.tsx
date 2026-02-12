import React, { useState, useEffect } from 'react';
import { Upload as UploadComponent } from '../components/Upload';
import { Card, Button } from '../components/ui';
import { folderApi } from '../api/folder';
import { useUIStore } from '../store';
import type { Folder, ImageItem } from '../types';

export const Upload: React.FC = () => {
  const { addToast } = useUIStore();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>();
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);

  // Load folders
  useEffect(() => {
    folderApi.query().then((res: any) => {
      setFolders(res.data || []);
    }).catch(() => {});
  }, []);

  const handleUploadSuccess = (result: any) => {
    setUploadedImages((prev) => [result, ...prev]);
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('链接已复制', 'success');
    } catch {
      addToast('复制失败', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">上传图片</h1>

      {/* Folder selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-foreground/70 whitespace-nowrap">上传到目录：</label>
          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 px-3 py-2 bg-content2 border border-divider rounded-lg text-sm text-foreground"
          >
            <option value="">默认目录</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Upload area */}
      <Card className="p-6">
        <UploadComponent
          folderId={selectedFolder}
          onSuccess={handleUploadSuccess}
          onError={() => {}}
        />
      </Card>

      {/* Uploaded images */}
      {uploadedImages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">已上传</h2>
          <div className="space-y-4">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-content2 rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-content3 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate text-sm">
                    {image.name}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {image.url}
                  </p>
                </div>
                <Button
                  variant="flat"
                  size="sm"
                  onClick={() => handleCopy(image.url)}
                >
                  复制链接
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Upload;

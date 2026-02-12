import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui';
import { useConfigStore, useUIStore, useAuthStore } from '../store';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

interface UploadProps {
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  folderId?: number;
}

export const Upload: React.FC<UploadProps> = ({
  onSuccess,
  onError,
  folderId,
}) => {
  const { config } = useConfigStore();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const allowedTypes = config?.upload_rule || ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const maxSize = (config?.upload_max || 10) * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedTypes.includes(ext)) {
      return `不支持的文件类型: ${ext}`;
    }
    if (file.size > maxSize) {
      return `文件大小超过限制 (最大 ${config?.upload_max || 10}MB)`;
    }
    return null;
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles: UploadFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        addToast(`${file.name}: ${error}`, 'error');
        return;
      }
      
      // 检查是否已存在
      const exists = files.some(f => f.file.name === file.name && f.file.size === file.size);
      if (exists) return;

      uploadFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
      });
    });

    if (uploadFiles.length > 0) {
      setFiles(prev => [...prev, ...uploadFiles]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    if (!user?.Secret_key) return;

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
    ));

    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('key', user.Secret_key);
    if (folderId) {
      formData.append('folder_id', String(folderId));
    }

    try {
      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress: percent } : f
            ));
          }
        };

        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.code === 200) {
              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, status: 'success', progress: 100, result: result.data } : f
              ));
              onSuccess(result.data);
              resolve();
            } else {
              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, status: 'error', error: result.msg || '上传失败' } : f
              ));
              reject(new Error(result.msg));
            }
          } catch {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, status: 'error', error: '解析响应失败' } : f
            ));
            reject(new Error('解析响应失败'));
          }
        };

        xhr.onerror = () => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'error', error: '网络错误' } : f
          ));
          reject(new Error('网络错误'));
        };

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } catch (err: any) {
      onError(err.message);
    }
  };

  const handleUploadAll = async () => {
    if (!user?.Secret_key) {
      addToast('请先登录', 'error');
      return;
    }

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) {
      addToast('没有待上传的文件', 'warning');
      return;
    }

    setIsUploading(true);

    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }

    setIsUploading(false);
    
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;
    
    if (errorCount === 0) {
      addToast(`全部上传成功 (${successCount}张)`, 'success');
    } else {
      addToast(`上传完成: ${successCount}成功, ${errorCount}失败`, 'warning');
    }
  };

  const clearCompleted = () => {
    setFiles(prev => {
      prev.filter(f => f.status === 'success').forEach(f => URL.revokeObjectURL(f.preview));
      return prev.filter(f => f.status !== 'success');
    });
  };

  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-divider hover:border-primary/50 hover:bg-content2'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.map((t) => `.${t}`).join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-foreground font-medium">拖拽图片到这里，或点击选择</p>
            <p className="text-sm text-foreground/60 mt-1">
              支持批量上传 · {allowedTypes.join(', ')} · 最大 {config?.upload_max || 10}MB
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70">
              {files.length} 个文件 {successCount > 0 && `(${successCount} 已完成)`}
            </span>
            <div className="flex gap-2">
              {successCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  清除已完成
                </Button>
              )}
              {pendingCount > 0 && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleUploadAll}
                  isLoading={isUploading}
                  isDisabled={isUploading}
                >
                  上传全部 ({pendingCount})
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 bg-content2 rounded-xl"
              >
                {/* Preview */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-content3 flex-shrink-0">
                  <img
                    src={uploadFile.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-foreground/60">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {uploadFile.status === 'success' && (
                      <span className="text-xs text-success">✓ 已上传</span>
                    )}
                    {uploadFile.status === 'error' && (
                      <span className="text-xs text-danger">{uploadFile.error}</span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2 w-full bg-content3 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-150"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'uploading' && (
                    <span className="text-xs text-primary">{uploadFile.progress}%</span>
                  )}
                  {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(uploadFile.id); }}
                      className="p-1 hover:bg-content3 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {uploadFile.status === 'success' && (
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;

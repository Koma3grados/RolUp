import api from "@/api/axios";

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  extension: string;
}

export interface UploadResponse {
  originalFileName: string;
  storedFilePath: string;
  fileDownloadUri: string;
  fileType: string;
  size: number;
}

export const fileStorageAPI = {
  // Obtener URL completa de imagen (para usar en src de img)
  getImageApiUrl: (filePath: string): string => {
    const filename = filePath.split('/').pop() || '';
    const path = filePath.includes('/') 
      ? filePath.substring(0, filePath.lastIndexOf('/'))
      : '';
    return `/api/file-manager/image/${filename}?path=${encodeURIComponent(path)}`;
  },

  getImageUrl: (filePath: string): string => {
    return `/uploads/${filePath}`;
  },
  
  // Listar archivos en un directorio
  listFiles: async (path: string = ""): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>(`/api/file-manager/list?path=${encodeURIComponent(path)}`);
    return response.data;
  },

  // Subir archivo
  uploadFile: async (file: File, path: string = ""): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await api.post<UploadResponse>('/api/file-manager/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Crear directorio
  createDirectory: async (path: string, name: string): Promise<void> => {
    await api.post(`/api/file-manager/directory?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`);
  },

  // Eliminar archivo o directorio
  delete: async (path: string, isDirectory: boolean): Promise<void> => {
    await api.delete(`/api/file-manager/delete?path=${encodeURIComponent(path)}&isDirectory=${isDirectory}`);
  },
};
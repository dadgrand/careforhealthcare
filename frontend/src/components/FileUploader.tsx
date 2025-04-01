import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Chip,
  useTheme,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudDone as CloudDoneIcon,
} from '@mui/icons-material';

// Интерфейс для загружаемого файла
interface UploadFile {
  file: File;
  id: string;
  status: 'ready' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  title?: string;
  description?: string;
  multiple?: boolean;
  buttonText?: string;
  uploadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  dropzoneText?: string;
  onFileRemove?: (fileId: string) => void;
  disabled?: boolean;
  showFileList?: boolean;
}

/**
 * Компонент для загрузки файлов с поддержкой drag-and-drop
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes,
  title = 'Загрузка файлов',
  description = 'Перетащите файлы сюда или нажмите для выбора',
  multiple = true,
  buttonText = 'Выбрать файлы',
  uploadingMessage = 'Загрузка...',
  successMessage = 'Файлы успешно загружены',
  errorMessage = 'Ошибка при загрузке файлов',
  dropzoneText = 'Перетащите файлы сюда',
  onFileRemove,
  disabled = false,
  showFileList = true,
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Конфигурация dropzone
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: acceptedFileTypes
      ? acceptedFileTypes.reduce((acc: Record<string, string[]>, type) => {
          acc[type] = [];
          return acc;
        }, {})
      : undefined,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    disabled: disabled || isUploading,
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        // Добавляем новые файлы к уже имеющимся, если не превышен лимит
        const newFileCount = acceptedFiles.length;
        const currentFileCount = files.length;

        if (currentFileCount + newFileCount > maxFiles) {
          alert(`Максимальное количество файлов: ${maxFiles}`);
          return;
        }

        const newFiles = acceptedFiles.map((file) => ({
          file,
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'ready' as const,
          progress: 0,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      },
      [files.length, maxFiles]
    ),
  });

  // Стили для dropzone
  const dropzoneStyle = useMemo(
    () => ({
      border: '2px dashed',
      borderColor: isDragAccept
        ? theme.palette.success.main
        : isDragReject
        ? theme.palette.error.main
        : theme.palette.divider,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(4),
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: isDragActive
        ? theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[800]
        : 'transparent',
      outline: 'none',
      transition: 'border .2s ease-in-out',
    }),
    [isDragAccept, isDragReject, isDragActive, disabled, theme]
  );

  // Обработчик удаления файла
  const handleRemoveFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    if (onFileRemove) {
      onFileRemove(fileId);
    }
  };

  // Обработчик начала загрузки
  const handleUploadClick = async () => {
    if (files.length === 0) return;

    const readyFiles = files.filter((file) => file.status === 'ready');
    if (readyFiles.length === 0) return;

    setIsUploading(true);
    setStatus('uploading');

    // Обновляем статус файлов на "uploading"
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.status === 'ready' ? { ...file, status: 'uploading' } : file
      )
    );

    // Симулируем прогресс загрузки
    const progressInterval = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.status === 'uploading' && file.progress < 90) {
            return { ...file, progress: file.progress + 10 };
          }
          return file;
        })
      );
    }, 300);

    try {
      // Отправляем файлы на сервер
      await onUpload(readyFiles.map((file) => file.file));

      // Помечаем файлы как успешно загруженные
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.status === 'uploading' ? { ...file, status: 'success', progress: 100 } : file
        )
      );
      setStatus('success');
    } catch (error) {
      console.error('Error uploading files:', error);
      // Помечаем файлы как загруженные с ошибкой
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.status === 'uploading'
            ? {
                ...file,
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : file
        )
      );
      setStatus('error');
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  // Размер файла в читаемом формате
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Получаем иконку статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <CircularProgress size={20} />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <FileIcon />;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}

      <Box {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            mb: 2,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <Typography variant="subtitle1" gutterBottom>
          {isDragActive ? dropzoneText : buttonText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`Максимум ${maxFiles} файл${maxFiles > 1 ? 'ов' : ''}, до ${formatFileSize(maxSize)} каждый`}
        </Typography>
        {acceptedFileTypes && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
            {acceptedFileTypes.map((type) => (
              <Chip key={type} label={type} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </Box>

      {showFileList && files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Выбранные файлы:
          </Typography>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <Tooltip title="Удалить файл">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={isUploading}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemIcon>{getStatusIcon(file.status)}</ListItemIcon>
                <ListItemText
                  primary={file.file.name}
                  secondary={`${formatFileSize(file.file.size)} • ${file.file.type || 'Unknown type'}`}
                  primaryTypographyProps={{ noWrap: true, style: { maxWidth: '80%' } }}
                  secondaryTypographyProps={{ noWrap: true }}
                />
                {file.status === 'uploading' && (
                  <Box sx={{ width: '100%', ml: 2, mr: 2 }}>
                    <LinearProgress variant="determinate" value={file.progress} />
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {status !== 'idle' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {status === 'uploading' && (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {uploadingMessage}
                </Typography>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  {successMessage}
                </Typography>
              </>
            )}
            {status === 'error' && (
              <>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  {errorMessage}
                </Typography>
              </>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadClick}
          disabled={isUploading || files.length === 0 || files.every((f) => f.status !== 'ready') || disabled}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudDoneIcon />}
          sx={{ ml: 'auto' }}
        >
          {isUploading ? 'Загрузка...' : 'Загрузить'}
        </Button>
      </Box>
    </Paper>
  );
};
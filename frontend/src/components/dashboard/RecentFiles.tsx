import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import {
  Description as DocIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Slideshow as PresentationIcon,
  MoreVert as MoreIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

// Примеры файлов
const mockFiles = [
  {
    id: 'file-1',
    title: 'Протокол собрания от 15.04.2023',
    file_type: 'document',
    created_at: '2023-04-15T10:30:00Z',
    owner_details: {
      full_name: 'Иванов И.И.'
    }
  },
  {
    id: 'file-2',
    title: 'Презентация годового отчета',
    file_type: 'presentation',
    created_at: '2023-04-12T14:20:00Z',
    owner_details: {
      full_name: 'Петров П.П.'
    }
  },
  {
    id: 'file-3',
    title: 'Руководство по оказанию первой помощи',
    file_type: 'pdf',
    created_at: '2023-04-10T09:15:00Z',
    owner_details: {
      full_name: 'Сидорова А.В.'
    }
  },
  {
    id: 'file-4',
    title: 'Снимок КТ Пациента',
    file_type: 'image',
    created_at: '2023-04-08T16:45:00Z',
    owner_details: {
      full_name: 'Козлов Д.М.'
    }
  },
];

/**
 * Компонент для отображения недавних файлов на дашборде
 */
const RecentFiles: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Получение иконки в зависимости от типа файла
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return <DocIcon />;
      case 'image':
        return <ImageIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'presentation':
        return <PresentationIcon />;
      case 'video':
        return <VideoIcon />;
      case 'audio':
        return <AudioIcon />;
      default:
        return <FileIcon />;
    }
  };

  // Получение цвета фона для аватара в зависимости от типа файла
  const getAvatarBgColor = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return theme.palette.primary.light;
      case 'image':
        return theme.palette.info.light;
      case 'pdf':
        return theme.palette.error.light;
      case 'presentation':
        return theme.palette.warning.light;
      case 'video':
        return theme.palette.success.light;
      case 'audio':
        return theme.palette.secondary.light;
      default:
        return theme.palette.grey[300];
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Обработчик перехода к файлу
  const handleFileClick = (fileId: string) => {
    navigate(`/files/${fileId}`);
  };

  // Обработчик перехода к списку всех файлов
  const handleViewAllClick = () => {
    navigate('/files');
  };

  return (
    <Box>
      <List sx={{ width: '100%' }}>
        {mockFiles.map((file) => (
          <ListItem
            key={file.id}
            alignItems="flex-start"
            onClick={() => handleFileClick(file.id)}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              mb: 1,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: getAvatarBgColor(file.file_type),
                  color: 'white',
                }}
              >
                {getFileIcon(file.file_type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="subtitle2"
                  component="span"
                  sx={{
                    display: 'block',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.title}
                </Typography>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {file.owner_details.full_name}
                  </Typography>
                  {' • '}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {formatDate(file.created_at)}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={file.file_type}
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        height: 20,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          variant="text"
          color="primary"
          endIcon={<ArrowIcon />}
          onClick={handleViewAllClick}
        >
          Все файлы
        </Button>
      </Box>
    </Box>
  );
};

export default RecentFiles;
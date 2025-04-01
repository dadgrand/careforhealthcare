import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudDownload as DownloadIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Share as ShareIcon,
  FileCopy as CopyIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { FileItem, FolderItem } from '../../types/file';
import { fileActions } from '../../store/file/fileSlice';
import FileDetailsDialog from './FileDetailsDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import RenameDialog from './RenameDialog';
import ShareDialog from './ShareDialog';
import VerificationDialog from './VerificationDialog';

interface FileListProps {
  folders: FolderItem[];
  files: FileItem[];
  loading?: boolean;
}

const FileList: React.FC<FileListProps> = ({ folders, files, loading = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Состояние выбранных элементов
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Состояние меню действий
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [activeItemType, setActiveItemType] = useState<'file' | 'folder' | null>(null);

  // Состояние диалогов
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  // Активный элемент
  const activeItem = activeItemType === 'file'
    ? files.find(file => file.id === activeItemId)
    : folders.find(folder => folder.id === activeItemId);

  // Обработчики выбора элементов
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = [
        ...folders.map(folder => folder.id),
        ...files.map(file => file.id)
      ];
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Обработчики контекстного меню
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    id: number,
    type: 'file' | 'folder'
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveItemId(id);
    setActiveItemType(type);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Обработчики действий с файлами и папками
  const handleFolderClick = (folderId: number) => {
    navigate(`/files/${folderId}`);
  };

  const handleFileClick = (fileId: number) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.previewUrl) {
      window.open(file.previewUrl, '_blank');
    } else {
      setActiveItemId(fileId);
      setActiveItemType('file');
      setDetailsDialogOpen(true);
    }
  };

  const handleDownload = () => {
    if (activeItemId && activeItemType === 'file') {
      dispatch(fileActions.downloadFile(activeItemId));
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (activeItemId && activeItemType) {
      if (activeItemType === 'file') {
        dispatch(fileActions.deleteFile(activeItemId));
      } else {
        dispatch(fileActions.deleteFolder(activeItemId));
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleRename = () => {
    setRenameDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmRename = (newName: string) => {
    if (activeItemId && activeItemType) {
      if (activeItemType === 'file') {
        dispatch(fileActions.renameFile({ id: activeItemId, name: newName }));
      } else {
        dispatch(fileActions.renameFolder({ id: activeItemId, name: newName }));
      }
    }
    setRenameDialogOpen(false);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handleVerify = () => {
    setVerificationDialogOpen(true);
    handleMenuClose();
  };

  // Получение иконки в зависимости от типа файла
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon color="primary" />;
      case 'doc':
      case 'docx':
      case 'txt':
        return <DocIcon color="info" />;
      default:
        return <FileIcon />;
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < (folders.length + files.length)
                  }
                  checked={
                    (folders.length + files.length) > 0 &&
                    selectedItems.length === (folders.length + files.length)
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Изменен</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell>Владелец</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Отображение папок */}
            {folders.map((folder) => (
              <TableRow
                key={`folder-${folder.id}`}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  cursor: 'pointer',
                }}
                onClick={() => handleFolderClick(folder.id)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    color="primary"
                    checked={selectedItems.includes(folder.id)}
                    onChange={() => handleSelectItem(folder.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {folder.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {folder.modifiedAt ?
                    format(new Date(folder.modifiedAt), 'dd MMM yyyy, HH:mm', { locale: ru }) :
                    '—'
                  }
                </TableCell>
                <TableCell>—</TableCell>
                <TableCell>{folder.owner?.name || '—'}</TableCell>
                <TableCell>
                  {folder.isPrivate ? (
                    <Tooltip title="Приватная папка">
                      <LockIcon fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Общая папка">
                      <LockOpenIcon fontSize="small" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    aria-label="Действия"
                    onClick={(e) => handleMenuOpen(e, folder.id, 'folder')}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Отображение файлов */}
            {files.map((file) => (
              <TableRow
                key={`file-${file.id}`}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  cursor: 'pointer',
                }}
                onClick={() => handleFileClick(file.id)}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    color="primary"
                    checked={selectedItems.includes(file.id)}
                    onChange={() => handleSelectItem(file.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getFileIcon(file.type)}
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2">
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.type.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {file.modifiedAt ?
                    format(new Date(file.modifiedAt), 'dd MMM yyyy, HH:mm', { locale: ru }) :
                    '—'
                  }
                </TableCell>
                <TableCell>
                  {file.size ? (
                    file.size < 1024 ?
                      `${file.size} Б` :
                      file.size < 1024 * 1024 ?
                        `${(file.size / 1024).toFixed(1)} КБ` :
                        `${(file.size / (1024 * 1024)).toFixed(1)} МБ`
                  ) : '—'}
                </TableCell>
                <TableCell>{file.owner?.name || '—'}</TableCell>
                <TableCell>
                  {file.verified ? (
                    <Tooltip title="Верифицирован">
                      <CheckIcon fontSize="small" color="success" />
                    </Tooltip>
                  ) : file.isPrivate ? (
                    <Tooltip title="Приватный файл">
                      <LockIcon fontSize="small" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Общий файл">
                      <LockOpenIcon fontSize="small" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    aria-label="Действия"
                    onClick={(e) => handleMenuOpen(e, file.id, 'file')}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Строка загрузки */}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            )}

            {/* Пустая таблица */}
            {!loading && folders.length === 0 && files.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    Нет файлов или папок для отображения
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Контекстное меню */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {activeItemType === 'file' && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Скачать</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          setDetailsDialogOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Свойства</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Переименовать</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Поделиться</ListItemText>
        </MenuItem>

        {activeItemType === 'file' && (
          <MenuItem onClick={handleVerify}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Верифицировать</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалоги */}
      {activeItem && (
        <>
          <FileDetailsDialog
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            item={activeItem}
            type={activeItemType as 'file' | 'folder'}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            title={`Удалить ${activeItemType === 'file' ? 'файл' : 'папку'}`}
            content={`Вы уверены, что хотите удалить ${activeItemType === 'file' ? 'файл' : 'папку'} "${activeItem.name}"?`}
          />

          <RenameDialog
            open={renameDialogOpen}
            onClose={() => setRenameDialogOpen(false)}
            onConfirm={handleConfirmRename}
            initialName={activeItem.name}
            title={`Переименовать ${activeItemType === 'file' ? 'файл' : 'папку'}`}
          />

          <ShareDialog
            open={shareDialogOpen}
            onClose={() => setShareDialogOpen(false)}
            item={activeItem}
            type={activeItemType as 'file' | 'folder'}
          />

          {activeItemType === 'file' && (
            <VerificationDialog
              open={verificationDialogOpen}
              onClose={() => setVerificationDialogOpen(false)}
              fileId={activeItemId as number}
              fileName={activeItem.name}
            />
          )}
        </>
      )}
    </>
  );
};

export default FileList;
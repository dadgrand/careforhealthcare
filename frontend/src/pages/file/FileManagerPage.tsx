import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Breadcrumbs,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  CreateNewFolder as CreateNewFolderIcon,
  UploadFile as UploadFileIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/PageHeader';
import { RootState } from '../../store';
import { fileActions } from '../../store/file/fileSlice';
import FileList from '../../components/fileManager/FileList';
import FileGrid from '../../components/fileManager/FileGrid';
import FileUploadDialog from '../../components/fileManager/FileUploadDialog';
import CreateFolderDialog from '../../components/fileManager/CreateFolderDialog';
import FileBreadcrumb from '../../components/fileManager/FileBreadcrumb';
import { FileItem, FolderPath } from '../../types/file';
import ErrorAlert from '../../components/common/ErrorAlert';

const FileManagerPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();

  const {
    files,
    folders,
    currentFolder,
    breadcrumbs,
    loading,
    error
  } = useSelector((state: RootState) => state.file);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);

  // Загрузка файлов и папок при изменении folderId
  useEffect(() => {
    if (folderId) {
      dispatch(fileActions.fetchFolderContent(Number(folderId)));
    } else {
      dispatch(fileActions.fetchRootContent());
    }
  }, [dispatch, folderId]);

  // Обработчики действий
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    if (folderId) {
      dispatch(fileActions.fetchFolderContent(Number(folderId)));
    } else {
      dispatch(fileActions.fetchRootContent());
    }
  };

  const handleFolderCreate = (folderName: string) => {
    const parentId = folderId ? Number(folderId) : null;
    dispatch(fileActions.createFolder({ name: folderName, parentId }));
    setCreateFolderDialogOpen(false);
  };

  const handleFileUpload = (files: File[]) => {
    const parentId = folderId ? Number(folderId) : null;
    dispatch(fileActions.uploadFiles({ files, parentId }));
    setUploadDialogOpen(false);
  };

  // Фильтрация элементов по поисковому запросу
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !files.length && !folders.length) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Файловый менеджер" />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <PageHeader title="Файловый менеджер" />
        <ErrorAlert message={error} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader title="Файловый менеджер" />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <FileBreadcrumb
              breadcrumbs={breadcrumbs}
              currentFolder={currentFolder}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Tooltip title="Создать папку">
                <IconButton
                  color="primary"
                  onClick={() => setCreateFolderDialogOpen(true)}
                >
                  <CreateNewFolderIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Загрузить файл">
                <IconButton
                  color="primary"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Обновить">
                <IconButton color="default" onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={viewMode === 'list' ? 'Режим сетки' : 'Режим списка'}>
                <IconButton
                  color="default"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  {viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Поиск файлов и папок..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'list' ? (
        <FileList
          folders={filteredFolders}
          files={filteredFiles}
          loading={loading}
        />
      ) : (
        <FileGrid
          folders={filteredFolders}
          files={filteredFiles}
          loading={loading}
        />
      )}

      {/* Диалоги */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
      />

      <CreateFolderDialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        onCreate={handleFolderCreate}
      />
    </Container>
  );
};

export default FileManagerPage;
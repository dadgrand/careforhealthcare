import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridSortModel,
  GridFilterModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  ruRU,
} from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Пользовательский тулбар
function CustomToolbar({
  onAdd,
  onRefresh,
  addButtonLabel = 'Добавить',
  searchText,
  onSearchChange,
  showAddButton = true,
}: {
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  showAddButton?: boolean;
}) {
  return (
    <GridToolbarContainer sx={{ p: 2, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{
            fileName: 'data-export',
            delimiter: ';',
            utf8WithBom: true,
          }}
        />
        {onRefresh && (
          <Tooltip title="Обновить данные">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {onSearchChange && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Поиск..."
            value={searchText || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange('')}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        )}

        {showAddButton && onAdd && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>
    </GridToolbarContainer>
  );
}

// Пользовательский NoRowsOverlay
function CustomNoRowsOverlay({ message = 'Нет данных для отображения' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 2,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

// Пропсы для DataTable
interface DataTableProps {
  columns: GridColDef[];
  rows: any[];
  loading?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onSearchChange?: (searchText: string) => void;
  initialSortModel?: GridSortModel;
  initialFilterModel?: GridFilterModel;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  serverPagination?: boolean;
  addButtonLabel?: string;
  showAddButton?: boolean;
  noRowsMessage?: string;
  sx?: any;
  title?: string;
  height?: string | number;
  checkboxSelection?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  disableSelectionOnClick?: boolean;
  disableColumnFilter?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  hideFooter?: boolean;
  autoHeight?: boolean;
  searchText?: string;
}

/**
 * Универсальный компонент таблицы данных с пагинацией, сортировкой и фильтрацией
 */
export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  onRowClick,
  onAdd,
  onRefresh,
  onSearchChange,
  initialSortModel,
  initialFilterModel,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  rowCount,
  onPageChange,
  onPageSizeChange,
  serverPagination = false,
  addButtonLabel,
  showAddButton = true,
  noRowsMessage,
  sx,
  title,
  height = 500,
  checkboxSelection = false,
  onSelectionChange,
  disableSelectionOnClick = false,
  disableColumnFilter = false,
  disableColumnSelector = false,
  disableDensitySelector = false,
  hideFooter = false,
  autoHeight = false,
  searchText,
}) => {
  const theme = useTheme();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(initialSortModel || []);
  const [filterModel, setFilterModel] = useState<GridFilterModel>(initialFilterModel || { items: [] });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Обработчик изменения пагинации
  const handlePaginationModelChange = (newModel: any) => {
    setPaginationModel(newModel);

    if (onPageChange) {
      onPageChange(newModel.page);
    }

    if (onPageSizeChange) {
      onPageSizeChange(newModel.pageSize);
    }
  };

  // Обработчик изменения сортировки
  const handleSortModelChange = (newModel: any) => {
    setSortModel(newModel);
  };

  // Обработчик изменения фильтров
  const handleFilterModelChange = (newModel: any) => {
    setFilterModel(newModel);
  };

  // Обработчик изменения выбранных строк
  const handleSelectionChange = (newSelection: any) => {
    const selectedIds = newSelection;
    const selectedItems = rows.filter((row) => selectedIds.includes(row.id));
    setSelectedRows(selectedItems);

    if (onSelectionChange) {
      onSelectionChange(selectedItems);
    }
  };

  // Обновляем стейт при изменении пропсов
  useEffect(() => {
    if (initialSortModel) {
      setSortModel(initialSortModel);
    }
  }, [initialSortModel]);

  useEffect(() => {
    if (initialFilterModel) {
      setFilterModel(initialFilterModel);
    }
  }, [initialFilterModel]);

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        ...sx,
      }}
    >
      {title && (
        <>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        rowCount={rowCount || rows.length}
        paginationMode={serverPagination ? 'server' : 'client'}
        sortingMode={serverPagination ? 'server' : 'client'}
        filterMode={serverPagination ? 'server' : 'client'}
        onRowClick={onRowClick}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={handleSelectionChange}
        disableRowSelectionOnClick={disableSelectionOnClick}
        disableColumnFilter={disableColumnFilter}
        disableColumnSelector={disableColumnSelector}
        disableDensitySelector={disableDensitySelector}
        hideFooter={hideFooter}
        autoHeight={autoHeight}
        sx={{
          height: autoHeight ? 'auto' : height,
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
          },
        }}
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        slotProps={{
          toolbar: {
            onAdd,
            onRefresh,
            addButtonLabel,
            searchText,
            onSearchChange,
            showAddButton,
          },
          noRowsOverlay: {
            message: noRowsMessage,
          },
        }}
      />
    </Paper>
  );
};
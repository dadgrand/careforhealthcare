import React, { ReactNode } from 'react';
import {
  Box,
  Breadcrumbs,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Тип для хлебных крошек
export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  backButton?: {
    to: string;
    label?: string;
  };
  helpText?: string;
}

/**
 * Компонент заголовка страницы с хлебными крошками и действиями
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  backButton,
  helpText,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return isLast || !item.link ? (
                <Typography
                  key={index}
                  color="text.primary"
                  variant="body2"
                >
                  {item.label}
                </Typography>
              ) : (
                <Typography
                  key={index}
                  component={RouterLink}
                  to={item.link}
                  color="inherit"
                  variant="body2"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isSmallScreen ? 'flex-start' : 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isSmallScreen ? 2 : 0 }}>
          {backButton && (
            <Button
              component={RouterLink}
              to={backButton.to}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="small"
              sx={{ mr: 2 }}
            >
              {backButton.label || 'Назад'}
            </Button>
          )}

          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {helpText && (
            <Tooltip title={helpText} arrow>
              <IconButton size="small" sx={{ ml: 1, color: 'primary.main' }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: isSmallScreen ? '100%' : 'auto',
              justifyContent: isSmallScreen ? 'flex-end' : 'flex-start',
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  );
};
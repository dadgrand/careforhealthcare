import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Chip,
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { RootState } from '../../store';
import { newsActions } from '../../store/news/newsSlice';
import { NewsItem, NewsCategory } from '../../types/news';
import PublicPageHeader from '../../components/layout/PublicPageHeader';
import NewsletterSubscribe from '../../components/news/NewsletterSubscribe';

const NewsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    news,
    categories,
    featuredNews,
    loading,
    error,
    pagination
  } = useSelector((state: RootState) => state.news);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Загрузка новостей и категорий
  useEffect(() => {
    dispatch(newsActions.fetchCategories());
    dispatch(newsActions.fetchFeaturedNews());
  }, [dispatch]);

  useEffect(() => {
    dispatch(newsActions.fetchNews({
      page,
      limit: 9,
      search: searchQuery,
      categoryId: selectedCategory
    }));
  }, [dispatch, page, searchQuery, selectedCategory]);

  // Обработчики действий
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleNewsClick = (id: number) => {
    navigate(`/news/${id}`);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  return (
    <Box>
      <PublicPageHeader />

      <Box sx={{ backgroundColor: theme.palette.background.default, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Новости и события
          </Typography>

          {/* Блок поиска и фильтров */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Поиск новостей..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      clickable
                      color={selectedCategory === category.id ? 'primary' : 'default'}
                      onClick={() => handleCategoryClick(category.id)}
                      icon={<TagIcon />}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Главные новости */}
          {!searchQuery && !selectedCategory && page === 1 && featuredNews.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Главные новости
              </Typography>

              <Grid container spacing={3}>
                {featuredNews.map((newsItem) => (
                  <Grid item xs={12} md={4} key={newsItem.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 5
                        }
                      }}
                      onClick={() => handleNewsClick(newsItem.id)}
                    >
                      {newsItem.imageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={newsItem.imageUrl}
                          alt={newsItem.title}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(newsItem.publishedAt)}
                          </Typography>

                          {newsItem.category && (
                            <>
                              <Box sx={{ mx: 1, bgcolor: 'text.disabled', width: 4, height: 4, borderRadius: '50%' }} />
                              <Chip
                                label={newsItem.category.name}
                                size="small"
                                color="primary"
                                sx={{ height: 20 }}
                              />
                            </>
                          )}
                        </Box>

                        <Typography variant="h6" gutterBottom>
                          {newsItem.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {newsItem.excerpt}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4 }} />
            </Box>
          )}

          {/* Список всех новостей */}
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedCategory
                ? `Новости: ${categories.find(c => c.id === selectedCategory)?.name}`
                : searchQuery
                  ? `Результаты поиска: ${searchQuery}`
                  : 'Все новости'
              }
            </Typography>

            {loading && news.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : news.length > 0 ? (
              <>
                <Grid container spacing={3}>
                  {news.map((newsItem) => (
                    <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 3
                          }
                        }}
                        onClick={() => handleNewsClick(newsItem.id)}
                      >
                        {newsItem.imageUrl && (
                          <CardMedia
                            component="img"
                            height="160"
                            image={newsItem.imageUrl}
                            alt={newsItem.title}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(newsItem.publishedAt)}
                            </Typography>

                            {newsItem.category && (
                              <>
                                <Box sx={{ mx: 1, bgcolor: 'text.disabled', width: 3, height: 3, borderRadius: '50%' }} />
                                <Chip
                                  label={newsItem.category.name}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20 }}
                                />
                              </>
                            )}
                          </Box>

                          <Typography variant="h6" gutterBottom fontSize={isMobile ? '1rem' : '1.25rem'}>
                            {newsItem.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {newsItem.excerpt}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            ) : (
              <Typography sx={{ textAlign: 'center', my: 4 }}>
                Новостей не найдено
              </Typography>
            )}
          </Box>

          {/* Подписка на новости */}
          <Box sx={{ mt: 6 }}>
            <NewsletterSubscribe />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default NewsPage;
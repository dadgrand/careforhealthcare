import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Link,
  Avatar,
  IconButton,
  Breadcrumbs,
} from '@mui/material';
import {
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Print as PrintIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { RootState } from '../../store';
import { newsActions } from '../../store/news/newsSlice';
import PublicPageHeader from '../../components/layout/PublicPageHeader';
import NewsletterSubscribe from '../../components/news/NewsletterSubscribe';
import ErrorAlert from '../../components/common/ErrorAlert';
import ShareDialog from '../../components/common/ShareDialog';

const NewsDetailPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    currentNews,
    relatedNews,
    loading,
    error
  } = useSelector((state: RootState) => state.news);

  const [bookmarked, setBookmarked] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Загрузка новости по ID
  useEffect(() => {
    if (id) {
      dispatch(newsActions.fetchNewsById(Number(id)));
    }
  }, [dispatch, id]);

  // Загрузка рекомендуемых новостей
  useEffect(() => {
    if (currentNews) {
      dispatch(newsActions.fetchRelatedNews({
        id: currentNews.id,
        categoryId: currentNews.category?.id,
      }));
    }
  }, [dispatch, currentNews]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  // Форматирование времени чтения
  const formatReadingTime = (minutes: number) => {
    if (minutes < 1) return 'Менее 1 мин. чтения';
    return `${minutes} мин. чтения`;
  };

  // Обработчики действий
  const handleBack = () => {
    navigate(-1);
  };

  const handleBookmarkToggle = () => {
    setBookmarked(!bookmarked);
    // В реальном приложении здесь будет запрос к API
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !currentNews) {
    return (
      <Box>
        <PublicPageHeader />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <PublicPageHeader />
        <Container sx={{ py: 4 }}>
          <ErrorAlert message={error} />
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Вернуться к списку новостей
          </Button>
        </Container>
      </Box>
    );
  }

  if (!currentNews) {
    return (
      <Box>
        <PublicPageHeader />
        <Container sx={{ py: 4 }}>
          <Typography variant="h5">Новость не найдена</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Вернуться к списку новостей
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <PublicPageHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Хлебные крошки */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Главная
          </Link>
          <Link component={RouterLink} to="/news" color="inherit">
            Новости
          </Link>
          {currentNews.category && (
            <Link
              component={RouterLink}
              to={`/news?category=${currentNews.category.id}`}
              color="inherit"
            >
              {currentNews.category.name}
            </Link>
          )}
          <Typography color="text.primary">{currentNews.title}</Typography>
        </Breadcrumbs>

        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 3 }}
          onClick={handleBack}
        >
          Назад к новостям
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Основное содержимое новости */}
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {currentNews.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(currentNews.publishedAt)}
                  </Typography>
                </Box>

                {currentNews.category && (
                  <Chip
                    label={currentNews.category.name}
                    size="small"
                    color="primary"
                  />
                )}

                {currentNews.readingTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatReadingTime(currentNews.readingTime)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {currentNews.imageUrl && (
                <Box
                  component="img"
                  src={currentNews.imageUrl}
                  alt={currentNews.title}
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    mb: 3,
                    maxHeight: 500,
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* Социальные кнопки */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <IconButton onClick={handleShare}>
                  <ShareIcon />
                </IconButton>

                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>

                <IconButton onClick={handleBookmarkToggle}>
                  {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Содержимое новости */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" component="div">
                  <div dangerouslySetInnerHTML={{ __html: currentNews.content }} />
                </Typography>
              </Box>

              {currentNews.tags && currentNews.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Теги:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentNews.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        component={RouterLink}
                        to={`/news?tag=${tag}`}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {currentNews.author && (
                <Box sx={{ mt: 4, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={currentNews.author.avatarUrl}
                      alt={currentNews.author.name}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    >
                      {currentNews.author.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {currentNews.author.name}
                      </Typography>
                      {currentNews.author.position && (
                        <Typography variant="body2" color="text.secondary">
                          {currentNews.author.position}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {currentNews.author.bio && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {currentNews.author.bio}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Раздел рекомендуемых новостей */}
            {relatedNews.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom>
                  Вам также может быть интересно
                </Typography>

                <Grid container spacing={2}>
                  {relatedNews.map((newsItem) => (
                    <Grid item xs={12} sm={6} key={newsItem.id}>
                      <Card>
                        <CardActionArea
                          component={RouterLink}
                          to={`/news/${newsItem.id}`}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              height: '100%'
                            }}
                          >
                            {newsItem.imageUrl && (
                              <Box
                                component="img"
                                src={newsItem.imageUrl}
                                alt={newsItem.title}
                                sx={{
                                  width: { xs: '100%', sm: 120 },
                                  height: { xs: 160, sm: '100%' },
                                  objectFit: 'cover',
                                }}
                              />
                            )}
                            <CardContent sx={{ flex: '1 0 auto' }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {formatDate(newsItem.publishedAt)}
                              </Typography>
                              <Typography variant="subtitle1" component="div">
                                {newsItem.title}
                              </Typography>
                            </CardContent>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Боковая панель */}
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Подписка на новости */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <NewsletterSubscribe compact />
                </CardContent>
              </Card>

              {/* Популярные новости */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Популярные новости
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {/* Здесь можно вывести список популярных новостей */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3].map((item) => (
                      <Box key={item} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="h5"
                          sx={{
                            mr: 2,
                            color: 'text.secondary',
                            fontWeight: 'bold'
                          }}
                        >
                          {item}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Заголовок популярной новости {item}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            10 августа 2023
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Диалог поделиться */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title={currentNews.title}
        url={window.location.href}
      />
    </Box>
  );
};

export default NewsDetailPage;
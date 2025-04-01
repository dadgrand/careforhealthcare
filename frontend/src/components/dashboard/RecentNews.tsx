import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  Avatar,
  Grid,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LabelOutlined as LabelIcon,
} from '@mui/icons-material';

// Примеры новостей
const mockNews = [
  {
    id: 'news-1',
    title: 'Обновление протокола лечения пациентов с COVID-19',
    excerpt: 'В связи с новыми исследованиями и рекомендациями ВОЗ, вводится обновленный протокол лечения пациентов с коронавирусной инфекцией.',
    category_details: { name: 'Протоколы' },
    featured_image: 'https://source.unsplash.com/random/350x200/?medicine',
    created_at: '2023-04-15T10:30:00Z',
    author_details: {
      full_name: 'Иванов И.И.',
      avatar: null,
    },
    tags: [
      { name: 'COVID-19' },
      { name: 'Протоколы' },
    ],
    slug: 'covid-19-protocol-update',
  },
  {
    id: 'news-2',
    title: 'Семинар по новым методам диагностики',
    excerpt: 'Приглашаем всех сотрудников на семинар, который состоится 20 апреля. Тема: "Инновационные методы диагностики в современной медицине".',
    category_details: { name: 'События' },
    featured_image: 'https://source.unsplash.com/random/350x200/?seminar',
    created_at: '2023-04-12T14:20:00Z',
    author_details: {
      full_name: 'Петрова А.С.',
      avatar: null,
    },
    tags: [
      { name: 'Обучение' },
      { name: 'Семинар' },
    ],
    slug: 'diagnostic-methods-seminar',
  },
  {
    id: 'news-3',
    title: 'Результаты ежегодного отчета по качеству медицинской помощи',
    excerpt: 'Опубликованы результаты ежегодного отчета по качеству оказания медицинской помощи в нашем учреждении.',
    category_details: { name: 'Отчеты' },
    featured_image: 'https://source.unsplash.com/random/350x200/?report',
    created_at: '2023-04-10T09:15:00Z',
    author_details: {
      full_name: 'Сидоров П.В.',
      avatar: null,
    },
    tags: [
      { name: 'Качество' },
      { name: 'Отчеты' },
    ],
    slug: 'annual-quality-report',
  },
];

/**
 * Компонент для отображения последних новостей на дашборде
 */
const RecentNews: React.FC = () => {
  const navigate = useNavigate();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Обработчик перехода к новости
  const handleNewsClick = (slug: string) => {
    navigate(`/news/${slug}`);
  };

  // Обработчик перехода к списку всех новостей
  const handleViewAllClick = () => {
    navigate('/news');
  };

  return (
    <Box>
      {mockNews.map((news, index) => (
        <Card
          key={news.id}
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: index < mockNews.length - 1 ? 2 : 0,
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3,
            },
            borderRadius: 2,
            overflow: 'hidden',
          }}
          onClick={() => handleNewsClick(news.slug)}
        >
          {news.featured_image && (
            <CardMedia
              component="img"
              sx={{
                width: { xs: '100%', sm: 150 },
                height: { xs: 140, sm: 'auto' },
                objectFit: 'cover',
              }}
              image={news.featured_image}
              alt={news.title}
            />
          )}
          <CardContent sx={{ flex: 1, p: 2 }}>
            <Box sx={{ mb: 1 }}>
              <Chip
                label={news.category_details.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary" component="span">
                {formatDate(news.created_at)}
              </Typography>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom>
              {news.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {news.excerpt}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 24, height: 24, mr: 1 }}
                  alt={news.author_details.full_name}
                  src={news.author_details.avatar || undefined}
                >
                  {news.author_details.full_name.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {news.author_details.full_name}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                {news.tags.slice(0, 2).map((tag) => (
                  <Chip
                    key={tag.name}
                    label={tag.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="text"
          color="primary"
          endIcon={<ArrowIcon />}
          onClick={handleViewAllClick}
        >
          Все новости
        </Button>
      </Box>
    </Box>
  );
};

export default RecentNews;
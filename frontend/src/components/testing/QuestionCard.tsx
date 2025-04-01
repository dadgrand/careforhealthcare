import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Flag as FlagIcon,
  FlagOutlined as FlagOutlinedIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { Question, QuestionType, UserAnswer } from '../../types/testing';

interface QuestionCardProps {
  question: Question;
  answer: UserAnswer | null;
  onAnswerChange: (answer: UserAnswer) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answer,
  onAnswerChange,
  isFlagged,
  onToggleFlag,
}) => {
  // Обработчики изменения ответов в зависимости от типа вопроса
  const handleSingleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange({
      type: 'single',
      optionId: Number(event.target.value),
    });
  };

  const handleMultipleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = Number(event.target.value);

    if (!answer || answer.type !== 'multiple') {
      onAnswerChange({
        type: 'multiple',
        optionIds: [optionId],
      });
      return;
    }

    const optionIds = [...answer.optionIds];
    if (event.target.checked) {
      if (!optionIds.includes(optionId)) {
        optionIds.push(optionId);
      }
    } else {
      const index = optionIds.indexOf(optionId);
      if (index !== -1) {
        optionIds.splice(index, 1);
      }
    }

    onAnswerChange({
      type: 'multiple',
      optionIds,
    });
  };

  const handleTextAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange({
      type: 'text',
      text: event.target.value,
    });
  };

  // Отображение вопроса в зависимости от типа
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single_choice':
        return renderSingleChoiceQuestion();
      case 'multiple_choice':
        return renderMultipleChoiceQuestion();
      case 'text':
        return renderTextQuestion();
      default:
        return (
          <Typography color="error">
            Неизвестный тип вопроса: {question.type}
          </Typography>
        );
    }
  };

  // Вопрос с одним вариантом ответа
  const renderSingleChoiceQuestion = () => {
    const selectedOptionId = answer && answer.type === 'single' ? answer.optionId : null;

    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Выберите один вариант ответа:</FormLabel>
        <RadioGroup
          value={selectedOptionId !== null ? selectedOptionId.toString() : ''}
          onChange={handleSingleChoiceChange}
        >
          {question.options?.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id.toString()}
              control={<Radio />}
              label={option.text}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  };

  // Вопрос с множественным выбором
  const renderMultipleChoiceQuestion = () => {
    const selectedOptionIds = answer && answer.type === 'multiple' ? answer.optionIds : [];

    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Выберите все подходящие варианты:</FormLabel>
        <FormGroup>
          {question.options?.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={selectedOptionIds.includes(option.id)}
                  value={option.id.toString()}
                  onChange={handleMultipleChoiceChange}
                />
              }
              label={option.text}
            />
          ))}
        </FormGroup>
        {question.minSelections && question.maxSelections && (
          <FormHelperText>
            {`Выберите от ${question.minSelections} до ${question.maxSelections} вариантов`}
          </FormHelperText>
        )}
      </FormControl>
    );
  };

  // Вопрос с текстовым ответом
  const renderTextQuestion = () => {
    const textValue = answer && answer.type === 'text' ? answer.text : '';

    return (
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Ваш ответ"
        value={textValue}
        onChange={handleTextAnswerChange}
        placeholder="Введите ваш ответ здесь..."
      />
    );
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Вопрос {question.orderNumber || ''}
            </Typography>
            <Tooltip title={isFlagged ? "Снять отметку" : "Отметить вопрос"}>
              <IconButton onClick={onToggleFlag} color={isFlagged ? "warning" : "default"}>
                {isFlagged ? <FlagIcon /> : <FlagOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {question.points ? `${question.points} балл(ов)` : ''}
              {question.required && ' • Обязательный вопрос'}
            </Typography>
          </Box>
        }
      />

      <Divider />

      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {question.text}
          </Typography>

          {question.description && (
            <Typography variant="body2" color="text.secondary">
              {question.description}
            </Typography>
          )}

          {question.imageUrl && (
            <Box
              component="img"
              src={question.imageUrl}
              alt="Изображение к вопросу"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                my: 2
              }}
            />
          )}
        </Box>

        {renderQuestionContent()}

        {question.hint && (
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InfoIcon sx={{ mr: 1, mt: 0.3 }} />
              <Typography variant="body2">
                <strong>Подсказка:</strong> {question.hint}
              </Typography>
            </Box>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
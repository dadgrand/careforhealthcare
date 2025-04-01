import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { RootState } from '../../store';
import { userApi } from '../../services/api/userApi';
import { fileActions } from '../../store/file/fileSlice';
import { User } from '../../types/user';
import { VerificationStatus } from '../../types/file';

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({
  open,
  onClose,
  fileId,
  fileName,
}) => {
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { verifications } = useSelector((state: RootState) => state.file);
  const currentVerification = verifications.find(v => v.fileId === fileId);

  // Шаги процесса верификации
  const steps = ['Выбор верификаторов', 'Добавление комментария', 'Проверка и отправка'];

  // Загрузка пользователей для верификации
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await userApi.getUsers();
        setUsers(response);
      } catch (err) {
        setError('Не удалось загрузить список пользователей');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();

      // Если верификация уже существует, заполним поля данными
      if (currentVerification) {
        setSelectedUsers(currentVerification.verifiers.map(v => v.id));
        setComment(currentVerification.comment || '');
      }
    }
  }, [open, fileId, currentVerification]);

  // Обработчики действий
  const handleUserSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleUserSelect = (event: SelectChangeEvent<typeof selectedUsers>) => {
    const { value } = event.target;
    setSelectedUsers(
      typeof value === 'string' ? value.split(',').map(Number) : value,
    );
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) {
      setError('Необходимо выбрать хотя бы одного верификатора');
      return;
    }

    dispatch(fileActions.requestVerification({
      fileId,
      verifierIds: selectedUsers,
      comment,
    }));

    onClose();
  };

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.position && user.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Выбранные пользователи
  const selectedUserObjects = users.filter(user =>
    selectedUsers.includes(user.id)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Верификация документа
      </DialogTitle>

      <DialogContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Файл: {fileName}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Выберите пользователей для верификации документа
            </Typography>

            <TextField
              fullWidth
              label="Поиск пользователей"
              value={searchQuery}
              onChange={handleUserSearch}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="verifiers-select-label">Верификаторы</InputLabel>
              <Select
                labelId="verifiers-select-label"
                multiple
                value={selectedUsers}
                onChange={handleUserSelect}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedUserObjects.map((user) => (
                      <Chip
                        key={user.id}
                        label={`${user.lastName} ${user.firstName}`}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
                label="Верификаторы"
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mx: 'auto', my: 1 }} />
                  </MenuItem>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                        <span>
                          {user.lastName} {user.firstName}
                          {user.position && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              {user.position}
                            </Typography>
                          )}
                        </span>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    Пользователи не найдены
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {selectedUsers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Выбранные верификаторы:
                </Typography>
                <List dense>
                  {selectedUserObjects.map((user) => (
                    <ListItem key={user.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.lastName} ${user.firstName}`}
                        secondary={user.position || user.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Добавьте комментарий (необязательно)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Комментарий"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Опишите, что должны проверить верификаторы"
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Проверьте информацию перед отправкой
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Файл для верификации:</Typography>
              <Typography>{fileName}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Выбранные верификаторы:</Typography>
              <List dense>
                {selectedUserObjects.map((user) => (
                  <ListItem key={user.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.lastName} ${user.firstName}`}
                      secondary={user.position || user.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {comment && (
              <Box>
                <Typography variant="subtitle1">Комментарий:</Typography>
                <Typography>{comment}</Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>

        <Box sx={{ flex: '1 1 auto' }} />

        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Назад
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">
            Далее
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SendIcon />}
            color="primary"
          >
            Отправить на верификацию
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDialog;
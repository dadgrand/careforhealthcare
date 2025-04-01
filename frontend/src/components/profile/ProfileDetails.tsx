import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import { User } from '../../types/user';

interface ProfileDetailsProps {
  profile: User;
  readonly?: boolean;
  onUpdate: (data: Partial<User>) => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  readonly = false,
  onUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    middleName: profile.middleName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    position: profile.position || '',
    department: profile.department || null,
    birthDate: profile.birthDate ? new Date(profile.birthDate) : null,
    gender: profile.gender || '',
    address: profile.address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, birthDate: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      middleName: profile.middleName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      position: profile.position || '',
      department: profile.department || null,
      birthDate: profile.birthDate ? new Date(profile.birthDate) : null,
      gender: profile.gender || '',
      address: profile.address || '',
    });
    setEditMode(false);
  };

  return (
    <Paper elevation={0}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Личная информация</Typography>
          {!readonly && !editMode && (
            <Button
              variant="outlined"
              onClick={() => setEditMode(true)}
            >
              Редактировать
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Отчество"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Должность"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editMode || readonly}>
                <InputLabel id="department-label">Отделение</InputLabel>
                <Select
                  labelId="department-label"
                  name="department"
                  value={formData.department?.id?.toString() || ''}
                  label="Отделение"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>Не выбрано</em>
                  </MenuItem>
                  {/* Здесь будет список отделений из API */}
                  <MenuItem value="1">Кардиология</MenuItem>
                  <MenuItem value="2">Неврология</MenuItem>
                  <MenuItem value="3">Терапия</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дата рождения"
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  disabled={!editMode || readonly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!editMode || readonly}>
                <InputLabel id="gender-label">Пол</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender || ''}
                  label="Пол"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>Не указан</em>
                  </MenuItem>
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editMode || readonly}
              />
            </Grid>

            {editMode && !readonly && (
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ mr: 2 }}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                >
                  Сохранить
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
    </Paper>
  );
};

export default ProfileDetails;
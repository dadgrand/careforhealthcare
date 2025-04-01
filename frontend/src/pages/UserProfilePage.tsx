import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';

import { RootState } from '../../store';
import { userActions } from '../../store/user/userSlice';
import PageHeader from '../../components/PageHeader';
import ProfileDetails from '../../components/profile/ProfileDetails';
import SecuritySettings from '../../components/profile/SecuritySettings';
import NotificationSettings from '../../components/profile/NotificationSettings';
import ActivityHistory from '../../components/profile/ActivityHistory';
import ErrorAlert from '../../components/common/ErrorAlert';
import { User } from '../../types/user';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const UserProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { currentUser, profile, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const isOwnProfile = currentUser?.id === Number(id);

  useEffect(() => {
    if (id) {
      dispatch(userActions.fetchUserProfile(Number(id)));
    }
  }, [dispatch, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    if (profile) {
      dispatch(userActions.updateUserProfile({
        id: profile.id,
        userData: updatedData
      }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!profile) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Профиль не найден</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/dashboard')}
        >
          Вернуться на дашборд
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <PageHeader title="Профиль пользователя" />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="h2" color="primary.contrastText">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm>
                <Typography variant="h4">
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {profile.position || 'Должность не указана'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {profile.department?.name || 'Отделение не указано'}
                </Typography>
              </Grid>
              {isOwnProfile && (
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/profile/${id}/edit`)}
                  >
                    Редактировать профиль
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                icon={<PersonIcon />}
                label="Личная информация"
                {...a11yProps(0)}
              />
              {isOwnProfile && (
                <Tab
                  icon={<SecurityIcon />}
                  label="Безопасность"
                  {...a11yProps(1)}
                />
              )}
              {isOwnProfile && (
                <Tab
                  icon={<NotificationsIcon />}
                  label="Уведомления"
                  {...a11yProps(2)}
                />
              )}
              <Tab
                icon={<HistoryIcon />}
                label="История активности"
                {...a11yProps(isOwnProfile ? 3 : 1)}
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <ProfileDetails
              profile={profile}
              readonly={!isOwnProfile}
              onUpdate={handleProfileUpdate}
            />
          </TabPanel>

          {isOwnProfile && (
            <TabPanel value={activeTab} index={1}>
              <SecuritySettings userId={Number(id)} />
            </TabPanel>
          )}

          {isOwnProfile && (
            <TabPanel value={activeTab} index={2}>
              <NotificationSettings userId={Number(id)} />
            </TabPanel>
          )}

          <TabPanel value={activeTab} index={isOwnProfile ? 3 : 1}>
            <ActivityHistory userId={Number(id)} />
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserProfilePage;
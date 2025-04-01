// Основные типы для пользователей
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role: UserRole;
  department?: number | null;
  specialization?: number | null;
  phone?: string;
  avatar?: string | null;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  department_details?: Department;
  specialization_details?: Specialization;
  full_name: string;
  profile?: UserProfile;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'manager' | 'staff';

export interface UserProfile {
  id: number;
  bio?: string;
  birth_date?: string;
  address?: string;
  position?: string;
  experience_years: number;
  education?: string;
  certificates?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginHistory {
  id: number;
  user: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  login_time: string;
  successful: boolean;
}

// Типы для токенов и аутентификации
export interface AuthTokens {
  access: string;
  refresh: string;
  user_id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface TokenPayload {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

// Типы для файлового менеджера
export interface FileCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FileType = 'document' | 'image' | 'spreadsheet' | 'presentation' | 'pdf' | 'video' | 'audio' | 'other';
export type AccessLevel = 'public' | 'restricted' | 'private';
export type PermissionType = 'view' | 'edit' | 'delete';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface File {
  id: string;
  title: string;
  description?: string;
  file: string;
  file_size: number;
  file_type: FileType;
  mime_type: string;
  category?: number | null;
  access_level: AccessLevel;
  owner: string;
  created_at: string;
  updated_at: string;
  checksum: string;
  category_details?: FileCategory;
  owner_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  access_rights?: FileAccess[];
  verifications?: FileVerification[];
  versions?: FileVersion[];
}

export interface FileAccess {
  id: number;
  file: string;
  user: string;
  permission_type: PermissionType;
  created_at: string;
  updated_at: string;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
}

export interface FileVerification {
  id: number;
  file: string;
  requested_by: string;
  verified_by?: string;
  status: VerificationStatus;
  comment?: string;
  requested_at: string;
  verified_at?: string;
  requested_by_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  verified_by_details?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface FileVersion {
  id: string;
  file: string;
  file_content: string;
  version_number: number;
  created_by: string;
  comment?: string;
  created_at: string;
  created_by_details?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface FileDownloadHistory {
  id: number;
  file: string;
  user: string;
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  file_details?: {
    id: string;
    title: string;
    file_type: FileType;
  };
}

// Типы для модуля новостей
export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  articles_count: number;
}

export interface NewsTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  articles_count: number;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: number | null;
  author: string;
  featured_image?: string;
  status: ArticleStatus;
  is_featured: boolean;
  is_internal: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  category_details?: NewsCategory;
  author_details?: {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
  };
  tags: NewsTag[];
  comments_count: number;
  comments: NewsComment[];
  tag_ids?: number[];
}

export interface NewsComment {
  id: string;
  article: string;
  author: string;
  parent?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  author_details?: {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
  };
  replies?: NewsComment[];
}

export interface NewsView {
  id: number;
  article: string;
  user?: string;
  ip_address: string;
  user_agent?: string;
  viewed_at: string;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  article_details?: {
    id: string;
    title: string;
    slug: string;
  };
}

// Типы для модуля тестирования
export interface TestCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tests_count: number;
}

export type TestStatus = 'draft' | 'published' | 'archived';
export type TestType = 'knowledge' | 'certification' | 'survey' | 'training';
export type QuestionType = 'single' | 'multiple' | 'text' | 'numeric';
export type AttemptStatus = 'in_progress' | 'completed' | 'timed_out' | 'abandoned';
export type AssignmentStatus = 'pending' | 'completed' | 'expired';

export interface Test {
  id: string;
  title: string;
  description?: string;
  category?: number | null;
  author: string;
  status: TestStatus;
  test_type: TestType;
  time_limit: number;
  passing_score: number;
  max_attempts: number;
  randomize_questions: boolean;
  show_answers: boolean;
  is_required: boolean;
  required_departments?: number[];
  required_specializations?: number[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  deadline?: string;
  category_details?: TestCategory;
  author_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  questions_count: number;
  total_points: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  test: string;
  text: string;
  question_type: QuestionType;
  image?: string;
  points: number;
  order: number;
  is_required: boolean;
  explanation?: string;
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

export interface Answer {
  id: string;
  question: string;
  text: string;
  is_correct?: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TestAttempt {
  id: string;
  test: string;
  user: string;
  started_at: string;
  completed_at?: string;
  status: AttemptStatus;
  score: number;
  max_score: number;
  score_percentage: number;
  passed: boolean;
  time_spent: number;
  attempt_number: number;
  test_details?: Test;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  user_answers: UserAnswer[];
}

export interface UserAnswer {
  id: string;
  attempt: string;
  question: string;
  selected_answers?: string[];
  text_answer?: string;
  numeric_answer?: number;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
  updated_at: string;
  question_details?: Question;
}

export interface TestAssignment {
  id: string;
  test: string;
  user: string;
  assigned_by?: string;
  status: AssignmentStatus;
  due_date?: string;
  assigned_at: string;
  completed_at?: string;
  notify_user: boolean;
  message?: string;
  test_details?: Test;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  assigned_by_details?: {
    id: string;
    email: string;
    full_name: string;
  };
}

// Типы для модуля аналитики
export interface PageView {
  id: string;
  user?: string;
  url: string;
  path: string;
  referer?: string;
  ip_address?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device?: string;
  session_id?: string;
  viewed_at: string;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface UserSession {
  id: string;
  user?: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'registration'
  | 'password_change'
  | 'profile_update'
  | 'content_create'
  | 'content_update'
  | 'content_delete'
  | 'file_upload'
  | 'file_download'
  | 'test_start'
  | 'test_complete'
  | 'other';

export interface UserActivity {
  id: string;
  user: string;
  activity_type: ActivityType;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  content_type?: string;
  object_id?: string;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
  };
  activity_type_display: string;
}

export interface DailyStatistics {
  id: number;
  date: string;
  total_views: number;
  unique_visitors: number;
  registered_users: number;
  new_users: number;
  active_users: number;
  average_session_duration: number;
  total_sessions: number;
  files_uploaded: number;
  files_downloaded: number;
  tests_started: number;
  tests_completed: number;
}

export interface UserStatistics {
  id: number;
  user: string;
  last_login?: string;
  login_count: number;
  total_session_duration: number;
  average_session_duration: number;
  total_page_views: number;
  files_uploaded: number;
  files_downloaded: number;
  tests_started: number;
  tests_completed: number;
  tests_passed: number;
  user_details?: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    department?: string;
    specialization?: string;
  };
}

export interface PopularPage {
  id: number;
  url: string;
  title?: string;
  views_count: number;
  unique_visitors: number;
  date: string;
}

// Типы для системных настроек
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export type BackupType = 'full' | 'database' | 'files';
export type BackupStatus = 'in_progress' | 'completed' | 'failed';
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemBackup {
  id: string;
  backup_type: BackupType;
  status: BackupStatus;
  backup_file: string;
  size: number;
  checksum: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  backup_type_display: string;
  status_display: string;
}

export interface SystemLog {
  id: string;
  level: LogLevel;
  module: string;
  message: string;
  stack_trace?: string;
  created_at: string;
  level_display: string;
}

export interface SystemHealth {
  id: number;
  component: string;
  status: HealthStatus;
  details?: string;
  last_checked: string;
  created_at: string;
  status_display: string;
}

// Типы для пагинации
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Типы для фильтров
export interface UserFilters {
  role?: UserRole;
  department?: number;
  specialization?: number;
  search?: string;
}

export interface FileFilters {
  category?: number;
  file_type?: FileType;
  access_level?: AccessLevel;
  search?: string;
}

export interface NewsFilters {
  category?: string;
  tag?: string;
  status?: ArticleStatus;
  featured?: boolean;
  search?: string;
}

export interface TestFilters {
  category?: number;
  test_type?: TestType;
  status?: TestStatus;
  required?: boolean;
  search?: string;
}

// Общие интерфейсы для API-запросов
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
// Types for analytics module
export interface AnalyticsState {
  dashboard: DashboardData | null;
  departmentStats: DepartmentStatistics[];
  userStats: UserStatistics | null;
  fileStats: FileStatistics | null;
  testingStats: TestingStatistics | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalFiles: number;
  completedTests: number;
  userChange: number;
  activeUserChange: number;
  fileChange: number;
  testChange: number;
  visits: VisitData[];
  userRoles: UserRoleData[];
}

export interface VisitData {
  date: string;
  uniqueVisitors: number;
  totalVisits: number;
  avgSessionTime: number;
}

export interface UserRoleData {
  name: string;
  value: number;
}

export interface DepartmentStatistics {
  id: number;
  name: string;
  totalUsers: number;
  activeUsers: number;
  activeUsersChange: number;
  files: number;
  filesChange: number;
  totalTests: number;
  passedTests: number;
  activityScore: number;
}

export interface UserStatistics {
  activeUsersByRole: { role: string; count: number }[];
  activityByHour: { hour: number; count: number }[];
  topActiveUsers: {
    id: number;
    name: string;
    department: string;
    logins: number;
    avgSessionTime: number;
  }[];
  deviceStats: {
    deviceType: string;
    count: number;
    percentage: number;
  }[];
}

export interface FileStatistics {
  filesUploadedPerDay: { date: string; count: number }[];
  filesDownloadedPerDay: { date: string; count: number }[];
  filesByType: { type: string; count: number; totalSize: number }[];
  filesVerifiedCount: number;
  filesVerifiedPercentage: number;
  topUploadDepartments: { department: string; count: number }[];
}

export interface TestingStatistics {
  testsCompletedPerDay: { date: string; count: number }[];
  testPassRate: number;
  testsByCategory: { category: string; count: number; passRate: number }[];
  avgCompletionTime: number;
  topPerformingDepartments: { department: string; passRate: number }[];
  worstPerformingDepartments: { department: string; passRate: number }[];
}

export interface AnalyticsDateParams {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}
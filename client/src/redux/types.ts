export interface UserState {
  id: string;
  username: string;
  token: string;
  isAdmin: boolean;
  email: string;
  notificationsOn: boolean;
  github: string;
}

export type BugPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  email: string;
  notificationsOn: boolean;
  github: string;
}

export interface Note {
  id: number;
  bugId: string;
  body: string;
  gitCommentId: number;
  author: User;
  isReply: boolean;
  replyId: number;
  repliesNb: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface AssignedAdmins {
  id: number;
  bugId: string;
  adminId: string;
  adminUsername: string;
  joinedAt: Date;
}

export interface BugState {
  id: string;
  title: string;
  description: string;
  priority: BugPriority;
  notes: Note[];
  isResolved: boolean;
  createdBy: User;
  updatedBy?: User;
  closedBy?: User;
  reopenedBy?: User;
  closedAt?: Date;
  reopenedAt?: Date;
  updatedAt?: Date;
  createdAt: Date;
  assignments: AssignedAdmins[];
  ImageFilePath: string;
  JSONFilePath: string;
  categoryId: string;
  category: Category;
  gitIssueNumber: number;
}

export interface CategoryState {
  id: string;
  name: string;
}

export type BugSortValues =
  | 'newest'
  | 'oldest'
  | 'a-z'
  | 'z-a'
  | 'closed'
  | 'reopened'
  | 'h-l'
  | 'l-h'
  | 'updated'
  | 'most-notes'
  | 'least-notes';

export type BugFilterValues = 'all' | 'closed' | 'open' | 'myBugs';

export interface CredentialsPayload {
  username: string;
  password: string;
  email?: string;
}

export interface BugPayload {
  title: string;
  description: string;
  priority: BugPriority;
  category?: Category;
}

export interface SettingsPayload {
  email: string;
  github: string;
  githubToken: string;
  notificationsOn: boolean;
  newPassword: string;
  oldPassword: string;
}

export interface InviteAdminPayload {
  email: string;
}

export interface InviteCodeData {
  code: string;
}

export interface EditedBugData extends BugPayload {
  updatedAt: Date;
  updatedBy: User;
}

export interface ClosedReopenedBugData {
  isResolved: boolean;
  closedAt: Date;
  closedBy: User;
  reopenedAt: Date;
  reopenedBy: User;
}

export interface NotifPayload {
  message: string;
  type: 'success' | 'error';
}

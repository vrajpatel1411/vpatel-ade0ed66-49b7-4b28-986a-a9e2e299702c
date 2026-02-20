import { Role, TaskStatus } from './enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  organizationId: number;
  teamId?: number;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number;
  teamId?: number;
}


export interface User {
  id:             number;
  name:           string;
  email:          string;
  role:           Role;
  organizationId: number;
  teamId?:        number;
  createdAt:      string;
}

export interface Task {
  id:              number;
  title:           string;
  description?:    string;
  ownerId:         number;
  organizationId:  number;
  owner?:          Partial<User>;
  assignedToId?:   number;        // ← add
  assignedTo?:     Partial<User>; // ← add
  createdAt:       string;
  updatedAt:       string;
  status?:         TaskStatus;
}

export interface AuditLog {
  id:         number;
  userId:     number;
  userEmail:  string;
  userRole:   string;
  action:     string;
  resourceId: number;
  detail:     string;
  timestamp:  string;
}

export interface LoginResponse {
  access_token: string;
  expires_in:   string;
}

export interface RegisterResponse {
  user:         User;
  access_token: string;
  expires_in:   string;
}

export interface CreateTaskRequest {
  title:         string;
  description?:  string;
  assignedToId?: number;
  status?: TaskStatus;        
}

export interface UpdateTaskRequest {
  title?:        string;
  description?:  string;
  assignedToId?: number;
  status?: TaskStatus;          
}
export interface LoginRequest {
  email:    string;
  password: string;
}
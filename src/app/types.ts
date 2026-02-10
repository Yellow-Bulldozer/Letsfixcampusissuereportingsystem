export type UserRole = 'student' | 'admin' | 'authority';

export type IssueStatus = 'pending' | 'verified' | 'ongoing' | 'completed';

export type IssueCategory = 
  | 'Broken Furniture'
  | 'Water Problem'
  | 'Electrical Fault'
  | 'Washroom Hygiene'
  | 'Classroom Maintenance'
  | 'Other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: {
    block: string;
    floor: string;
    room: string;
  };
  images: string[];
  status: IssueStatus;
  reportedBy: string;
  reportedAt: Date;
  votes: number;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId: string;
}

export interface Vote {
  userId: string;
  issueId: string;
  votedAt: Date;
}

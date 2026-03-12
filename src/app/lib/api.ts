import { Issue, IssueCategory, IssueStatus, User } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'letsfix_token';

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: User['role'];
  department: string;
};

type BackendIssue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    block: string;
    floor: string;
    room: string;
  };
  images?: string[];
  status: 'Pending' | 'Ongoing' | 'Completed';
  verified: boolean;
  reportedBy: string | { _id?: string; name?: string };
  createdAt: string;
  updatedAt: string;
};

const categoryToBackend: Record<IssueCategory, string> = {
  'Broken Furniture': 'bench',
  'Water Problem': 'water',
  'Electrical Fault': 'electrical',
  'Washroom Hygiene': 'washroom',
  'Classroom Maintenance': 'classroom',
  'Other': 'other'
};

const categoryFromBackend: Record<string, IssueCategory> = {
  bench: 'Broken Furniture',
  water: 'Water Problem',
  electrical: 'Electrical Fault',
  washroom: 'Washroom Hygiene',
  classroom: 'Classroom Maintenance',
  infrastructure: 'Other',
  internet: 'Other',
  security: 'Other',
  cleanliness: 'Other',
  other: 'Other'
};

const statusToBackend: Record<Exclude<IssueStatus, 'verified'>, 'Pending' | 'Ongoing' | 'Completed'> = {
  pending: 'Pending',
  ongoing: 'Ongoing',
  completed: 'Completed'
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.errors?.[0] || 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

function mapUser(user: BackendUser): User {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.department
  };
}

function mapIssue(issue: BackendIssue, voteCount = 0): Issue {
  const mappedStatus: IssueStatus =
    issue.status === 'Completed'
      ? 'completed'
      : issue.status === 'Ongoing'
        ? 'ongoing'
        : issue.verified
          ? 'verified'
          : 'pending';

  const reporterName =
    typeof issue.reportedBy === 'string'
      ? issue.reportedBy
      : (issue.reportedBy?.name || 'Unknown');

  return {
    id: issue._id,
    title: issue.title,
    description: issue.description,
    category: categoryFromBackend[issue.category] || 'Other',
    location: issue.location,
    images: issue.images || [],
    status: mappedStatus,
    reportedBy: reporterName,
    reportedAt: new Date(issue.createdAt),
    votes: voteCount,
    updatedAt: new Date(issue.updatedAt)
  };
}

export async function login(email: string, password: string) {
  const payload = await request<{ token: string; user: BackendUser }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password })
    },
    false
  );
  return { token: payload.token, user: mapUser(payload.user) };
}

export async function registerStudent(payload: {
  name: string;
  email: string;
  password: string;
  collegeId: string;
}) {
  const response = await request<{ token: string; user: BackendUser }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        department: payload.collegeId
      })
    },
    false
  );
  return { token: response.token, user: mapUser(response.user) };
}

export async function getCurrentUser() {
  const response = await request<{ data: BackendUser }>('/auth/me');
  return mapUser(response.data);
}

export async function getIssues() {
  const response = await request<{ data: BackendIssue[] }>('/issues');
  return response.data.map((issue) => mapIssue(issue));
}

export async function createIssue(payload: {
  title: string;
  description: string;
  category: IssueCategory;
  location: { block: string; floor: string; room: string };
}) {
  const response = await request<{ data: BackendIssue }>(
    '/issues',
    {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        category: categoryToBackend[payload.category],
        location: payload.location
      })
    }
  );
  return mapIssue(response.data);
}

export async function verifyIssue(issueId: string, verified: boolean) {
  const response = await request<{ data: BackendIssue }>(
    `/issues/${issueId}/verify`,
    {
      method: 'PUT',
      body: JSON.stringify({ verified })
    }
  );
  return mapIssue(response.data);
}

export async function updateIssueStatus(issueId: string, status: Exclude<IssueStatus, 'verified'>) {
  const response = await request<{ data: BackendIssue }>(
    `/issues/${issueId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status: statusToBackend[status] })
    }
  );
  return mapIssue(response.data);
}

export async function getActivePoll() {
  try {
    const response = await request<{
      data: {
        issues: Array<BackendIssue & { voteCount?: number }>;
      };
    }>('/polls/active');

    const voteByIssueId = new Map<string, number>();
    for (const issue of response.data.issues) {
      voteByIssueId.set(issue._id, issue.voteCount || 0);
    }
    return voteByIssueId;
  } catch {
    return new Map<string, number>();
  }
}

export async function getMyVoteIssueId() {
  try {
    const response = await request<{
      data: {
        issueId?: { _id?: string } | string;
      } | null;
    }>('/polls/my-vote');

    if (!response.data?.issueId) return null;
    return typeof response.data.issueId === 'string'
      ? response.data.issueId
      : (response.data.issueId._id || null);
  } catch {
    return null;
  }
}

export async function castVote(issueId: string) {
  await request(
    '/polls/vote',
    {
      method: 'POST',
      body: JSON.stringify({ issueId })
    }
  );
}


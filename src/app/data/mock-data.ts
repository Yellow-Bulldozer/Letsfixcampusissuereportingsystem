import { Issue, User, Vote } from '../types';

export const mockUsers: User[] = [
  {
    id: 'student1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    role: 'student',
    collegeId: 'CS2021001'
  },
  {
    id: 'admin1',
    name: 'Dr. Priya Mehta',
    email: 'priya.mehta@college.edu',
    role: 'admin',
    collegeId: 'ADMIN001'
  },
  {
    id: 'authority1',
    name: 'Principal Singh',
    email: 'principal@college.edu',
    role: 'authority',
    collegeId: 'AUTH001'
  }
];

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Broken Benches in Lab 301',
    description: 'Multiple benches in the computer lab are broken and unsafe to sit on. Students are having difficulty during practical sessions.',
    category: 'Broken Furniture',
    location: {
      block: 'Block A',
      floor: '3rd Floor',
      room: 'Lab 301'
    },
    images: [],
    status: 'verified',
    reportedBy: 'Rahul Sharma',
    reportedAt: new Date('2026-02-03'),
    votes: 45,
    updatedAt: new Date('2026-02-04')
  },
  {
    id: '2',
    title: 'No Water in Girls Washroom',
    description: 'The washroom on the 2nd floor has no running water for the past 3 days. This is causing major inconvenience.',
    category: 'Water Problem',
    location: {
      block: 'Block B',
      floor: '2nd Floor',
      room: 'Washroom 202'
    },
    images: [],
    status: 'verified',
    reportedBy: 'Priya Patel',
    reportedAt: new Date('2026-02-04'),
    votes: 78,
    updatedAt: new Date('2026-02-05')
  },
  {
    id: '3',
    title: 'Flickering Lights in Classroom',
    description: 'The tube lights in Room 405 keep flickering, making it difficult to focus during lectures.',
    category: 'Electrical Fault',
    location: {
      block: 'Block C',
      floor: '4th Floor',
      room: 'Room 405'
    },
    images: [],
    status: 'verified',
    reportedBy: 'Amit Kumar',
    reportedAt: new Date('2026-02-05'),
    votes: 32,
    updatedAt: new Date('2026-02-05')
  },
  {
    id: '4',
    title: 'Unhygienic Condition in Cafeteria Washroom',
    description: 'The cafeteria washroom is not being cleaned regularly. Very unhygienic conditions.',
    category: 'Washroom Hygiene',
    location: {
      block: 'Main Building',
      floor: 'Ground Floor',
      room: 'Cafeteria'
    },
    images: [],
    status: 'verified',
    reportedBy: 'Sneha Reddy',
    reportedAt: new Date('2026-02-06'),
    votes: 56,
    updatedAt: new Date('2026-02-06')
  },
  {
    id: '5',
    title: 'Broken Projector in Seminar Hall',
    description: 'The projector in the main seminar hall is not working. Important presentations are being affected.',
    category: 'Classroom Maintenance',
    location: {
      block: 'Main Building',
      floor: '1st Floor',
      room: 'Seminar Hall'
    },
    images: [],
    status: 'ongoing',
    reportedBy: 'Vikram Singh',
    reportedAt: new Date('2026-01-28'),
    votes: 23,
    updatedAt: new Date('2026-02-07')
  },
  {
    id: '6',
    title: 'AC Not Working in Library',
    description: 'The air conditioning system in the library reading room has stopped working. Very uncomfortable during study hours.',
    category: 'Other',
    location: {
      block: 'Library Building',
      floor: '2nd Floor',
      room: 'Reading Room'
    },
    images: [],
    status: 'pending',
    reportedBy: 'Anjali Gupta',
    reportedAt: new Date('2026-02-08'),
    votes: 12,
    updatedAt: new Date('2026-02-08')
  },
  {
    id: '7',
    title: 'Leaking Tap in Chemistry Lab',
    description: 'One of the taps in the chemistry lab is leaking continuously, wasting a lot of water.',
    category: 'Water Problem',
    location: {
      block: 'Block D',
      floor: '1st Floor',
      room: 'Chemistry Lab'
    },
    images: [],
    status: 'completed',
    reportedBy: 'Rohan Verma',
    reportedAt: new Date('2026-01-25'),
    votes: 8,
    updatedAt: new Date('2026-02-02')
  }
];

export const mockVotes: Vote[] = [
  {
    userId: 'student1',
    issueId: '2',
    votedAt: new Date('2026-02-08')
  }
];

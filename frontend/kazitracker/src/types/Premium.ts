// src/types/Premium.ts

interface ResumeVersion {
  id: string;
  name: string;
  uploadedDate: string;
  applicationsCount: number;
  successRate: number; // percentage
  interviews: number;
  offers: number;
  rejections: number;
}
export type { ResumeVersion }; 


interface Offer {
  id: number;
  applicationId: number;
  companyName: string;
  position: string;
  salary: number;
  benefits: string[];
  startDate: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  negotiationHistory: { date: string; proposal: string }[];
}

export type { Offer };

interface Deadline {
  id: number;
  applicationId: number;
  title: string;
  dueDate: string;
  type: 'response' | 'decision' | 'negotiation' | 'other';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type { Deadline };

interface Interview {
  id: number;
  applicationId: number;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
  interviewer?: string;
  location?: string;
  notes?: string;
  prepChecklist: { task: string; completed: boolean }[];
  reminders: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { Interview };


// Add this near the top of the file
export interface InterviewFormData {
  applicationId: number;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
  interviewer: string;
  location: string;
  notes: string;
  prepChecklist: { task: string; completed: boolean }[];
  reminders: boolean;
}
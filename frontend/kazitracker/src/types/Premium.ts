// src/types/Premium.ts

interface ResumeVersion {
  id: string;
  name: string;
  uploaded_date: string;
  applications_count: number;
  success_rate: number; // percentage
  interviews: number;
  offers: number;
  rejections: number;
}
export type { ResumeVersion }; 


interface Offer {
  id: number;
  application_id: number;
  company_name: string;
  position: string;
  salary: number;
  benefits: string[];
  start_date: string;
  deadline: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  negotiation_history: { date: string; proposal: string }[];
}

export type { Offer };

interface Deadline {
  id: number;
  application_id: number;
  title: string;
  due_date: string;
  type: 'response' | 'decision' | 'negotiation' | 'other';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export type { Deadline };

interface Interview {
  id: number;
  application_id: number;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
  interviewer?: string;
  location?: string;
  notes?: string;
  prep_checklist: { task: string; completed: boolean }[];
  reminders: boolean;
  created_at: string;
  updated_at: string;
}

export type { Interview };


// Add this near the top of the file
export interface InterviewFormData {
  application_id: number;
  date: string;
  time: string;
  type: 'phone' | 'video' | 'in-person';
  interviewer: string;
  location: string;
  notes: string;
  prep_checklist: { task: string; completed: boolean }[];
  reminders: boolean;
}
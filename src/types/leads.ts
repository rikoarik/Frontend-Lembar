export type LeadRole =
  | 'kepala_sekolah'
  | 'guru'
  | 'kurikulum'
  | 'lainnya';

export type SchoolLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  school: string;
  role: LeadRole;
  teacherCount: number;
  goal?: string;
  consent: boolean;
};

export type SchoolLeadSuccess = {
  leadId: string;
  receivedAt: string;
};

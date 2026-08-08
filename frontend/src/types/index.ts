export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
  citizenId: string;
  phone: string;
  address: string;
  photo: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  twoFactorEnabled: boolean;
}

export interface Document {
  id: number;
  user_id: number;
  name: string;
  category: 'Identity' | 'Education' | 'Property' | 'Tax' | 'Healthcare';
  size: string;
  url: string;
  expiry_date?: string;
  verified: boolean;
  upload_date: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  category: 'Certificates' | 'Education' | 'Business' | 'Healthcare' | 'Agriculture' | 'Taxation' | 'Identity Documents' | 'Utilities & Housing' | 'Welfare & Social Safety';
  eligibility?: string;
  required_documents: string[];
  estimated_time?: string;
  application_steps: string[];
  official_url?: string;
}

export interface Scheme {
  id: number;
  title: string;
  description?: string;
  desc?: string;
  category: 'Scholarships' | 'Grants' | 'Subsidies' | 'Welfare';
  amount: string;
  eligibility_rules: Record<string, any>;
  deadline?: string;
  requirements: string[];
  matchPercentage?: number; // Calculated dynamically on discovery
}

export interface Complaint {
  id: number;
  user_id: number;
  title: string;
  category: 'Potholes' | 'Garbage' | 'Water Leakage' | 'Streetlight Failure' | 'Road Damage' | 'Illegal Dumping';
  description: string;
  location: string;
  x_coord: number;
  y_coord: number;
  photo_url?: string;
  status: 'new' | 'investigating' | 'resolved';
  upvotes: number;
  created_at: string;
}

export interface ApplicationHistory {
  status: string;
  date: string;
  desc: string;
}

export interface Application {
  id: number;
  user_id: number;
  title: string;
  category: string;
  status: 'pending' | 'reviewing' | 'approved';
  progress: number;
  created_at: string;
  history: ApplicationHistory[];
}

export interface Deadline {
  id: number;
  user_id: number;
  title: string;
  date: string;
  type: 'license' | 'certificate' | 'tax' | 'application' | 'election';
  urgency: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: number;
  user_id: number;
  text: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  read_status: boolean;
  created_at: string;
}

export interface BusinessTemplate {
  id: number;
  name: 'Pharmacy' | 'Restaurant' | 'Retail Shop' | 'Startup' | 'Consultancy' | 'Manufacturing';
  licenses: string[];
  approvals: string[];
  estimated_cost: string;
  documents: string[];
  timeline: string;
  compliance_checklist: string[];
}

export interface LifeEvent {
  id: number;
  name: 'Birth of Child' | 'Marriage' | 'College Admission' | 'Employment' | 'Starting Business' | 'Property Purchase' | 'Retirement' | 'Death in Family' | 'Address Change / Relocation' | 'Medical Care & Hospitalization' | 'Vehicle Purchase' | 'Higher Education & Exams' | 'Senior Citizen Transition' | 'Disability & Accessibility';
  description: string;
  required_registrations: string[];
  services_needed: string[];
  documents_required: string[];
  timeline_est: string;
}

export interface Checklist {
  id: number;
  user_id: number;
  life_event_id: number;
  checked_items: Record<string, boolean>;
}

export interface EmergencyAlert {
  id: number;
  title: string;
  severity: 'critical' | 'high' | 'moderate' | 'info';
  category: 'Weather' | 'Power Outage' | 'Health' | 'Traffic' | 'Flood';
  location: string;
  description: string;
  safety_steps: string[];
  active: boolean;
  created_at: string;
}

export interface EmergencyHelpline {
  id: number;
  name: string;
  category: string;
  number: string;
  description?: string;
  icon?: string;
}

export interface ShelterLocation {
  id: number;
  name: string;
  address: string;
  x_coord: number;
  y_coord: number;
  capacity: number;
  occupancy: number;
  status: 'open' | 'full' | 'standby';
  amenities: string[];
  contact_phone?: string;
}

export type UserRole = "admin" | "coach";

export type StudentCategory = "babyfoot" | "sub6" | "sub7" | "sub8" | "sub9" | "sub10" | "sub11" | "sub12" | "sub13" | "sub14" | "sub15";

export type PaymentStatus = "pago" | "pendente";

export type PaymentType = "mensalidade" | "matricula" | "arbitragem" | "outros";

export type ScheduleType = "treino" | "jogo";

export interface School {
  id: string;
  name: string;
  logo?: string;
  pixKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentMedicalInfo {
  bloodType?: string;
  allergies?: string;
  medications?: string;
  specialConditions?: string;
  healthInsurance?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  parentAuthorization?: boolean;
}

export interface User {
  id: string;
  schoolId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDocument {
  name: string;
  url: string;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  name: string;
  age: number;
  category: StudentCategory;
  guardian: string;
  phone: string;
  email: string;
  active: boolean;
  documents?: StudentDocument[];
  medicalInfo?: StudentMedicalInfo;
  portalToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  paidAt?: Date;
  month: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseType = "one-time" | "recurring";
export type ExpenseCategory = "fixo" | "variavel" | "outros";

export interface Expense {
  id: string;
  schoolId: string;
  description: string;
  amount: number;
  type: ExpenseType;
  category: ExpenseCategory;
  date?: Date;
  dayOfMonth?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  present: boolean;
}

export interface Attendance {
  id: string;
  schoolId: string;
  date: Date;
  category: StudentCategory;
  coachId: string;
  coachName: string;
  records: AttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Championship {
  id: string;
  schoolId: string;
  name: string;
  organizer?: string;       // Ex: "Liga Municipal", "Federação"
  startDate: Date;
  endDate?: Date;
  location: string;
  categories: StudentCategory[];  // Which subs participate
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  schoolId: string;
  title: string;
  type: ScheduleType;
  category: StudentCategory;
  date: Date;
  time: string;
  location: string;
  notes?: string;
  // Recurring training fields (type must be "treino")
  recurring?: boolean;
  daysOfWeek?: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  createdAt: Date;
  updatedAt: Date;
}

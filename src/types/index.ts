export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  course: string;
  qrCode?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  timestamp: string;
  date: string;
  status: 'present' | 'late' | 'absent';
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}
import { Student, AttendanceRecord } from "@/types";

export const sampleStudents: Student[] = [
  {
    id: "student-001",
    name: "Alice Johnson",
    rollNumber: "CS001",
    email: "alice.johnson@university.edu",
    course: "Computer Science"
  },
  {
    id: "student-002", 
    name: "Bob Smith",
    rollNumber: "CS002",
    email: "bob.smith@university.edu",
    course: "Computer Science"
  },
  {
    id: "student-003",
    name: "Carol Davis",
    rollNumber: "CS003", 
    email: "carol.davis@university.edu",
    course: "Computer Science"
  },
  {
    id: "student-004",
    name: "David Wilson",
    rollNumber: "EE001",
    email: "david.wilson@university.edu", 
    course: "Electrical Engineering"
  },
  {
    id: "student-005",
    name: "Emma Brown",
    rollNumber: "EE002",
    email: "emma.brown@university.edu",
    course: "Electrical Engineering"
  }
];

export const initializeSampleData = () => {
  // Only initialize if no data exists
  const existingStudents = localStorage.getItem('students');
  const existingAttendance = localStorage.getItem('attendanceRecords');
  
  if (!existingStudents) {
    localStorage.setItem('students', JSON.stringify(sampleStudents));
  }
  
  if (!existingAttendance) {
    // Create some sample attendance records for the past few days
    const sampleAttendance: AttendanceRecord[] = [
      {
        id: "att-001",
        studentId: "student-001",
        studentName: "Alice Johnson", 
        rollNumber: "CS001",
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        status: "present"
      },
      {
        id: "att-002", 
        studentId: "student-002",
        studentName: "Bob Smith",
        rollNumber: "CS002", 
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        status: "present"
      },
      {
        id: "att-003",
        studentId: "student-003",
        studentName: "Carol Davis",
        rollNumber: "CS003",
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], 
        status: "late"
      }
    ];
    
    localStorage.setItem('attendanceRecords', JSON.stringify(sampleAttendance));
  }
};
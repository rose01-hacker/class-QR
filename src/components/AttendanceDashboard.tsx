import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, UserCheck, UserX, TrendingUp, Download } from "lucide-react";
import { AttendanceRecord, AttendanceStats } from "@/types";
import { format } from "date-fns";

const AttendanceDashboard = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    // Load attendance data from localStorage
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = records.filter((record: AttendanceRecord) => record.date === today);
    
    const presentToday = todayRecords.length;
    const totalStudents = students.length;
    const absentToday = totalStudents - presentToday;
    const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;
    
    setAttendanceRecords(records);
    setStats({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate
    });
  }, []);

  const weeklyData = [
    { day: 'Mon', present: 45, absent: 5 },
    { day: 'Tue', present: 42, absent: 8 },
    { day: 'Wed', present: 48, absent: 2 },
    { day: 'Thu', present: 46, absent: 4 },
    { day: 'Fri', present: 44, absent: 6 },
  ];

  const pieData = [
    { name: 'Present', value: stats.presentToday, color: 'hsl(var(--success))' },
    { name: 'Absent', value: stats.absentToday, color: 'hsl(var(--destructive))' }
  ];

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Student,Roll Number,Status,Time\n" +
      attendanceRecords.map(record => 
        `${record.date},${record.studentName},${record.rollNumber},${record.status},${record.timestamp}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-education-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.presentToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absentToday}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-education-emerald" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-education-emerald">
              {stats.attendanceRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(var(--success))" name="Present" />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Today's Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Attendance</CardTitle>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendanceRecords.slice(-10).reverse().map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{record.studentName}</p>
                    <p className="text-sm text-muted-foreground">{record.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                    {record.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(record.timestamp), 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
            {attendanceRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No attendance records yet. Start scanning QR codes!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;
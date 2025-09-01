import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanLine, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AttendanceRecord, Student } from "@/types";
import { format } from "date-fns";

const QRScanner = () => {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<AttendanceRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    setScanner(html5QrcodeScanner);
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText: string) => {
    // Parse the QR code data (expecting JSON with student info)
    try {
      const studentData = JSON.parse(decodedText);
      markAttendance(studentData);
    } catch (error) {
      // If not JSON, treat as student ID
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const student = students.find((s: Student) => s.id === decodedText || s.rollNumber === decodedText);
      
      if (student) {
        markAttendance(student);
      } else {
        toast({
          title: "Student Not Found",
          description: "QR code doesn't match any registered student.",
          variant: "destructive"
        });
      }
    }
  };

  const onScanFailure = (error: any) => {
    // Handle scan failure silently for better UX
    console.log("Scan failed:", error);
  };

  const markAttendance = (student: Student) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const timestamp = now.toISOString();
    
    // Check if already marked today
    const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const alreadyMarked = existingRecords.some((record: AttendanceRecord) => 
      record.studentId === student.id && record.date === today
    );

    if (alreadyMarked) {
      toast({
        title: "Already Marked",
        description: `${student.name} attendance already recorded today.`,
        variant: "destructive"
      });
      return;
    }

    // Determine status based on time (assuming class starts at 9:00 AM)
    const classStartTime = new Date();
    classStartTime.setHours(9, 0, 0, 0);
    const currentTime = new Date();
    
    let status: 'present' | 'late' = 'present';
    if (currentTime > classStartTime) {
      const minutesLate = (currentTime.getTime() - classStartTime.getTime()) / (1000 * 60);
      if (minutesLate > 15) { // More than 15 minutes late
        status = 'late';
      }
    }

    const attendanceRecord: AttendanceRecord = {
      id: `${student.id}-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      timestamp,
      date: today,
      status
    };

    // Save to localStorage
    const updatedRecords = [...existingRecords, attendanceRecord];
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
    
    setLastScan(attendanceRecord);
    
    toast({
      title: "Attendance Marked",
      description: `${student.name} marked as ${status}`,
      variant: status === 'present' ? 'default' : 'destructive'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <ScanLine className="w-6 h-6" />
            <span>QR Code Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {!isScanning ? (
              <Button 
                onClick={startScanning}
                size="lg"
                className="bg-gradient-primary hover:bg-primary-hover"
              >
                <ScanLine className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button 
                onClick={stopScanning}
                variant="destructive"
                size="lg"
              >
                Stop Scanning
              </Button>
            )}
          </div>

          {isScanning && (
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                className="mx-auto rounded-lg overflow-hidden shadow-lg"
              />
              <p className="text-center text-muted-foreground">
                Position the QR code within the frame to scan
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {lastScan && (
        <Card className="shadow-card border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span>Last Scan Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{lastScan.studentName}</p>
                  <p className="text-muted-foreground">{lastScan.rollNumber}</p>
                </div>
                <Badge 
                  variant={lastScan.status === 'present' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {lastScan.status === 'present' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </>
                  ) : lastScan.status === 'late' ? (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      Late
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Scanned at: {format(new Date(lastScan.timestamp), 'HH:mm:ss, dd/MM/yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isScanning && !lastScan && (
        <Card className="shadow-card bg-education-blue-light">
          <CardContent className="p-6 text-center">
            <ScanLine className="w-12 h-12 mx-auto mb-4 text-education-blue" />
            <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
            <p className="text-muted-foreground">
              Click "Start Scanning" to begin taking attendance with QR codes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
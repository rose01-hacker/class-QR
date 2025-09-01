import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Users, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types";
import QRCode from "qrcode";

const QRGenerator = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [generatedQRs, setGeneratedQRs] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);
  };

  const generateQRCode = async (student: Student): Promise<string> => {
    try {
      const qrData = JSON.stringify({
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#1e40af', // education-blue
          light: '#ffffff'
        },
        width: 200
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const generateAllQRCodes = async () => {
    setIsGenerating(true);
    try {
      const qrCodes: { [key: string]: string } = {};
      
      for (const student of students) {
        const qrCode = await generateQRCode(student);
        qrCodes[student.id] = qrCode;
      }
      
      setGeneratedQRs(qrCodes);
      toast({
        title: "QR Codes Generated",
        description: `Generated ${students.length} QR codes successfully.`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR codes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = (student: Student) => {
    const qrCode = generatedQRs[student.id];
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `${student.rollNumber}_${student.name.replace(/\s+/g, '_')}_QR.png`;
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRCodes = () => {
    students.forEach(student => {
      if (generatedQRs[student.id]) {
        setTimeout(() => downloadQRCode(student), 100);
      }
    });
    
    toast({
      title: "Download Started",
      description: "All QR codes are being downloaded."
    });
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-card { 
              display: inline-block; 
              margin: 15px; 
              padding: 20px; 
              border: 2px solid #e2e8f0; 
              border-radius: 8px; 
              text-align: center;
              width: 200px;
              break-inside: avoid;
            }
            .student-name { font-weight: bold; margin-bottom: 5px; }
            .student-roll { color: #666; margin-bottom: 15px; }
            .qr-image { max-width: 150px; height: auto; }
            @media print {
              .qr-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Student QR Codes - Class Attendance</h1>
          <div class="qr-grid">
            ${students.map(student => 
              generatedQRs[student.id] ? `
                <div class="qr-card">
                  <div class="student-name">${student.name}</div>
                  <div class="student-roll">${student.rollNumber}</div>
                  <img src="${generatedQRs[student.id]}" alt="QR Code" class="qr-image" />
                  <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    ${student.course}
                  </div>
                </div>
              ` : ''
            ).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <QrCode className="w-8 h-8 text-education-blue" />
          <div>
            <h1 className="text-2xl font-bold">QR Code Generator</h1>
            <p className="text-muted-foreground">Generate QR codes for student attendance</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={generateAllQRCodes}
            disabled={isGenerating || students.length === 0}
            className="bg-gradient-primary hover:bg-primary-hover"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate All QR Codes'}
          </Button>
          
          {Object.keys(generatedQRs).length > 0 && (
            <>
              <Button variant="outline" onClick={downloadAllQRCodes}>
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" onClick={printQRCodes}>
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-education-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <QrCode className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">QR Codes Generated</p>
                <p className="text-2xl font-bold">{Object.keys(generatedQRs).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Download className="w-8 h-8 text-education-emerald" />
              <div>
                <p className="text-sm text-muted-foreground">Ready to Download</p>
                <p className="text-2xl font-bold">{Object.keys(generatedQRs).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Grid */}
      {students.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground mb-4">
              Add students first to generate their QR codes for attendance.
            </p>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Go to Student Management
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Student QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="text-center space-y-3">
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {student.course}
                      </Badge>
                    </div>
                    
                    {generatedQRs[student.id] ? (
                      <div className="space-y-3">
                        <img
                          src={generatedQRs[student.id]}
                          alt={`QR Code for ${student.name}`}
                          className="w-32 h-32 mx-auto border rounded"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadQRCode(student)}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto border rounded-lg flex items-center justify-center bg-muted">
                        <QrCode className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRGenerator;
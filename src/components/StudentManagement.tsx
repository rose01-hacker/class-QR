import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/types";

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    course: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    setStudents(savedStudents);
  };

  const saveStudents = (studentList: Student[]) => {
    localStorage.setItem('students', JSON.stringify(studentList));
    setStudents(studentList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNumber || !formData.email || !formData.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingStudent) {
      // Update existing student
      const updatedStudents = students.map(student =>
        student.id === editingStudent.id
          ? { ...student, ...formData }
          : student
      );
      saveStudents(updatedStudents);
      toast({
        title: "Student Updated",
        description: `${formData.name} has been updated successfully.`
      });
      setEditingStudent(null);
    } else {
      // Add new student
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...formData
      };
      saveStudents([...students, newStudent]);
      toast({
        title: "Student Added",
        description: `${formData.name} has been added successfully.`
      });
    }

    // Reset form
    setFormData({ name: '', rollNumber: '', email: '', course: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      course: student.course
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (studentId: string) => {
    const updatedStudents = students.filter(student => student.id !== studentId);
    saveStudents(updatedStudents);
    toast({
      title: "Student Removed",
      description: "Student has been removed from the system."
    });
  };

  const resetForm = () => {
    setFormData({ name: '', rollNumber: '', email: '', course: '' });
    setEditingStudent(null);
  };

  const StudentForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter student's full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rollNumber">Roll Number *</Label>
        <Input
          id="rollNumber"
          value={formData.rollNumber}
          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
          placeholder="Enter roll number"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="course">Course *</Label>
        <Input
          id="course"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          placeholder="Enter course name"
          required
        />
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1">
          {editingStudent ? 'Update Student' : 'Add Student'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-education-blue" />
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage student records and information</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:bg-primary-hover"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
            </DialogHeader>
            <StudentForm />
          </DialogContent>
        </Dialog>
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
              <GraduationCap className="w-8 h-8 text-education-emerald" />
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">
                  {new Set(students.map(s => s.course)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                QR
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">QR Codes Ready</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first student to get started with QR-based attendance
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-education-blue-light flex items-center justify-center">
                      <span className="text-education-blue font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{student.rollNumber}</span>
                        <span>{student.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {student.course}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
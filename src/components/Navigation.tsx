import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  QrCode, 
  Users, 
  BarChart3, 
  ScanLine,
  GraduationCap
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/students", label: "Students", icon: Users },
    { path: "/scanner", label: "QR Scanner", icon: ScanLine },
    { path: "/qr-generator", label: "QR Generator", icon: QrCode },
  ];

  return (
    <nav className="bg-gradient-primary text-primary-foreground shadow-elevated">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8" />
            <h1 className="text-xl font-bold">Class QR Assist</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-white/10 hover:scale-105",
                    isActive && "bg-white/20 shadow-sm"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
import { useState } from 'react';
import { 
  BarChart3, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Header } from './components/Header';
import  Dashboard  from './components/Dashboard';
import  AttackLogs  from './components/AttackLogs';
import { Analytics } from './components/Analytics';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'logs', label: 'Attack Logs', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <AttackLogs />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">Alert Management</h2>
            <p className="text-green-300">Configure alert rules and notification settings.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center">
            <Settings className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">System Settings</h2>
            <p className="text-green-300">Configure honeypot parameters and security policies.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-green-100 dark">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          {/* Sidebar */}
          <Sidebar className="border-r border-green-500/30 bg-black/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-green-500/30 p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-green-400" />
                <div>
                  <h2 className="text-lg font-bold text-green-400">CyberGuard</h2>
                  <p className="text-xs text-green-500/70">Honeypot Security</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveView(item.id)}
                      className={`w-full justify-start px-3 py-2 rounded-lg transition-colors ${
                        activeView === item.id
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'text-green-300 hover:bg-green-500/10 hover:text-green-400'
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              
              {/* Status Indicators */}
              <div className="mt-8 p-4 bg-black/60 rounded-lg border border-green-500/30">
                <h3 className="text-sm font-semibold text-green-400 mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-300">Firewall</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-300">IDS</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-300">ML Engine</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-300">Database</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
import { Bell, Shield, User, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export function Header() {
  return (
    <header className="border-b border-green-500/20 bg-black/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-400" />
            <h1 className="text-xl font-bold text-green-400">CyberGuard</h1>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              HONEYPOT v2.1
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search attacks, IPs..."
              className="w-80 bg-black/30 border-green-500/30 pl-10 text-green-100 placeholder:text-green-500/50"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">
              12
            </Badge>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
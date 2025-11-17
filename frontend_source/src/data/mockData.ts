// Mock data for the cybersecurity dashboard

export interface AttackLog {
  id: string;
  ip: string;
  timestamp: Date;
  username: string;
  password: string;
  attackType: string;
  country: string;
  city: string;
  blocked: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CountryAttack {
  country: string;
  code: string;
  count: number;
  flag: string;
  coordinates: [number, number];
}

export interface AnalyticsData {
  hourlyAttacks: Array<{ hour: string; attacks: number; }>;
  attackTypes: Array<{ type: string; count: number; color: string; }>;
  topCountries: Array<{ country: string; attacks: number; }>;
  anomalies: Array<{ time: string; severity: string; description: string; }>;
}

// Generate realistic mock attack logs
export const generateMockAttackLogs = (): AttackLog[] => {
  const attackTypes = ['SSH Brute Force', 'HTTP Login Attempt', 'FTP Intrusion', 'Port Scan', 'SQL Injection', 'XSS Attempt'];
  const countries = ['China', 'Russia', 'United States', 'Germany', 'Brazil', 'India', 'North Korea'];
  const cities = ['Beijing', 'Moscow', 'New York', 'Berlin', 'São Paulo', 'Mumbai', 'Pyongyang'];
  const commonUsernames = ['admin', 'root', 'user', 'test', 'guest', 'administrator', 'pi'];
  const commonPasswords = ['123456', 'password', 'admin', 'root', '12345', 'qwerty', 'password123'];
  
  const logs: AttackLog[] = [];
  
  for (let i = 0; i < 150; i++) {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    logs.push({
      id: `log-${i}`,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
      username: commonUsernames[Math.floor(Math.random() * commonUsernames.length)],
      password: commonPasswords[Math.floor(Math.random() * commonPasswords.length)],
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      country: randomCountry,
      city: randomCity,
      blocked: Math.random() > 0.3,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const countryAttackData: CountryAttack[] = [
  { country: 'China', code: 'CN', count: 1247, flag: '🇨🇳', coordinates: [104, 35] },
  { country: 'Russia', code: 'RU', count: 892, flag: '🇷🇺', coordinates: [100, 60] },
  { country: 'United States', code: 'US', count: 623, flag: '🇺🇸', coordinates: [-95, 40] },
  { country: 'Brazil', code: 'BR', count: 445, flag: '🇧🇷', coordinates: [-55, -15] },
  { country: 'Germany', code: 'DE', count: 334, flag: '🇩🇪', coordinates: [10, 51] },
  { country: 'India', code: 'IN', count: 267, flag: '🇮🇳', coordinates: [77, 20] },
  { country: 'North Korea', code: 'KP', count: 198, flag: '🇰🇵', coordinates: [127, 40] },
];

export const analyticsData: AnalyticsData = {
  hourlyAttacks: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    attacks: Math.floor(Math.random() * 50) + 10,
  })),
  attackTypes: [
    { type: 'SSH Brute Force', count: 1847, color: '#00ff88' },
    { type: 'HTTP Login', count: 1203, color: '#0088ff' },
    { type: 'Port Scan', count: 892, color: '#ff4400' },
    { type: 'SQL Injection', count: 567, color: '#ffaa00' },
    { type: 'XSS Attempt', count: 334, color: '#aa00ff' },
    { type: 'FTP Intrusion', count: 198, color: '#ff0088' },
  ],
  topCountries: [
    { country: 'China', attacks: 1247 },
    { country: 'Russia', attacks: 892 },
    { country: 'United States', attacks: 623 },
    { country: 'Brazil', attacks: 445 },
    { country: 'Germany', attacks: 334 },
  ],
  anomalies: [
    { time: '14:23', severity: 'critical', description: 'Massive brute force attack detected from 192.168.1.100' },
    { time: '11:45', severity: 'high', description: 'SQL injection pattern identified in HTTP requests' },
    { time: '09:12', severity: 'medium', description: 'Unusual port scanning activity from China' },
    { time: '07:30', severity: 'low', description: 'Repeated failed login attempts detected' },
  ],
};
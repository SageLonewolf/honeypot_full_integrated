import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Globe } from 'lucide-react';
import { countryAttackData } from '../data/mockData';
import React from "react";

export default function GeoMap() {
  const maxAttacks = Math.max(...countryAttackData.map(c => c.count));
  // Simple world map SVG with attack indicators
  return (
    <Card className="bg-black/40 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-400">
          <Globe className="h-5 w-5" />
          <span>Global Attack Sources</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Simplified world map background */}
          <div className="bg-gray-900/50 rounded-lg p-4 h-96 relative overflow-hidden border border-green-500/20">
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simplified world continents */}
              <g fill="#1f2937" stroke="#374151" strokeWidth="1">
                {/* North America */}
                <path d="M 150 120 L 250 100 L 280 140 L 270 200 L 200 220 L 150 180 Z" />
                {/* South America */}
                <path d="M 230 250 L 280 240 L 290 320 L 270 380 L 250 390 L 220 350 Z" />
                {/* Europe */}
                <path d="M 450 100 L 500 90 L 520 130 L 480 150 L 450 140 Z" />
                {/* Africa */}
                <path d="M 480 160 L 540 150 L 560 220 L 550 300 L 520 320 L 480 280 Z" />
                {/* Asia */}
                <path d="M 550 80 L 750 70 L 800 120 L 780 200 L 720 180 L 550 150 Z" />
                {/* Australia */}
                <path d="M 700 300 L 780 290 L 800 320 L 760 340 L 700 330 Z" />
              </g>
              
              {/* Attack indicators */}
              {countryAttackData.map((country, index) => {
                const size = 4 + (country.count / maxAttacks) * 20;
                const opacity = 0.3 + (country.count / maxAttacks) * 0.7;
                
                return (
                  <g key={country.code}>
                    {/* Pulsing circle for high-activity countries */}
                    <circle
                      cx={country.coordinates[0] * 5 + 500}
                      cy={country.coordinates[1] * -2 + 250}
                      r={size}
                      fill="#ef4444"
                      opacity={opacity}
                      className="animate-pulse"
                    />
                    {/* Inner bright dot */}
                    <circle
                      cx={country.coordinates[0] * 5 + 500}
                      cy={country.coordinates[1] * -2 + 250}
                      r={size / 3}
                      fill="#fbbf24"
                    />
                  </g>
                );
              })}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 p-3 rounded border border-green-500/30">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-green-400">High Activity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-green-400">Medium Activity</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Country statistics */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {countryAttackData.map((country) => (
              <div
                key={country.code}
                className="bg-black/60 p-3 rounded border border-green-500/20 hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-green-400 text-sm">{country.country}</span>
                  </div>
                  <Badge variant="outline" className="border-red-500/50 text-red-400">
                    {country.count.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
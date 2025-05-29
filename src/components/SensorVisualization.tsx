
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface SensorVisualizationProps {
  sensorData: number[];
  robotConfig: {
    sensorCount: number;
    sensorPositions: Array<{ x: number; y: number; angle: number }>;
  };
}

export const SensorVisualization: React.FC<SensorVisualizationProps> = ({
  sensorData,
  robotConfig
}) => {
  const getSensorStatus = (value: number) => {
    if (value < 400) return { status: 'Strong Line', color: 'bg-red-500', textColor: 'text-red-400' };
    if (value < 600) return { status: 'Weak Line', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
    return { status: 'Surface', color: 'bg-green-500', textColor: 'text-green-400' };
  };

  const getNoiseLevel = (value: number) => {
    // Simulate noise based on value
    const baseNoise = Math.abs(value - 512) / 512 * 2; // 0-2%
    const randomNoise = Math.random() * 3; // 0-3%
    return Math.min(baseNoise + randomNoise, 5); // Max 5%
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Sensor Data</h3>
      </div>

      {/* Sensor Array Visualization */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <h4 className="font-medium text-white mb-3">Array Layout</h4>
        
        <div className="relative bg-slate-800 rounded-lg p-4 h-32">
          {/* Robot outline */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-blue-600 rounded-sm">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded"></div>
          </div>
          
          {/* Sensors */}
          {robotConfig.sensorPositions.map((sensor, index) => {
            const sensorStatus = getSensorStatus(sensorData[index] || 512);
            const x = 50 + sensor.x; // Center position + offset
            const y = 70 + sensor.y; // Bottom position + offset
            
            return (
              <div
                key={index}
                className={`absolute w-3 h-3 rounded-full ${sensorStatus.color} transition-colors duration-200`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`Sensor ${index}: ${sensorData[index] || 0}`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-mono">
                  {index}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Individual Sensor Details */}
      <div className="space-y-3">
        {sensorData.map((value, index) => {
          const sensorStatus = getSensorStatus(value);
          const noiseLevel = getNoiseLevel(value);
          
          return (
            <Card key={index} className="bg-slate-700/20 border-slate-600 p-3">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">A{index}</Badge>
                    <span className="text-sm font-medium text-white">Sensor {index + 1}</span>
                  </div>
                  <Badge variant="outline" className={sensorStatus.textColor}>
                    {sensorStatus.status}
                  </Badge>
                </div>

                {/* Value and Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Value</span>
                    <span className="text-white font-mono">{value}</span>
                  </div>
                  <Progress 
                    value={(value / 1023) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0 (Black)</span>
                    <span>1023 (White)</span>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Voltage:</span>
                    <span className="text-white ml-1">{(value / 1023 * 5).toFixed(2)}V</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Noise:</span>
                    <span className="text-white ml-1">±{noiseLevel.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Position Info */}
                <div className="text-xs text-slate-500">
                  Position: ({robotConfig.sensorPositions[index]?.x || 0}, {robotConfig.sensorPositions[index]?.y || 0}) 
                  @ {robotConfig.sensorPositions[index]?.angle || 0}°
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <h4 className="font-medium text-white">Statistics</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Min Value:</span>
            <span className="text-white ml-2 font-mono">{Math.min(...sensorData)}</span>
          </div>
          <div>
            <span className="text-slate-400">Max Value:</span>
            <span className="text-white ml-2 font-mono">{Math.max(...sensorData)}</span>
          </div>
          <div>
            <span className="text-slate-400">Average:</span>
            <span className="text-white ml-2 font-mono">{Math.round(sensorData.reduce((a, b) => a + b, 0) / sensorData.length)}</span>
          </div>
          <div>
            <span className="text-slate-400">Range:</span>
            <span className="text-white ml-2 font-mono">{Math.max(...sensorData) - Math.min(...sensorData)}</span>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {sensorData.some(value => value < 100 || value > 950) && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Sensor Alert</span>
          </div>
          <p className="text-yellow-300 text-sm mt-1">
            Extreme sensor values detected. Check sensor positioning and lighting conditions.
          </p>
        </Card>
      )}
    </div>
  );
};

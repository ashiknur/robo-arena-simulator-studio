
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity, Zap, RotateCw, MapPin, Clock } from 'lucide-react';

interface SimulationPanelProps {
  isRunning: boolean;
  sensorData: number[];
  robotPosition: { x: number; y: number; angle: number };
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  isRunning,
  sensorData,
  robotPosition
}) => {
  const [runtime, setRuntime] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setRuntime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const avgSensorValue = sensorData.reduce((a, b) => a + b, 0) / sensorData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Activity className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Simulation Status</h3>
      </div>

      {/* Status Overview */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Status</span>
              <Badge variant={isRunning ? 'default' : 'secondary'} className={isRunning ? 'bg-green-600' : ''}>
                {isRunning ? 'Running' : 'Stopped'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Runtime</span>
              <Badge variant="outline" className="font-mono">
                {runtime.toFixed(1)}s
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Position Data */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-blue-400" />
          <h4 className="font-medium text-white">Position</h4>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">X:</span>
              <span className="text-white ml-2 font-mono">{robotPosition.x.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400">Y:</span>
              <span className="text-white ml-2 font-mono">{robotPosition.y.toFixed(1)}</span>
            </div>
          </div>
          
          <div>
            <span className="text-slate-400 text-sm">Heading:</span>
            <span className="text-white ml-2 font-mono">{robotPosition.angle.toFixed(1)}°</span>
          </div>
        </div>
      </Card>

      {/* Sensor Readings */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="h-4 w-4 text-orange-400" />
          <h4 className="font-medium text-white">Sensor Readings</h4>
        </div>
        
        <div className="space-y-3">
          {sensorData.map((value, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">A{index}</span>
                <span className="text-white font-mono">{value}</span>
              </div>
              <Progress 
                value={(value / 1023) * 100} 
                className="h-2"
              />
              <div className="text-xs text-slate-500">
                {value < 500 ? 'Line Detected' : 'Surface'}
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-3 bg-slate-600" />
        
        <div className="text-sm">
          <span className="text-slate-400">Average:</span>
          <span className="text-white ml-2 font-mono">{avgSensorValue.toFixed(0)}</span>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-purple-400" />
          <h4 className="font-medium text-white">Performance</h4>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Simulation FPS</span>
            <Badge variant="outline" className="text-green-400 border-green-400">60</Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Loop Frequency</span>
            <Badge variant="outline">100 Hz</Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">Sensor Noise</span>
            <Badge variant="outline">±5%</Badge>
          </div>
        </div>
      </Card>

      {/* Motor Status */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <RotateCw className="h-4 w-4 text-green-400" />
          <h4 className="font-medium text-white">Motors</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Left (Pin 9)</div>
            <Progress value={60} className="h-2" />
            <div className="text-xs text-slate-500">153 PWM</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Right (Pin 10)</div>
            <Progress value={75} className="h-2" />
            <div className="text-xs text-slate-500">191 PWM</div>
          </div>
        </div>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Zap, RotateCw } from 'lucide-react';

interface RobotConfigProps {
  config: {
    sensorCount: number;
    sensorPositions: Array<{ x: number; y: number; angle: number }>;
  };
  onChange: (config: any) => void;
}

export const RobotConfig: React.FC<RobotConfigProps> = ({ config, onChange }) => {
  const updateSensorCount = (count: number) => {
    const newPositions = [];
    const angleStep = 90 / (count - 1); // Spread sensors across 90 degrees
    
    for (let i = 0; i < count; i++) {
      const angle = -45 + (i * angleStep); // -45 to +45 degrees
      newPositions.push({
        x: i * 10 - (count - 1) * 5, // Spread horizontally
        y: -35, // Fixed distance in front
        angle: angle
      });
    }
    
    onChange({
      ...config,
      sensorCount: count,
      sensorPositions: newPositions
    });
  };

  const updateSensorPosition = (index: number, field: 'x' | 'y' | 'angle', value: number) => {
    const newPositions = [...config.sensorPositions];
    newPositions[index] = {
      ...newPositions[index],
      [field]: value
    };
    
    onChange({
      ...config,
      sensorPositions: newPositions
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Robot Configuration</h3>
      </div>

      {/* Sensor Count */}
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white">Sensor Count</Label>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {config.sensorCount}
            </Badge>
          </div>
          <Slider
            value={[config.sensorCount]}
            onValueChange={(value) => updateSensorCount(value[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>1</span>
            <span>8</span>
          </div>
        </div>
      </Card>

      {/* Auto Configuration */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSensorCount(3)}
          className="text-slate-300 border-slate-600"
        >
          Basic (3)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateSensorCount(5)}
          className="text-slate-300 border-slate-600"
        >
          Standard (5)
        </Button>
      </div>

      <Separator className="bg-slate-600" />

      {/* Individual Sensor Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-orange-400" />
          <h4 className="font-medium text-white">Sensor Positions</h4>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {config.sensorPositions.map((sensor, index) => (
            <Card key={index} className="bg-slate-700/20 border-slate-600 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-300">Sensor {index + 1}</Label>
                  <Badge variant="secondary" className="text-xs">
                    A{index}
                  </Badge>
                </div>

                {/* X Position */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-400">X Position</Label>
                    <span className="text-xs text-slate-400">{sensor.x}px</span>
                  </div>
                  <Slider
                    value={[sensor.x]}
                    onValueChange={(value) => updateSensorPosition(index, 'x', value[0])}
                    min={-50}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Y Position */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-400">Y Position</Label>
                    <span className="text-xs text-slate-400">{sensor.y}px</span>
                  </div>
                  <Slider
                    value={[sensor.y]}
                    onValueChange={(value) => updateSensorPosition(index, 'y', value[0])}
                    min={-50}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Angle */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-400">Angle</Label>
                    <span className="text-xs text-slate-400">{sensor.angle}°</span>
                  </div>
                  <Slider
                    value={[sensor.angle]}
                    onValueChange={(value) => updateSensorPosition(index, 'angle', value[0])}
                    min={-90}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Motor Configuration */}
      <Separator className="bg-slate-600" />
      
      <Card className="bg-slate-700/30 border-slate-600 p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RotateCw className="h-4 w-4 text-green-400" />
            <Label className="text-white">Motor Settings</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="text-slate-400">Left Motor</Label>
              <Badge variant="outline" className="w-full justify-center">Pin 9</Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-400">Right Motor</Label>
              <Badge variant="outline" className="w-full justify-center">Pin 10</Badge>
            </div>
          </div>
          
          <div className="text-xs text-slate-500">
            PWM Range: 0-255 (0V - 5V)
          </div>
        </div>
      </Card>
    </div>
  );
};

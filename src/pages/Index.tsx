
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArenaCanvas } from '@/components/ArenaCanvas';
import { RobotConfig } from '@/components/RobotConfig';
import { CodeEditor } from '@/components/CodeEditor';
import { SimulationPanel } from '@/components/SimulationPanel';
import { SensorVisualization } from '@/components/SensorVisualization';
import { Play, Square, RotateCcw, Settings, Code, Zap } from 'lucide-react';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 400, y: 300, angle: 0 });
  const [sensorData, setSensorData] = useState([512, 512, 512, 512, 512]);
  const [robotConfig, setRobotConfig] = useState({
    sensorCount: 5,
    sensorPositions: [
      { x: -20, y: -30, angle: -45 },
      { x: -10, y: -35, angle: -22.5 },
      { x: 0, y: -35, angle: 0 },
      { x: 10, y: -35, angle: 22.5 },
      { x: 20, y: -30, angle: 45 }
    ]
  });
  const [code, setCode] = useState(`void setup() {
  // Initialize sensors and motors
  pinMode(A0, INPUT); // Left sensor
  pinMode(A1, INPUT); // Center-left sensor
  pinMode(A2, INPUT); // Center sensor
  pinMode(A3, INPUT); // Center-right sensor
  pinMode(A4, INPUT); // Right sensor
  
  pinMode(9, OUTPUT);  // Left motor
  pinMode(10, OUTPUT); // Right motor
}

void loop() {
  // Read sensor values (0-1023)
  int leftSensor = analogRead(A0);
  int centerLeftSensor = analogRead(A1);
  int centerSensor = analogRead(A2);
  int centerRightSensor = analogRead(A3);
  int rightSensor = analogRead(A4);
  
  // Simple line following logic
  if (centerSensor < 500) {
    // On line - go straight
    analogWrite(9, 200);  // Left motor
    analogWrite(10, 200); // Right motor
  } else if (leftSensor < 500 || centerLeftSensor < 500) {
    // Line to the left - turn left
    analogWrite(9, 100);  // Slow left motor
    analogWrite(10, 255); // Fast right motor
  } else if (rightSensor < 500 || centerRightSensor < 500) {
    // Line to the right - turn right
    analogWrite(9, 255);  // Fast left motor
    analogWrite(10, 100); // Slow right motor
  } else {
    // Lost line - stop
    analogWrite(9, 0);
    analogWrite(10, 0);
  }
  
  delay(10);
}`);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRobotPosition({ x: 400, y: 300, angle: 0 });
    setSensorData([512, 512, 512, 512, 512]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Robo Arena Simulator</h1>
                <p className="text-slate-400 text-sm">Advanced robotics simulation platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                Real-time
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                60 FPS
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Robot Configuration */}
          <div className="col-span-3 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full">
              <Tabs defaultValue="robot" className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="robot" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Robot</span>
                    </TabsTrigger>
                    <TabsTrigger value="simulation" className="flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Sim</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="robot" className="h-full p-4 overflow-y-auto">
                    <RobotConfig 
                      config={robotConfig}
                      onChange={setRobotConfig}
                    />
                  </TabsContent>
                  <TabsContent value="simulation" className="h-full p-4 overflow-y-auto">
                    <SimulationPanel 
                      isRunning={isRunning}
                      sensorData={sensorData}
                      robotPosition={robotPosition}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Center Panel - Arena */}
          <div className="col-span-6 space-y-4">
            {/* Control Bar */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleStart}
                      disabled={isRunning}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button 
                      onClick={handleStop}
                      disabled={!isRunning}
                      variant="destructive"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-400">
                      Position: ({robotPosition.x.toFixed(0)}, {robotPosition.y.toFixed(0)})
                    </div>
                    <div className="text-sm text-slate-400">
                      Angle: {robotPosition.angle.toFixed(1)}°
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Arena Canvas */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm flex-1">
              <div className="p-4 h-full">
                <ArenaCanvas 
                  robotPosition={robotPosition}
                  setRobotPosition={setRobotPosition}
                  robotConfig={robotConfig}
                  isRunning={isRunning}
                  code={code}
                  sensorData={sensorData}
                  setSensorData={setSensorData}
                />
              </div>
            </Card>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="col-span-3 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-full">
              <Tabs defaultValue="code" className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code" className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Code</span>
                    </TabsTrigger>
                    <TabsTrigger value="sensors" className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Sensors</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="code" className="h-full">
                    <CodeEditor 
                      code={code}
                      onChange={setCode}
                    />
                  </TabsContent>
                  <TabsContent value="sensors" className="h-full p-4 overflow-y-auto">
                    <SensorVisualization 
                      sensorData={sensorData}
                      robotConfig={robotConfig}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Brush, Upload, Eraser, Grid, Circle } from 'lucide-react';

interface ArenaCanvasProps {
  robotPosition: { x: number; y: number; angle: number };
  setRobotPosition: (pos: { x: number; y: number; angle: number }) => void;
  robotConfig: any;
  isRunning: boolean;
  code: string;
  sensorData: number[];
  setSensorData: (data: number[]) => void;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  robotPosition,
  setRobotPosition,
  robotConfig,
  isRunning,
  code,
  sensorData,
  setSensorData
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'draw' | 'erase'>('draw');
  const [trackData, setTrackData] = useState<ImageData | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const animationFrameRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const ROBOT_SIZE = 30;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up initial white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw a sample track
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 300);
    ctx.quadraticCurveTo(400, 100, 700, 300);
    ctx.quadraticCurveTo(400, 500, 100, 300);
    ctx.stroke();

    // Store initial track data
    setTrackData(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
  }, []);

  // Simulation loop
  const simulate = useCallback(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update sensor readings based on robot position
    const newSensorData = robotConfig.sensorPositions.map((sensor: any, index: number) => {
      const sensorX = robotPosition.x + sensor.x * Math.cos(robotPosition.angle * Math.PI / 180) - sensor.y * Math.sin(robotPosition.angle * Math.PI / 180);
      const sensorY = robotPosition.y + sensor.x * Math.sin(robotPosition.angle * Math.PI / 180) + sensor.y * Math.cos(robotPosition.angle * Math.PI / 180);
      
      // Sample the pixel at sensor position
      const imageData = ctx.getImageData(Math.max(0, Math.min(CANVAS_WIDTH-1, sensorX)), Math.max(0, Math.min(CANVAS_HEIGHT-1, sensorY)), 1, 1);
      const brightness = (imageData.data[0] + imageData.data[1] + imageData.data[2]) / 3;
      
      // Convert to analog reading (0-1023, where 0 is black line, 1023 is white surface)
      return Math.round(brightness * 4);
    });

    setSensorData(newSensorData);

    // Simple physics simulation based on code
    // This is a simplified interpretation of the Arduino code
    const leftSensor = newSensorData[0] || 512;
    const centerLeftSensor = newSensorData[1] || 512;
    const centerSensor = newSensorData[2] || 512;
    const centerRightSensor = newSensorData[3] || 512;
    const rightSensor = newSensorData[4] || 512;

    let leftMotor = 0;
    let rightMotor = 0;

    // Basic line following logic (simplified from the code)
    if (centerSensor < 500) {
      leftMotor = 200;
      rightMotor = 200;
    } else if (leftSensor < 500 || centerLeftSensor < 500) {
      leftMotor = 100;
      rightMotor = 255;
    } else if (rightSensor < 500 || centerRightSensor < 500) {
      leftMotor = 255;
      rightMotor = 100;
    }

    // Convert motor speeds to movement
    const speed = (leftMotor + rightMotor) / 2 / 255 * 2;
    const turnRate = (rightMotor - leftMotor) / 255 * 3;

    setRobotPosition(prev => ({
      x: Math.max(ROBOT_SIZE, Math.min(CANVAS_WIDTH - ROBOT_SIZE, prev.x + speed * Math.cos(prev.angle * Math.PI / 180))),
      y: Math.max(ROBOT_SIZE, Math.min(CANVAS_HEIGHT - ROBOT_SIZE, prev.y + speed * Math.sin(prev.angle * Math.PI / 180))),
      angle: (prev.angle + turnRate) % 360
    }));

    animationFrameRef.current = requestAnimationFrame(simulate);
  }, [isRunning, robotPosition, robotConfig, setSensorData, setRobotPosition]);

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(simulate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, simulate]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw background
    if (trackData) {
      ctx.putImageData(trackData, 0, 0);
    }

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }

    // Draw robot
    ctx.save();
    ctx.translate(robotPosition.x, robotPosition.y);
    ctx.rotate(robotPosition.angle * Math.PI / 180);

    // Robot body
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-ROBOT_SIZE/2, -ROBOT_SIZE/2, ROBOT_SIZE, ROBOT_SIZE);

    // Robot direction indicator
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(ROBOT_SIZE/2, 0);
    ctx.lineTo(ROBOT_SIZE/2 - 10, -5);
    ctx.lineTo(ROBOT_SIZE/2 - 10, 5);
    ctx.fill();

    // Draw sensors
    robotConfig.sensorPositions.forEach((sensor: any, index: number) => {
      ctx.fillStyle = sensorData[index] < 500 ? '#ef4444' : '#22c55e';
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();

    requestAnimationFrame(render);
  }, [robotPosition, robotConfig, sensorData, trackData, showGrid]);

  useEffect(() => {
    render();
  }, [render]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = drawMode === 'erase' ? 'destination-out' : 'source-over';
    ctx.fillStyle = drawMode === 'draw' ? '#000000' : 'transparent';
    ctx.beginPath();
    ctx.arc(x, y, drawMode === 'draw' ? 2 : 8, 0, 2 * Math.PI);
    ctx.fill();

    // Update track data
    setTrackData(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    setTrackData(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-2 bg-slate-700/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant={drawMode === 'draw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawMode('draw')}
          >
            <Brush className="h-4 w-4 mr-1" />
            Draw
          </Button>
          <Button
            variant={drawMode === 'erase' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawMode('erase')}
          >
            <Eraser className="h-4 w-4 mr-1" />
            Erase
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-lg border-2 border-slate-300">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

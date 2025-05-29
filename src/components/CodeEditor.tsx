
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Play, CheckCircle } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const handleCompile = () => {
    // Simple syntax validation
    const hasSetup = code.includes('void setup()');
    const hasLoop = code.includes('void loop()');
    
    if (hasSetup && hasLoop) {
      console.log('Code compiled successfully!');
    } else {
      console.log('Compilation error: Missing setup() or loop() function');
    }
  };

  const loadExample = (type: 'basic' | 'pid' | 'advanced') => {
    let exampleCode = '';
    
    switch (type) {
      case 'basic':
        exampleCode = `void setup() {
  pinMode(A2, INPUT); // Center sensor
  pinMode(9, OUTPUT); // Left motor
  pinMode(10, OUTPUT); // Right motor
}

void loop() {
  int centerSensor = analogRead(A2);
  
  if (centerSensor < 500) {
    // On black line
    analogWrite(9, 150);
    analogWrite(10, 150);
  } else {
    // Off line - stop
    analogWrite(9, 0);
    analogWrite(10, 0);
  }
  
  delay(50);
}`;
        break;
      case 'pid':
        exampleCode = `// PID Line Following
float Kp = 0.5;
float Ki = 0.0;
float Kd = 0.1;
float lastError = 0;
float integral = 0;

void setup() {
  pinMode(A0, INPUT); // Left sensor
  pinMode(A1, INPUT); // Center-left sensor
  pinMode(A2, INPUT); // Center sensor
  pinMode(A3, INPUT); // Center-right sensor
  pinMode(A4, INPUT); // Right sensor
  
  pinMode(9, OUTPUT); // Left motor
  pinMode(10, OUTPUT); // Right motor
}

void loop() {
  // Read sensors
  int s0 = analogRead(A0);
  int s1 = analogRead(A1);
  int s2 = analogRead(A2);
  int s3 = analogRead(A3);
  int s4 = analogRead(A4);
  
  // Calculate position (-2 to +2)
  float position = 0;
  int count = 0;
  
  if (s0 < 500) { position += -2; count++; }
  if (s1 < 500) { position += -1; count++; }
  if (s2 < 500) { position += 0; count++; }
  if (s3 < 500) { position += 1; count++; }
  if (s4 < 500) { position += 2; count++; }
  
  if (count > 0) position /= count;
  
  // PID calculation
  float error = position;
  integral += error;
  float derivative = error - lastError;
  float output = Kp * error + Ki * integral + Kd * derivative;
  
  // Motor control
  int baseSpeed = 150;
  int leftSpeed = baseSpeed + output;
  int rightSpeed = baseSpeed - output;
  
  // Constrain speeds
  leftSpeed = constrain(leftSpeed, 0, 255);
  rightSpeed = constrain(rightSpeed, 0, 255);
  
  analogWrite(9, leftSpeed);
  analogWrite(10, rightSpeed);
  
  lastError = error;
  delay(10);
}`;
        break;
      case 'advanced':
        exampleCode = `// Advanced Line Following with State Machine
enum RobotState {
  FOLLOWING,
  SEARCHING_LEFT,
  SEARCHING_RIGHT,
  LOST
};

RobotState currentState = FOLLOWING;
unsigned long stateStartTime = 0;
float Kp = 0.6, Ki = 0.0, Kd = 0.2;
float lastError = 0, integral = 0;

void setup() {
  // Initialize sensors
  for(int i = 0; i < 5; i++) {
    pinMode(A0 + i, INPUT);
  }
  
  pinMode(9, OUTPUT);  // Left motor
  pinMode(10, OUTPUT); // Right motor
  
  Serial.begin(9600);
}

void loop() {
  int sensors[5];
  for(int i = 0; i < 5; i++) {
    sensors[i] = analogRead(A0 + i);
  }
  
  float position = calculatePosition(sensors);
  bool lineDetected = isLineDetected(sensors);
  
  switch(currentState) {
    case FOLLOWING:
      if(lineDetected) {
        pidControl(position);
      } else {
        currentState = SEARCHING_LEFT;
        stateStartTime = millis();
      }
      break;
      
    case SEARCHING_LEFT:
      analogWrite(9, 100);
      analogWrite(10, 200);
      if(lineDetected) {
        currentState = FOLLOWING;
      } else if(millis() - stateStartTime > 500) {
        currentState = SEARCHING_RIGHT;
        stateStartTime = millis();
      }
      break;
      
    case SEARCHING_RIGHT:
      analogWrite(9, 200);
      analogWrite(10, 100);
      if(lineDetected) {
        currentState = FOLLOWING;
      } else if(millis() - stateStartTime > 1000) {
        currentState = LOST;
      }
      break;
      
    case LOST:
      analogWrite(9, 0);
      analogWrite(10, 0);
      break;
  }
  
  delay(10);
}

float calculatePosition(int sensors[]) {
  float weighted_sum = 0;
  int sum = 0;
  
  for(int i = 0; i < 5; i++) {
    if(sensors[i] < 500) {
      weighted_sum += (i - 2) * 1000;
      sum += 1000;
    }
  }
  
  return sum > 0 ? weighted_sum / sum : 0;
}

bool isLineDetected(int sensors[]) {
  for(int i = 0; i < 5; i++) {
    if(sensors[i] < 500) return true;
  }
  return false;
}

void pidControl(float position) {
  float error = position;
  integral += error;
  float derivative = error - lastError;
  float output = Kp * error + Ki * integral + Kd * derivative;
  
  int baseSpeed = 150;
  int leftSpeed = constrain(baseSpeed + output, 0, 255);
  int rightSpeed = constrain(baseSpeed - output, 0, 255);
  
  analogWrite(9, leftSpeed);
  analogWrite(10, rightSpeed);
  
  lastError = error;
}`;
        break;
    }
    
    onChange(exampleCode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Arduino IDE</h3>
          <Badge variant="outline" className="text-green-400 border-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button onClick={handleCompile} size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Play className="h-3 w-3 mr-1" />
            Verify
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Example Templates */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadExample('basic')}
            className="text-xs"
          >
            Basic
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadExample('pid')}
            className="text-xs"
          >
            PID
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadExample('advanced')}
            className="text-xs"
          >
            Advanced
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 p-4">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full bg-slate-900 text-green-400 font-mono text-sm p-4 rounded border border-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
          placeholder="// Enter your Arduino code here
void setup() {
  // Initialization code
}

void loop() {
  // Main program loop
}"
        />
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-slate-700 bg-slate-800/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Lines: {code.split('\n').length}</span>
          <span>Arduino Uno | COM3</span>
        </div>
      </div>
    </div>
  );
};

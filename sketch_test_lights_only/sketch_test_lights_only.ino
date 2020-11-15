#include <SPI.h>

  int sensorPin = A0; //define sensor pin
  int sensorValue;
  int sensorInput;

  int whatToDo;

  int greenState = 1;
  int redState = 1;
  int motorState = 1;
  int someState = 1;

  int LED1 = 2;
  int LED2 = 3;
  int LED3 = 4;
  int LED4 = 5;

// setup code
void setup() {
   Serial.begin(9600); //Start the Serial Port at 9600 baud (default)


  pinMode(LED1, OUTPUT); // Declare the LED as an output
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
}

void loop() {
  
   // read analog values and convert to centagrate
    sensorInput = analogRead(sensorPin);    //read the analog sensor and store it
    float voltage = sensorInput * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC1 = (voltage - 0.5) * 100 ;               //Subtract the offset 
    int sensorInput2 = analogRead(A1);    //read the analog sensor and store it
    float voltage2 = sensorInput2 * 5.0;       //find percentage of input reading
    voltage2 /= 1024;                 //
    float tempC2 = (voltage2 - 0.5) * 100 ;               //Subtract the offset 
    int sensorInput3 = analogRead(A2);    //read the analog sensor and store it
    float voltage3 = sensorInput3 * 5.0;       //find percentage of input reading
    voltage3 /= 1024;                 //
    float tempC3 = (voltage3 - 0.5) * 100 ;               //Subtract the offset 
   // end temp sense section

    Serial.print  ("Current Temperature: ");
    Serial.print  ("temp1: ");
    Serial.print  (tempC1);
    Serial.print  (" temp2: ");
    Serial.print  (tempC2);
    Serial.print  (" temp3: ");
    Serial.println(tempC3);

    char tBuffer1[16];
    char tBuffer2[16];
    char tBuffer3[16];
    char tempBufferFirst = dtostrf(tempC1,5,2,tBuffer1);
    char tempBuffer2 =     dtostrf(tempC2,5,2,tBuffer2);
    char tempBuffer3 =     dtostrf(tempC3,5,2,tBuffer3);

    Serial.print("Temperatures in Byte Array - ");
    Serial.print(tBuffer1);
    Serial.print(" temp2: ");
    Serial.print(tBuffer2);
    Serial.print(" temp3: ");
    Serial.println(tBuffer3);

   
  // Blink led 4
  digitalWrite(LED4, HIGH);
  delay(200);
  digitalWrite(LED4, LOW);
  delay(1000);
///////
  Serial.print("The Green state - ");
  Serial.print(greenState);
  Serial.print(" Red State - ");
  Serial.print(redState);
  Serial.print(" Motor State - ");
  Serial.println(motorState);
   
}

#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

  // config for the Aduino side
  byte arduinoMac[] = { 0xA8, 0x61, 0x0A, 0xAE, 0x41, 0x66 };
  unsigned int arduinoPort = 8888;      // port of Arduino
  
  // config for the PC side
  IPAddress receiverIP(192, 168, 1, 13); // IP of udp packets receiver
  unsigned int receiverPort = 6000;      // port to listen on my PC

  // An EthernetUDP instance to let us send and receive packets over UDP
  EthernetUDP Udp;

  // buffers for receiving and sending data
  char packetBuffer [11];  //buffer to hold incoming packet,

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

   Serial.println("Initialize Ethernet with DHCP:");
   if (Ethernet.begin(arduinoMac) == 0) {
       Serial.println("Failed to configure Ethernet using DHCP");
       if (Ethernet.hardwareStatus() == EthernetNoHardware) {
          Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
       } else if (Ethernet.linkStatus() == LinkOFF) {
          Serial.println("Ethernet cable is not connected.");
       }
       // no point in carrying on, so do nothing forevermore:
       while (true) { delay(1); }
   }
   Udp.begin(arduinoPort);

  //print your local IP address:
  Serial.print("Arduino IP address: ");
  Serial.print(Ethernet.localIP());
  Serial.print(" port ");
  Serial.println(arduinoPort);

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

//    Serial.print  ("Current Temperature: ");
//    Serial.print  ("temp1: ");
//    Serial.print  (tempC1);
//    Serial.print  (" temp2: ");
//    Serial.print  (tempC2);
//    Serial.print  (" temp3: ");
//    Serial.println(tempC3);

    char tBuffer1[16];
    char tBuffer2[16];
    char tBuffer3[16];
    char tempBufferFirst = dtostrf(tempC1,5,2,tBuffer1);
    char tempBuffer2 =     dtostrf(tempC2,5,2,tBuffer2);
    char tempBuffer3 =     dtostrf(tempC3,5,2,tBuffer3);

//    Serial.print("Temperatures in Byte Array - ");
//    Serial.print(tBuffer1);
//    Serial.print(" temp2: ");
//    Serial.print(tBuffer2);
//    Serial.print(" temp3: ");
//    Serial.println(tBuffer3);

   Udp.beginPacket(receiverIP, receiverPort); //start udp packet
   Udp.write(tBuffer1, 5); //write sensor data to udp packet
   Udp.write(tBuffer2, 5);
   Udp.write(tBuffer3, 5);
   Udp.endPacket(); // end packet

// This section recieves UDP packets
// if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize > 0)
  {
    Serial.print("Received packet of size ");
    Serial.println(packetSize);
    Serial.print("From ");
    IPAddress remote = Udp.remoteIP();
      for (int i =0; i < 4; i++)
      {
        Serial.print(remote[i], DEC);
        if (i < 3)
        {
          Serial.print(".");
        }
      }
    Serial.print(", port ");
    Serial.println(Udp.remotePort());

    // read the packet into packetBufffer
    Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
    Serial.print("Contents: ");
    Serial.println(packetBuffer);
    whatToDo = atoi (packetBuffer);

  switch (whatToDo){
    case 01:
      if (greenState == 1){
        digitalWrite(LED1, HIGH);
        Serial.println("just set green high");
        greenState = 2;
      } else if (greenState == 2) {
        digitalWrite(LED1, LOW);
        Serial.println("just set green low");
        greenState = 1;
      }
      break;
    case 02:
      if (redState == 1){
        digitalWrite(LED2, HIGH);
        Serial.println("just set red high");
        redState = 2;
      } else {
        digitalWrite(LED2, LOW);
        Serial.println("just set red low");
        redState = 1;
      }
      break;
    case 03:
        digitalWrite(LED3, HIGH);
        Serial.println("just set run recirc high");
        motorState = 2;
        break;
    case 04:
        digitalWrite(LED3, LOW);
        Serial.println("just set recirc low");
        motorState = 1;
        break;
    default:
        Serial.println("hit the default");
        break;
    }
    
   // end got a packet
   };
//  digitalWrite(LED1, HIGH);
//  Serial.println("just set led4 high");
//  delay(200);
//  digitalWrite(LED1, LOW);
//  Serial.println("just set led4 low");
//  delay(1000);
//  digitalWrite(LED2, HIGH);
//  Serial.println("just set led4 high");
//  delay(200);
//  digitalWrite(LED2, LOW);
//  Serial.println("just set led4 low");
//  delay(1000);
//  digitalWrite(LED3, HIGH);
//  Serial.println("just set led4 high");
//  delay(200);
//  digitalWrite(LED3, LOW);
//  Serial.println("just set led4 low");
//  delay(1000);
  digitalWrite(LED4, HIGH);
//  Serial.println("just set led4 high");
  delay(200);
  digitalWrite(LED4, LOW);
//  Serial.println("just set led4 low");
  delay(1000);
///////
  Serial.print("The Green state - ");
  Serial.print(greenState);
  Serial.print(" Red State - ");
  Serial.print(redState);
  Serial.print(" Motor State - ");
  Serial.println(motorState);
   
}

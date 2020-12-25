#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <math.h>

  // config for the Aduino side
  byte arduinoMac[] = { 0xA8, 0x61, 0x0A, 0xAE, 0x41, 0x66 };
  unsigned int arduinoPort = 8888;      // port of Arduino
  
  // config for the PC side
  IPAddress receiverIP(192, 168, 1, 5); // IP of udp packets receiver
  unsigned int receiverPort = 6000;      // port to listen on my PC

  // An EthernetUDP instance to let us send and receive packets over UDP
  EthernetUDP Udp;

  // buffers for receiving and sending data
  char packetBuffer [11];  //buffer to hold incoming packet,

  int sensorPin1 = A0; //define sensor pin
  int sensorPin2 = A1;
  int sensorPin3 = A2;
  int sensorPin4 = A3;
  
  int sensorValue;
  int sensorInput;

  int whatToDo;

  int greenState = 0;
  int redState = 0;
  int motorState = 0;
  int someState = 0;

  int LED1 = 2;
  int LED2 = 3;
  int LED3 = 6;  // motor output
  int LED4 = 5;  // Blinker

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
  pinMode(LED3, OUTPUT); // Motor output digital output 6
  pinMode(LED4, OUTPUT);

  analogReference(EXTERNAL);
}

void loop() {

  // This section recieves UDP packets
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize > 0)
  {
    Serial.print("Arduino received packet of size ");
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
        if (greenState == 0){
          digitalWrite(LED1, HIGH);
          Serial.println("just set green high");
          greenState = 1;
          } else if (greenState == 1) {
            digitalWrite(LED1, LOW);
            Serial.println("just set green low");
            greenState = 0;
          }
      break;
      case 02:
        if (redState == 0){
          digitalWrite(LED2, HIGH);
          Serial.println("just set red high");
          redState = 1;
        } else {
          digitalWrite(LED2, LOW);
          Serial.println("just set red low");
          redState = 0;
          }
      break;
      case 03:
          digitalWrite(LED3, HIGH);   // output 4 motor output
          Serial.println("just set run recirc high");
          motorState = 1;
      break;
      case 04:
          digitalWrite(LED3, LOW);
          Serial.println("just set recirc low");
          motorState = 0;
      break;
      default:
        Serial.println("hit the default");
        break;
    }
    // end got a packet
   };


  //  SEND FLAGS TO SERVER

    char flags[100];
    sprintf(flags, "%d:%d:%d:%d", greenState, redState, motorState, someState);
    Serial.print("flags in one string ");
    Serial.println(flags);

    Udp.beginPacket(receiverIP, receiverPort);
    Udp.write("f", 1);    //identify packet as a flag packet
    Udp.write(flags, 7);
    Udp.endPacket();

  //  END SEND FLAGS

    //  READ TEMPERATURES
   // read analog values and convert to centagrate
    sensorInput = analogRead(sensorPin1);    //read the analog sensor and store it
    float voltage = sensorInput * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC1 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    int sensorInput2 = analogRead(sensorPin2);    //read the analog sensor and store it
    float voltage2 = sensorInput2 * 5.0;       //find percentage of input reading
    voltage2 /= 1024;                 //
    float tempC2 = (voltage2 - 0.5) * 100 ;               //Subtract the offset 

    int sensorInput3 = analogRead(sensorPin3);    //read the analog sensor and store it
    float voltage3 = sensorInput3 * 5.0;       //find percentage of input reading
    voltage3 /= 1024;                 //
    float tempC3 = (voltage3 - 0.5) * 100 ;               //Subtract the offset 

    int sensorInput4 = analogRead(sensorPin4);    //read the analog sensor and store it
    float voltage4 = sensorInput4 * 5.0;       //find percentage of input reading
    voltage4 /= 1024;                 //
    float tempC4 = (voltage4 - 0.5) * 100 ;               //Subtract the offset 
    
   // end temp sense section

    Serial.print  ("Serial Data - Current Temperature: ");
    Serial.print  ("temp1: ");
    Serial.print  (tempC1);
    Serial.print  (" temp2: ");
    Serial.print  (tempC2);
    Serial.print  (" temp3: ");
    Serial.print  (tempC3);
    Serial.print  (" pipe temp: ");
    Serial.println(tempC4);

    char tBuffer1[8];
    char tBuffer2[8];
    char tBuffer3[8];
    char tBuffer4[8];
    dtostrf(tempC1,5,2,tBuffer1);
    dtostrf(tempC2,5,2,tBuffer2);
    dtostrf(tempC3,5,2,tBuffer3);
    dtostrf(tempC4,5,2,tBuffer4);

    Serial.print("Temperatures in Byte Array - ");
    Serial.print(tBuffer1);
    Serial.print(" temp2: ");
    Serial.print(tBuffer2);
    Serial.print(" temp3: ");
    Serial.print(tBuffer3);
    Serial.print(" temp4: ");
    Serial.println(tBuffer4);

    // Blink led 2 (digital output 3)
//    digitalWrite(LED2, HIGH);
//    delay(500);
//    digitalWrite(LED2, LOW);
//    delay(500);

    // Blink led 3 (digital output 1)
//    digitalWrite(LED3, HIGH);
//    delay(500);
//    digitalWrite(LED3, LOW);
//    delay(500);


    Udp.beginPacket(receiverIP, receiverPort); //start udp packet
    Udp.write("t", 1);  //identify packet as a temperture packet
    Udp.write(tBuffer1, 5); //write sensor data to udp packet
    Udp.write(tBuffer2, 5);
    Udp.write(tBuffer3, 5);
    Udp.write(tBuffer4, 5);
    Udp.endPacket(); // end packet

////////

//    char flags[100];
//    sprintf(flags, "%d:%d:%d:%d", greenState, redState, motorState, someState);
//    Serial.print("flags in one string ");
//    Serial.println(flags);
//
//    Udp.beginPacket(receiverIP, receiverPort);
//    Udp.write("f", 1);    //identify packet as a flag packet
//    Udp.write(flags, 7);
//    Udp.endPacket();

  //Blink led 1 (digital output 2)
//  digitalWrite(LED1, HIGH);
//  delay(500);
//  digitalWrite(LED1, LOW);
//  delay(500);


// This section recieves UDP packets
// if there's data available, read a packet
//  int packetSize = Udp.parsePacket();
//  if(packetSize > 0)
//  {
//    Serial.print("Arduino received packet of size ");
//    Serial.println(packetSize);
//    Serial.print("From ");
//    IPAddress remote = Udp.remoteIP();
//      for (int i =0; i < 4; i++)
//      {
//        Serial.print(remote[i], DEC);
//        if (i < 3)
//        {
//          Serial.print(".");
//        }
//      }
//    Serial.print(", port ");
//    Serial.println(Udp.remotePort());
//
//    // read the packet into packetBufffer
//    Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
//    Serial.print("Contents: ");
//    Serial.println(packetBuffer);
//    whatToDo = atoi (packetBuffer);
//
//    switch (whatToDo){
//      case 01:
//        if (greenState == 0){
//          digitalWrite(LED1, HIGH);
//          Serial.println("just set green high");
//          greenState = 1;
//          } else if (greenState == 1) {
//            digitalWrite(LED1, LOW);
//            Serial.println("just set green low");
//            greenState = 0;
//          }
//      break;
//      case 02:
//        if (redState == 0){
//          digitalWrite(LED2, HIGH);
//          Serial.println("just set red high");
//          redState = 1;
//        } else {
//          digitalWrite(LED2, LOW);
//          Serial.println("just set red low");
//          redState = 0;
//          }
//      break;
//      case 03:
//          digitalWrite(LED3, HIGH);   // output 4 motor output
//          Serial.println("just set run recirc high");
//          motorState = 1;
//      break;
//      case 04:
//          digitalWrite(LED3, LOW);
//          Serial.println("just set recirc low");
//          motorState = 0;
//      break;
//      default:
//        Serial.println("hit the default");
//        break;
//    }
//    // end got a packet
//   };
   
  // Blink led 4 (digital output 5)
  digitalWrite(LED4, HIGH);
  delay(1000);
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

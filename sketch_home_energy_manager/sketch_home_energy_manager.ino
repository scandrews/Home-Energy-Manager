#include <SPI.h>  //Serial communications
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <math.h>
#include <OneWire.h> 
#include <DallasTemperature.h>

  // config for the Aduino side
  byte arduinoMac[] = { 0xA8, 0x61, 0x0A, 0xAE, 0x41, 0x66 };
  unsigned int arduinoPort = 8888;      // port of Arduino
  
  // config for the server side
  IPAddress receiverIP(192, 168, 1, 9); // IP of udp packets receiver - server
  unsigned int receiverPort = 6000;      // port to listen on my PC

  // An EthernetUDP instance to let us send and receive packets over UDP
  EthernetUDP Udp;

  // buffers for receiving and sending data
  char packetBuffer [17];  //buffer to hold incoming packet,
                           // 12 for IP numbers + 3 for the periods + 2 for my lead "what to do"
                           
  //define sensor pins
  int sensorPin1 = A0; // 1 - Wood Stove
  int sensorPin2 = A1; // 2 - Bread Board
  int sensorPin3 = A2; // 3 - Bedroom
  int sensorPin4 = A3; // 4 - Pipe
  int sensorPin5 = A4; // 5 - Furnace
  int sensorPin6 = A5; // 6 - Bread Board

  //int sensorValue;
  float sensorInput1;
  float sensorInput2;
  float sensorInput3;
  float sensorInput4;
  float sensorInput5;
  float sensorInput6;

  float tempC4;
  float voltage;

  float pipeTempUpper = 110;

  int whatToDo;

  int greenState = 0;
  int redState = 0;
  int motorState = 0;
  int someState = 0;

  int LED1 = 2;
  int LED2 = 3;
  int LED3 = 6;  // motor output
  int LED4 = 5;  // Blinker

  // one wire set up for input D2
  int ONE_WIRE_BUS = 3;

  // Setup a oneWire instance to communicate with any OneWire devices  
  // (not just Maxim/Dallas temperature ICs) 
  OneWire oneWire(ONE_WIRE_BUS); 

  // Pass our oneWire reference to Dallas Temperature. 
  DallasTemperature sensors(&oneWire);
//  float temp5 = 0;
  
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

//  analogReference(EXTERNAL);
//  analogReference(INTERNAL);

   // Start the Digital Sensor library
   sensors.begin();
}


void loop() {
  Serial.print("Arduino tinks the Current Server IP Address - ");
  Serial.println(receiverIP);

  // This section checks if the pump is running and turns it off
  // when temperature is reached
  if (motorState == 1){
    if (((tempC4 * 9/5) + 32) >= pipeTempUpper){
          digitalWrite(LED3, LOW);
          Serial.println("just set recirc low");
          motorState = 0;
    };
  };

  // This section recieves UDP packets
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize > 0)
  {
      Serial.print("Arduino received packet of size ");
      Serial.println(packetSize);
      Serial.print("From ");
      IPAddress remote = Udp.remoteIP();
        for (int i =0; i < 4; i++) {
          Serial.print(remote[i], DEC);
          if (i < 3) {
            Serial.print(".");
          }
        }
      Serial.print(", port ");
      Serial.println(Udp.remotePort());

      // read the packet into packetBufffer
      Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
      Serial.print("Contents: ");
      Serial.println(packetBuffer);   // packetBuffer is type char [17]

      Serial.print("first part packet buffer - ");
      Serial.print(packetBuffer[0]);
      Serial.print("second part packet buffer - ");
      Serial.println(packetBuffer[1]);

      //    IPAddress receiverIP(192, 168, 1, 9); // IP of udp packets receiver - server
      IPAddress newIPAddress2 (0, 0, 0, 0);
      for (int i=0; i<4; i++){
         newIPAddress2[i] = packetBuffer[i+3];
      };

      Serial.print("new IP Address in newAddress2 veriable - ");
      Serial.println(newIPAddress2);

     //    char Value2;
     //    char firstIPsection2;
     //    char secondIPsection2;
     //    char thirdIPsection2;
     //    char fourthIPsection2;
     //    Value2 = strtok(packetBuffer," ");
     //    firstIPsection2 = strtok(NULL, " .");
     //    secondIPsection2 = strtok(NULL, " .");
     //    thirdIPsection2 = strtok(NULL, " .");
     //    fourthIPsection2 = strtok(NULL, " .");

     //    Serial.print("Try for binary - ");
     //    Serial.println(firstIPsection2);


    char * Value1;
    char * firstIPsection;
    char * secondIPsection;
    char * thirdIPsection;
    char * fourthIPsection;
    Value1 = strtok(packetBuffer," ");
    firstIPsection = strtok(NULL, " .");
    secondIPsection = strtok(NULL, " .");
    thirdIPsection = strtok(NULL, " .");
    fourthIPsection = strtok(NULL, " .");

    Serial.print("first IP section - ");
    Serial.print(firstIPsection);
    Serial.print(" Second IP section - ");
    Serial.print(secondIPsection);
    Serial.print(" Third IP section - ");
    Serial.print(thirdIPsection);
    Serial.print(" Forth IP section - ");
    Serial.println(fourthIPsection);

    //    IPAddress newIPAddress;
    char newIPAddress[30];
    strcpy(newIPAddress, byte(firstIPsection));
    strcat(newIPAddress, ", ");
    strcat(newIPAddress, byte(secondIPsection));
    strcat(newIPAddress, ", ");
    strcat(newIPAddress, byte(thirdIPsection));
    strcat(newIPAddress, ", ");
    strcat(newIPAddress, byte(fourthIPsection));

    //    tryagainIP[0] = byte firstIPsection;
    //    tryagainIP[1] = byte secondIPsection;
    //    tryagainIP[2] = byte thirdIPsection;
    //    tryagainIP[3] = byte 
    
    //    char buf[30];
    //  const char *first = "sent ";
    //  const char *second = "message";
    //  strcpy(buf,first);
    //  strcat(buf,second);

      //    whatToDo = Value1;
    whatToDo = atoi (Value1);
      //    char NewIPAddress = atoi (Value2);

    Serial.print("value 1 - ");
    Serial.print(Value1);
    Serial.print(" What To Do - ");
    Serial.print(whatToDo);
    Serial.print(" value 2 - ");
    Serial.print(firstIPsection);
    Serial.print(" second IP Section - ");
    Serial.print(secondIPsection);
    Serial.print(" New IP Address - ");
    Serial.println(newIPAddress);
    
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
      case 05:
          Serial.println("got the update server IP Address packet");
//          receiverIP = cast(

          //IPAddress addr;
//          if (receiverIP.fromString(newIPAddress)) {
//                Serial.println("it was a valid address, do something with it");
//          }
//          bool i;
//          receiverIP == 
//          i = receiverIP.fromString(newIPAddress);
//          if (i) {
//            Serial.println("trying to set the IP - ");
//            for (int a = 0; a < 4; a++) {
//                recieverIP[a] = ip[a];
//            }
//          }

//          receiverIP = fromString(newIPAddress);
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
    sensorInput1 = analogRead(sensorPin1);    //read the analog sensor and store it
    voltage = sensorInput1 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC1 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput2 = analogRead(sensorPin2);    //read the analog sensor and store it
    voltage = sensorInput2 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC2 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput3 = analogRead(sensorPin3);    //read the analog sensor and store it
    voltage = sensorInput3 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC3 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput4 = analogRead(sensorPin4);    //read the analog sensor and store it
    voltage = sensorInput4 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    tempC4 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput5 = analogRead(sensorPin5);    //read the analog sensor and store it
    voltage = sensorInput5 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC5 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput6 = analogRead(sensorPin6);    //read the analog sensor and store it
    voltage = sensorInput6 * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC6 = (voltage - 0.5) * 100 ;               //Subtract the offset 

   // end analog temperature sense section

  // to issue a global temperature and Requests to all devices on the bus
    // Send the command to get temperature readings 
    sensors.requestTemperatures();

    float tempC7 = sensors.getTempCByIndex(0); // Why "byIndex"?  
   // You can have more than one DS18B20 on the same bus.  
   // 0 refers to the first IC on the wire 
   

    Serial.print  ("Serial Data - Current Temperature: ");
    Serial.print  ("temp1: ");
    Serial.print  (tempC1);
    Serial.print  (" temp2: ");
    Serial.print  (tempC2);
    Serial.print  (" temp3: ");
    Serial.print  (tempC3);
    Serial.print  (" pipe temp: ");
    Serial.print  (tempC4);
    Serial.print (" DS18 Data - ");
    Serial.println(tempC5);

    char tBuffer1[8];
    char tBuffer2[8];
    char tBuffer3[8];
    char tBuffer4[8];
    char tBuffer5[8];
    char tBuffer6[8];
    char tBuffer7[8];
    dtostrf(tempC1,5,2,tBuffer1);
    dtostrf(tempC2,5,2,tBuffer2);
    dtostrf(tempC3,5,2,tBuffer3);
    dtostrf(tempC4,5,2,tBuffer4);
    dtostrf(tempC5,5,2,tBuffer5);
    dtostrf(tempC6,5,2,tBuffer6);
    dtostrf(tempC7,5,2,tBuffer7);

    Serial.print("Temperatures in Byte Array - ");
    Serial.print(tBuffer1);
    Serial.print(" temp2: ");
    Serial.print(tBuffer2);
    Serial.print(" temp3: ");
    Serial.print(tBuffer3);
    Serial.print(" temp4: ");
    Serial.println(tBuffer4);

    Udp.beginPacket(receiverIP, receiverPort); //start udp packet
    Udp.write("t", 1);  //identify packet as a temperture packet
    Udp.write(tBuffer1, 5); //write sensor data to udp packet
    Udp.write(tBuffer2, 5);
    Udp.write(tBuffer3, 5);
    Udp.write(tBuffer4, 5);
    Udp.write(tBuffer5, 5);
    Udp.write(tBuffer6, 5);
    Udp.write(tBuffer7, 5);
    Udp.endPacket(); // end packet

////////


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

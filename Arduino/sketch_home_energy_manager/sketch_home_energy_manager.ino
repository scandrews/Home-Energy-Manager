//arduino code for the home energe manager
//version 1.1
//This version adds furnace control

#include <SPI.h>  //Serial communications
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <math.h>
#include <OneWire.h> 
#include <DallasTemperature.h>

  // config for UDP and Ethernet
  // config for the Aduino side
  byte arduinoMac[] = { 0xA8, 0x61, 0x0A, 0xAE, 0x41, 0x66 };
  unsigned int arduinoPort = 8888;      // port of Arduino
  // config for the server side
  IPAddress receiverIP(192, 168, 1, 4); // IP of udp packets receiver - server
  unsigned int receiverPort = 6000;      // port to listen on the server
  // An EthernetUDP instance to let us send and receive packets over UDP
  EthernetUDP Udp;
  // buffers for receiving and sending data
  char packetBuffer [17];  //buffer to hold incoming packet,
                           // 12 for IP numbers + 3 for the periods + 2 for my lead "what to do"
                           
  //define analog sensor pins
  int sensorPin1 = A0; // 1 - Wood Stove
  int sensorPin2 = A1; // 2 - Bread Board
  int sensorPin3 = A2; // 3 - Bedroom
  int sensorPin4 = A3; // 4 - Pipe
  int sensorPin5 = A4; // 5 - Furnace
  int sensorPin6 = A5; // 6 - Bread Board
                       // 7 - outdoor Sun
  // D1 - DON'T USE
  // D2 - 
  // D3 - Digital Temperature Sensor from resister on bread board
  // D4 - DON'T USE
  // D5 - Blinker
  // D6 - Recirc Pump
                       

  float sensorInput;
  float tempC4;
  float houseTempC;
  float furnaceTempF3;
  float furnaceMax = 180;
  //float furnaceMin = 95;
  float voltage;
  float pipeTempUpper = 110;
  int   whatToDo;
  float currentBedRmTemp;
  float maxHouseTemp = 70;
  float minHouseTemp = 65;
  float houseTempF = 0;
  //float minFamilyRmTemp = 64;
  //float maxFamilyRmTemp = 68;
  
  int whichSensor = 2;   // default family room
  int redState = 0;
  int recircMotorState = 0;
  int furnaceState = 0;

  int furnaceOutput = 2; // D2 - Bread Board LED - Furnace output
  int ONE_WIRE_BUS = 3;  // one wire set up for input D3
                         // 4
  int LED4 = 5;          // D5 - Blinker
  int LED3 = 6;          // D6 - Recirc Pump motor output

  // Setup a oneWire instance to communicate with any OneWire devices  
  // (not just Maxim/Dallas temperature ICs) 
  OneWire oneWire(ONE_WIRE_BUS); 

  // Pass our oneWire reference to Dallas Temperature. 
  DallasTemperature sensors(&oneWire);
  //  float temp5 = 0;
  // variable to hold device addresses
  //DeviceAddress addCurSensor;
  DeviceAddress outdoorSun =  {0x28, 0xEE, 0xE6, 0xB0, 0x06, 0x00, 0x00, 0x22};
  DeviceAddress deskDigitalSensor =  {0x28, 0xFF, 0x45, 0x1A, 0xC1, 0x16, 0x05, 0xD1};
  

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
  //Serial.print("Arduino IP address: ");
  //Serial.print(Ethernet.localIP());
  //Serial.print(" port ");
  //Serial.println(arduinoPort);

//   pinMode(LED1, OUTPUT); // Declare the LED as an output
   pinMode(furnaceOutput, OUTPUT);
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

  // This section checks if the recirc pump is running and turns it off
  // when temperature is reached
  if (recircMotorState == 1){
    if (((tempC4 * 9/5) + 32) >= pipeTempUpper){
          digitalWrite(LED3, LOW);
          Serial.println("just set recirc low");
          recircMotorState = 0;
    };
  };

  // this section checks the bedroom temp and turns the furnace off
  // when temperature is reached
  //Serial.print("Furnace State - ");
  //Serial.println(furnaceState);
  if (furnaceState == 1 && whichSensor != 0){
    //Serial.print("whichSensor - ");
    //Serial.print(whichSensor);
    //Serial.print(", current house Temp - ");
    //Serial.print(houseTempF);
    //Serial.print(", Max house Temp - ");
    //Serial.println(maxHouseTemp);
    if (houseTempF > maxHouseTemp){
       Serial.println("Turning off the furnace");
       digitalWrite (furnaceOutput, LOW);
       furnaceState = 0;
    }
  };


  // This section recieves UDP packets
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if(packetSize > 0)
  {
      //Serial.print("Arduino received packet of size ");
      //Serial.println(packetSize);
      //Serial.print("From ");
      //IPAddress remote = Udp.remoteIP();
      //  for (int i =0; i < 4; i++) {
      //    Serial.print(remote[i], DEC);
      //    if (i < 3) {
      //      Serial.print(".");
      //    }
      //  }
      //Serial.print(", port ");
      //
      //Serial.println(Udp.remotePort());

      // read the packet into packetBufffer
      //Udp.read(packetBuffer,UDP_TX_PACKET_MAX_SIZE);
      Udp.read(packetBuffer, packetSize);
      Serial.print(" Contents: ");
      Serial.println(packetBuffer);   // packetBuffer is type char [17]

      IPAddress newIPAddress;
      //whatToDo = strtok(packetBuffer," ");
      whatToDo = atoi (strtok(packetBuffer," "));
      Serial.print("What To Do - ");
      Serial.println(whatToDo);
/*      if (whatToDo == 5){
          Serial.println("detected the IP packet in Arduino");
          newIPAddress[0] = atoi (strtok(NULL, " ."));
          newIPAddress[1] = atoi (strtok(NULL, " ."));
          newIPAddress[2] = atoi (strtok(NULL, " ."));
          newIPAddress[3] = atoi (strtok(NULL, " ."));
          Serial.print(" New IP Address - ");
          Serial.println(newIPAddress);
      };
*/
    switch (whatToDo){
      // whattodo comes from the server:
      case 1:
          //change the sensor to stop the furnace
          Serial.print("changing sensor to - ");
          whichSensor = atoi (strtok(NULL, " "));
          //byte OTHERwhichSensor = packetBuffer[3];
          Serial.println(whichSensor);
          //Serial.println(OTHERwhichSensor);
          break;
      case 2:
          if (redState == 0){
            digitalWrite(furnaceOutput, HIGH);
            Serial.println("just set red high");
            redState = 1;
          } else {
            digitalWrite(furnaceOutput, LOW);
            Serial.println("just set red low");
            redState = 0;
          }
          break;
      case 3:
          digitalWrite(LED3, HIGH);   // output 4 recirc motor output
          Serial.println("just set run recirc high");
          recircMotorState = 1;
          break;
      case 4:
          digitalWrite(LED3, LOW);   // turn off the recirc motor
          // note this is not usually used because the arduino turns off the recirc
          // without direction from the server
          Serial.println("just set recirc low");
          recircMotorState = 0;
          break;
      case 5:
          Serial.println("got the update server IP Address packet");
          newIPAddress[0] = atoi (strtok(NULL, " ."));
          newIPAddress[1] = atoi (strtok(NULL, " ."));
          newIPAddress[2] = atoi (strtok(NULL, " ."));
          newIPAddress[3] = atoi (strtok(NULL, " ."));
          Serial.print("New IP Address - ");
          Serial.println (newIPAddress);
          receiverIP = newIPAddress;
          break;
      case 6:
          Serial.println("got a start furnace packet");
          furnaceMax = atoi (strtok(NULL, " "));
          digitalWrite(furnaceOutput, HIGH);   // output 3 furnace output
          Serial.println("just set run furnace high");
          furnaceState = 1;
          break;
      case 7:
          Serial.println("got a turn OFF furnace packet");
          digitalWrite(furnaceOutput, LOW);   // output 3 furnace output
          Serial.println("just set run furnace low");
          furnaceState = 0;
          break;
      case 8:
          Serial.println("got an update house min temperature packet");
          minHouseTemp = atoi (strtok(NULL, " "));
          
          //float newHouseTemp = atoi (strtok(packetBuffer, " "));
          //minBedRmTemp = newHouseTemp;       
          break;
      case 9:
          Serial.println("got an update house max temperature packet");
          maxHouseTemp = atoi (strtok(NULL, " "));
          //float newTemp = atoi (strtok(packetBuffer, " "));
          //float newTemp = (strtok(NULL, " "));
          //Serial.print("new temp - ");
          //Serial.println(newTemp);
          //maxHouseTemp = newTemp;
          Serial.print("new max House Temp - ");
          Serial.println(maxHouseTemp);   
          break;
          
      default:
        Serial.println("Arduino hit the default");
        break;
    }
 // end got a packet
 };


//  SEND FLAGS TO SERVER

    char houseTempTemp[8];
    char flags[100];
    dtostrf(maxHouseTemp,5,2,houseTempTemp);
    sprintf(flags, "%d:%d:%d:%d:", whichSensor, redState, recircMotorState, furnaceState);
    Serial.print("flags in one string ");
    Serial.println(flags);
    Serial.print("houseTempTemp - ");
    Serial.println(houseTempTemp);

    Udp.beginPacket(receiverIP, receiverPort);
    Udp.write("f", 1);    //identify packet as a flag packet
    Udp.write(flags, 11);
    Udp.write(houseTempTemp, 5);
    Udp.endPacket();

//  END SEND FLAGS

/*
  int sensorPin1 = A0; // 1 - Wood Stove
  int sensorPin2 = A1; // 2 - Bread Board
  int sensorPin3 = A2; // 3 - Bedroom
  int sensorPin4 = A3; // 4 - Pipe
  int sensorPin5 = A4; // 5 - Furnace
  int sensorPin6 = A5; // 6 - Bread Board
 */

//  READ TEMPERATURES
   // read analog values and convert to centagrate
    sensorInput = analogRead(sensorPin1);    //read the analog sensor A0; - Wood Stove
    voltage = sensorInput * 5.0;       //find percentage of input reading
    voltage /= 1024;                 //
    float tempC1 = (voltage - 0.5) * 100 ;               //Subtract the offset 

    sensorInput = analogRead(sensorPin2);    //read the analog sensor Family Room
    voltage = sensorInput * 5.0;             //find percentage of input reading
    voltage /= 1024;                         //
    float tempC2 = (voltage - 0.5) * 100 ;   //Subtract the offset

    sensorInput = analogRead(sensorPin3);    //read the analog sensor and store it
    voltage = sensorInput * 5.0;             //find percentage of input reading
    voltage /= 1024;                         // Bedroom
    float tempC3 = (voltage - 0.5) * 100 ;   //Subtract the offset 
    //currentBedRmTemp = (tempC3 * 9/5) + 32;     //get bedroom temp in F for use

    sensorInput = analogRead(sensorPin4);    //read the analog sensor A3 - Pipe
    voltage = sensorInput * 5.0;             //find percentage of input reading
    voltage /= 1024;
    tempC4 = (voltage - 0.5) * 100 ;         //Subtract the offset 

    sensorInput = analogRead(sensorPin5);    //read the analog sensor and store it
    voltage = sensorInput * 5.0;             //find percentage of input reading
    voltage /= 1024;                         //Furnace
    float tempC5 = (voltage - 0.5) * 100 ;   //Subtract the offset 
    furnaceTempF3 = (tempC5 * 9/5) + 32;     //get furnace temp in F for use

    /*sensorInput = analogRead(sensorPin6);    //Old Desk/Breadboard
    voltage = sensorInput * 5.0;             //find percentage of input reading
    voltage /= 1024;
    float tempC6 = (voltage - 0.5) * 100 ;   //Subtract the offset 
    */
   // end analog temperature sense section

  // to issue a global temperature and Requests to all devices on the bus
    // Send the command to get temperature readings 
    sensors.requestTemperatures();

    float tempC7 = sensors.getTempC(outdoorSun);
    float tempC6 = sensors.getTempC(deskDigitalSensor);
    Serial.print("Digital sensors - ");
    Serial.print(tempC6);
    Serial.print(", ");
    Serial.println(tempC7);

    //float tempC7 = sensors.getTempCByIndex(0); // Why "byIndex"?  
   // You can have more than one DS18B20 on the same bus.  
   // 0 refers to the first IC on the wire 
   
/*
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
*/
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

/*  //Serial.print("Temperatures in Byte Array - ");
    //Serial.print(tBuffer1);
    //Serial.print(" temp2: ");
    //Serial.print(tBuffer2);
    //Serial.print(" temp3: ");
    //Serial.print(tBuffer3);
    //Serial.print(" temp4: ");
    //Serial.println(tBuffer4);
*/
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
   // This section will check temps and turn furnace on if necessary
   //if (furnaceState == 0){
   //   if (currentBedRmTemp < minBedRmTemp){
//         if (furnaceTempF3 < furnaceMin){
            // start furnace
   //         furnaceState = 1;
   //         digitalWrite (furnaceOutput, HIGH);
   //         Serial.println("Just started furnace");
//         }
   //   }
   //};
  // This section checks which sensor to use for furnace and calculates the F into 
  switch (whichSensor){
    case 0:
      break;
    case 1:
      houseTempC = tempC3;  //bedroom
      break;
    case 2:
      houseTempC = tempC2;   // family room
      Serial.println("furnace off is FAMILY ROOM");
      break;
    case 3:
      houseTempC = tempC6;  // desk
      break;
    default:
      Serial.println("ERROR in the set house Temp");
  };
  houseTempF = (houseTempC * 9/5) + 32;     //get house temp in F for use
  Serial.print("just set the house temp to - ");
  Serial.println(houseTempF);

   
  // Blink led 4 (digital output 5)
  digitalWrite(LED4, HIGH);
  delay(1000);
  digitalWrite(LED4, LOW);
///////
/*
  Serial.print("The Furnace state - ");
  Serial.print(furnaceState);
  Serial.print(" Red State - ");
  Serial.print(redState);
  Serial.print(" Motor State - ");
  Serial.println(recircMotorState);
*/
  delay(1000);
   
}

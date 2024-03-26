//arduino code for the home energe manager
//version 1.1
//This version adds furnace control

#include <SPI.h>  //Serial communications
#include <OneWire.h> 
#include <math.h>
#include <DallasTemperature.h>

/*
//#include <Ethernet.h>
//#include <EthernetUdp.h>

//#define HOST_NAME "Home_Energy_Manager"
*/
  // config for UDP and Ethernet
  // config for the Aduino side
  //byte arduinoMac[] = { 0xA8, 0x61, 0x0A, 0xAE, 0x41, 0x66 };
  //unsigned int arduinoPort = 8888;      // port of Arduino
  // config for the server side
//  IPAddress receiverIP(192, 168, 1, 8); // IP of udp packets receiver - server
//  unsigned int receiverPort = 6000;      // port to listen on the server
  // An EthernetUDP instance to let us send and receive packets over UDP
//  EthernetUDP Udp;
  // buffers for receiving and sending data
//  char packetBuffer [17];  //buffer to hold incoming packet,
                           // 12 for IP numbers + 3 for the periods + 2 for my lead "what to do"
                           
  //define analog sensor pins
/*  int sensorPin1 = A0; // 1 - Wood Stove
  int sensorPin2 = A1; // 2 - Bread Board
  int sensorPin3 = A2; // 3 - Bedroom
  int sensorPin4 = A3; // 4 - Pipe
  int sensorPin5 = A4; // 5 - Furnace
  int sensorPin6 = A5; // 6 - Bread Board
*/                       // 7 - outdoor Sun
  // D1 - DON'T USE
  // D2 - 
  // D3 - Digital Temperature Sensor from resister on bread board
  // D4 - DON'T USE
  // D5 - Blinker
  // D6 - Recirc Pump
                       

  //float sensorInput;
  //float tempC4;
  //float houseTempC;
  //float furnaceTempF3;
  //float furnaceMax = 180;
  //float furnaceMin = 95;
  //float voltage;
  //float pipeTempUpper = 110;
  //int   whatToDo;
  //float currentBedRmTemp;
  //float maxHouseTemp = 68;
  //float minHouseTemp = 63;
  //float houseTempF = 0;
  //float minFamilyRmTemp = 64;
  //float maxFamilyRmTemp = 68;
  
  int whichSensor = 2;   // default family room
  int redState = 0;
  //int recircMotorState = 0;
  //int furnaceState = 0;

  //int furnaceOutput = 2; // D2 - Bread Board LED - Furnace output
//  int ONE_WIRE_BUS = 3;  // one wire set up for input D3
//  int ONE_WIRE_BUS2 = 7;  // one wire set up for input D3
                         // 4
  int LED4 = 5;          // D5 - Blinker
  int LED3 = 6;          // D6 - Recirc Pump motor output
  int count = 0;
/*
  // Setup a oneWire instance to communicate with any OneWire devices  
  // (not just Maxim/Dallas temperature ICs) 
//  OneWire oneWire(ONE_WIRE_BUS); 
//  OneWire oneWire2(ONE_WIRE_BUS2); 

  // Pass our oneWire reference to Dallas Temperature. 
//  DallasTemperature sensors(&oneWire);
//  DallasTemperature sensors2(&oneWire2);
  //  float temp5 = 0;
  // variable to hold device addresses
  //DeviceAddress addCurSensor;
//  DeviceAddress outdoorSun =  {0x28, 0xEE, 0xE6, 0xB0, 0x06, 0x00, 0x00, 0x22};
//  DeviceAddress deskDigitalSensor =  {0x28, 0xFF, 0x45, 0x1A, 0xC1, 0x16, 0x05, 0xD1};
//  DeviceAddress outdoorShade =  {0x28, 0xBB, 0xF0, 0xEA, 0x0D, 0x00, 0x00, 0x05};
//  DeviceAddress waterTank =  {0x28, 0xFF, 0x55, 0x1E, 0xC0, 0x16, 0x05, 0x08

//};
*/

// setup code
void setup() {
   Serial.begin(9600); //Start the Serial Port at 9600 baud (default)

   Serial.println("Initialize Ethernet with DHCP:");
/*   if (Ethernet.begin(arduinoMac) == 0) {
       Serial.println("Failed to configure Ethernet using DHCP");
       if (Ethernet.hardwareStatus() == EthernetNoHardware) {
          Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
       } else if (Ethernet.linkStatus() == LinkOFF) {
          Serial.println("Ethernet cable is not connected.");
       }
*/
       // no point in carrying on, so do nothing forevermore:
//       while (true) { delay(1); }
//   }
//   Udp.begin(arduinoPort);

  //print your local IP address:
  //Serial.print("Arduino IP address: ");
  //Serial.print(Ethernet.localIP());
  //Serial.print(" port ");
  //Serial.println(arduinoPort);

//   pinMode(LED1, OUTPUT); // Declare the LED as an output
//   pinMode(furnaceOutput, OUTPUT);
//   pinMode(LED3, OUTPUT); // Motor output digital output 6
   pinMode(LED4, OUTPUT);

//  analogReference(EXTERNAL);
//  analogReference(INTERNAL);

   // Start the Digital Sensor library
//   sensors.begin();
}


void loop() {
  Serial.println("Arduino tinks the Current Server IP Address - ");

  Serial.println(count);
  count ++;
//  Serial.println(receiverIP);

  // This section checks if the recirc pump is running and turns it off
  // when temperature is reached
/*  if (recircMotorState == 1){
    if (((tempC4 * 9/5) + 32) >= pipeTempUpper){
          digitalWrite(LED3, LOW);
          Serial.println("just set recirc low");
          recircMotorState = 0;
    };
  };
*/


  /*{
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

/*
  int sensorPin1 = A0; // 1 - Wood Stove
  int sensorPin2 = A1; // 2 - Bread Board
  int sensorPin3 = A2; // 3 - Bedroom
  int sensorPin4 = A3; // 4 - Pipe
  int sensorPin5 = A4; // 5 - Furnace
  int sensorPin6 = A5; // 6 - Bread Board
 */

   
/*  //Serial.print("Temperatures in Byte Array - ");
    //Serial.print(tBuffer1);
    //Serial.print(" temp2: ");
    //Serial.print(tBuffer2);
    //Serial.print(" temp3: ");
    //Serial.print(tBuffer3);
    //Serial.print(" temp4: ");
    //Serial.println(tBuffer4);
*/
   
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

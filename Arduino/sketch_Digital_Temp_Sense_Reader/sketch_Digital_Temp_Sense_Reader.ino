/* YourDu05/21/2018

***  FIX Wire.h include
terry@yourduino.com */

  #include <OneWire.h>    // Included within recent DallasTemperature
  #include <DallasTemperature.h>

  /*-----( Declare Constants )-----*/
  #define ONE_WIRE_BUS 3 /*-(Sensor on D3)-*/
  int LED4 = 5;  // D5 - Blinker



  /*-----( Declare objects )-----*/
  /* Set up a oneWire instance to communicate with any OneWire device*/
  OneWire ourWire(ONE_WIRE_BUS);

  /* Tell Dallas Temperature Library to use oneWire Library */
  DallasTemperature sensors(&ourWire);

  int numberOfDevices; // Number of temperature devices found

  /*-----( Declare Variables )-----*/
  // variable to hold device addresses
  DeviceAddress addCurSensor;


void setup() {
  /*-(start serial port to see results )-*/
  delay(500);
  Serial.begin(9600);
  Serial.println("YourDuino.com: Temperature Sensor Test Program");
  Serial.println("Temperature Sensor: DS18B20");
  //delay(1000);
  pinMode(LED4, OUTPUT);


  /*-( Start up the DallasTemperature library )-*/
  sensors.begin();

    // Grab a count of devices on the wire
  numberOfDevices = sensors.getDeviceCount();
  
  // locate devices on the bus
  Serial.print("Locating devices...");
  Serial.print("Found ");
  Serial.print(numberOfDevices, DEC);
  Serial.println(" devices.");

  sensors.getAddress(addCurSensor, 0);

  printAddress (addCurSensor);

  
}/*--(end setup )---*/


void loop(){
  Serial.println();
  Serial.print("Requesting temperature...");
  sensors.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");

  Serial.print("Device 1 (index 0) = ");
  Serial.print(sensors.getTempCByIndex(0));
  Serial.println(" Degrees C");
  Serial.print("Device 1 (index 0) = ");
  Serial.print(sensors.getTempFByIndex(0));
  Serial.println(" Degrees F");

//  Serial.print("Device Address - ");
//  Serial.println(addCurSensor);
  delay(5000);
  ////////
   
  // Blink led 4 (digital output 5)
  digitalWrite(LED4, HIGH);
  delay(1000);
  digitalWrite(LED4, LOW);
  //delay(1000);
  ///////
  }/* --(end main loop )-- */

void printAddress(DeviceAddress deviceAddress)
{ 
  for (uint8_t i = 0; i < 8; i++)
  {
    Serial.print("0x");
    if (deviceAddress[i] < 0x10) Serial.print("0");
    Serial.print(deviceAddress[i], HEX);
    if (i < 7) Serial.print(", ");
  }
  Serial.println("");
}

/* ( THE END ) */

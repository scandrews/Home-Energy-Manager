# Home-Energy-Manager

## Overview
The home energy manager controls the oil furnace and the hot water recirculator.
The connection to the furnace is between the temperature sensor and the motor control unit so as to not interrupt the norma cycling up and down of the blower, while providing the ability to maintain a boiler tank temperature as logic determines.  THe hot water recurculator  long term objective for this project is to monitor energy use in my home and control various appliances to maximize efficiency.  The present implementation contains the basis on which to build additional functionality but is limited to controlling a hot water recirculating pump for a second floor bathroom.

## Homepage

screenshot homepage

## Functionality

The Home Energy Manager is built on a NODE.JS server using express for front end communications.  The front end is straight HTML using jquery and Bootstrap.  The interface with external equipment is done using an Adrino microcontroller which interfaces with the server using UDP over ethernet.  The Arduino includes a USB serial interface for simple comunications including downloading the Ardunio code.

The application includes a SQL database using Sequelize which stores configuration information and temperature history.

This pic shows the external hardware in the development environment.  The Arduino microcontroller with the ethernet shield is at the top. sandwhiched between is a screw shield providing all the external connections. The bus at the top provides a pull down resister and a capacitor between the TMP-36s and ground. The LED is simply to show that the Arduino is running by connecting to a digital output which turns the LED on and off in two second interval.  On the left side is a xxx power supply.

Connection to the water pump nd furnace is through Adafruit Fether Shield which delivers up to 8 Amps AC.

various status during development, and the blue power box to the right contains the power relay which steps up the power to control high power devices, in this case a water pump.

HEM-dev-hardware.jpg


## Repo

The repo is on Github: https://github.com/scandrews/Home-Energy-Manager.git

## Technologies Used

HTML, javascript, jquery, ajax, express

express, body-parser, fs, sequelize, socket.io, dgram, net, serialport, readline

Arduino development environment in 'C' and including libraries for serial, and ethernet i/o and UDP, and analog i/o for reading and writing analog devices such and the TMP-36, as well as digital i/o for writing to the power relay and LEDs.


### dependencies

## Author

Steven Andrews
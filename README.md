# Home-Energy-Manager

## Overview
The long term objective for this project is to monitor energy use in my home and control various appliances to maximize efficiency.  The present implementation contains the basis on which to build additional functionality but is limited to controlling a hot water recirculating pump for a second floor bathroom.

## Homepage

screenshot homepage

## Functionality

The Home Energy Manager is built on a NODE.JS server using express for front end communications.  The front end is straight HTML using jquery and Bootstrap.  The interface with external equipment is done using an Adrino microcontroller which interfaces with the server using UDP over ethernet.  The Arduino includes a USB serial interface for simple comunications including downloading the Ardunio code.

The application includes a SQL database using Sequelize which stores configuration information and temperature history.

This pic shows the external hardware in the development environment.  The Arduino microcontroller with the ethernet shield is at the top.  The prototyping board has three TMP-36s (small black devices that look like transisters) which are temperature sensors, The three LEDs are simply to show various status during development, and the blue power box to the right contains the power relay which steps up the power to control high power devices, in this case a water pump.

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
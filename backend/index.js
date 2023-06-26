'use strict';

import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(express.json());

//configure cors
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT');
  res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
  next();
});

import { router } from './routes/index.js';
app.use('/api', router);

import MqttClient from './models/mqtt.js';
import FirebaseFunctions from './services/firebase-functions.js';
import Devices from './models/devices.js';


app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
  });
  
  app.listen(process.env.API_PORT, process.env.API_HOST, async () => {  
    console.log(`Running on http://${process.env.API_HOST}:${process.env.API_PORT}`);

     //MQTT messages handler
  MqttClient.handleMessages = handleMessages; 
  //Here the devices are loaded from the database
  let deviceList = await FirebaseFunctions.getDevicesList();    
  Devices.setDevicesList(deviceList);
  });
  

  async function handleMessages (incomingTopic, message){    
    console.log('\ntopic is: ' + incomingTopic, '\nMessage is : ', message.toString());
    if (incomingTopic.includes(process.env.TOPIC_HELLO)) {
      const id = incomingTopic.split('/')[1];
      if (!Object.keys(Devices.getDevicesList()).includes(id)) {
        Devices.addDevice({ 
          lastSeen: Date.now(),
          state: true,     
          users: {},
          id: id,
        })
        FirebaseFunctions.createDeviceDatabase(id,  Devices.getDevice(id));
      } else {
        try {
          Devices.getDevice(id).lastSeen = Date.now();
          Devices.getDevice(id).state = true;
          FirebaseFunctions.updateStateDatabase(id, Devices.getDevice(id));
        } catch (error) {
          console.log('error updating device state');
        }
      }
    } else if (incomingTopic.includes(process.env.TOPIC_DATA)) {      
      try {
        const id = incomingTopic.split('/')[1];
        if (message.toString().includes('|') && Object.keys(Devices.getDevicesList()).includes(id)) {
          console.log(id);
          const data = message.toString().split('|');
          const object = {
            temperature: data[0],
            pressure: data[1],
          };
          FirebaseFunctions.saveMessageDatabase(id, object);
          // deviceList[id].data = { ...deviceList[id].data, ...object };
        } else {
          console.log('message not valid, id: ', id);
        }
      } catch (e) {
        console.log(e);
        console.log('error with message or topic: ', message.toString(), incomingTopic);
      }
    } else if (incomingTopic.includes(process.env.TOPIC_ALARM)) {
      try {
        const problem = incomingTopic.split('/')[1];
        const id = incomingTopic.split('/')[2];
        if (message.toString().includes('|') && Object.keys(deviceList).includes(id)) {
          console.log(id);
          // const alarm = message.toString().split('|');
          // const pre_message = alarm[2].split(':')[1];
          // try {
          //   message_tosend = alarm_messages[pre_message];
          // } catch (e) {
          //   console.log('error with alarm message');
          // }
          // const object = {
          //   severity: alarm[0].split(':')[1],
          //   data: alarm[1].split(':')[1],
          //   message: message_tosend,
          //   type: problem,
          // };
          // object.message = FirebaseFunctions.saveAlarmDatabase(id, object);
        } else {
          console.log('message not valid, id: ', id);
        }
      } catch (e) {
        console.log('error with message or topic: ', message.toString(), incomingTopic);
      }
    }
  // }
}
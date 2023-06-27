'use strict';

import express from 'express';
const routeDevice = express.Router();
import Devices from '../../models/devices.js';
import FirebaseFunctions from '../../services/firebase-functions.js';

routeDevice.get('/', async (req, res) => {
    const devices = Devices.getDevices()    
    res.send(devices);
});

routeDevice.get('/logs/:id', async (req, res) => {    
    const id = req.params.id;
    const logs = await FirebaseFunctions.getDeviceLogs(id);
    if(logs){
        res.send(logs);
    }else{
        res.send('device not found');
    }
});


export { routeDevice };
    
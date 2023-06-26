'use strict';

import express from 'express';
const router = express.Router();

import {routeDevice} from './device/index.js';
router.use('/device', routeDevice);


export { router };
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../data/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


module.exports = router;
const express = require('express');
const dataRoute = require('./data');

const route = express.Router();
route.get('/', (req, res) => res.json({
  apiVersion: 1,
  title: 'Invoice Manager Server Root',
}));
route.use('/data', dataRoute);

module.exports = route;

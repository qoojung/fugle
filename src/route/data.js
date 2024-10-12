const express = require('express');
const ApiResponse = require('../helper/response');
const hackerController = require('../controller/hacker');
const asyncHandler = require('../helper/async');

const route = express.Router();

route.get('/', asyncHandler(getDataByUserId));

async function getDataByUserId(req, res) {
  const { user } = req.query;
  const data = await hackerController.getDivisibleByUserId(parseInt(user, 10));
  new ApiResponse(res).sendMsg(data);
}

module.exports = route;

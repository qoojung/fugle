const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');
const { client: redisClient } = require('./redis-client');
const config = require('../config/config');
const ApiResponse = require('./response');
const asyncHandler = require('./async');

function calToken({ controlObj, curTimeSecond, rateCount, rateInterval }) {
  const lastCount = _.has(controlObj, 'count') ? parseInt(controlObj.count, 10) : rateCount;
  const lastTimeSecond = _.has(controlObj, 'last_time_sec') ? parseInt(controlObj.last_time_sec, 10) : curTimeSecond;
  const curCount = Math.min(
    lastCount + Math.floor(rateCount * ((curTimeSecond - lastTimeSecond) / rateInterval)),
    rateCount,
  );
  return curCount;
}

async function checkRate({ userId, ip, curTimeSecond, ipRateConfig, userRateConfig }) {
  const ipKey = `RATE_LIMIT_IP:${Buffer.from(ip).toString('base64')}`;
  const userKey = `RATE_LIMIT_USER:${userId}`;
  const ipRateInfo = await redisClient.get(ipKey);
  const ipRateInfoObj = ipRateInfo ? JSON.parse(ipRateInfo) : {};
  const userRateInfo = await redisClient.get(userKey);
  const userRateInfoObj = userRateInfo ? JSON.parse(userRateInfo) : {};
  let ipReqToken = calToken({
    controlObj: ipRateInfoObj,
    curTimeSecond,
    rateCount: ipRateConfig.count,
    rateInterval: ipRateConfig.interval,
  });
  let userReqToken = calToken({
    controlObj: userRateInfoObj,
    curTimeSecond,
    rateCount: userRateConfig.count,
    rateInterval: userRateConfig.interval,
  });
  if (ipReqToken <= 0 || userReqToken <= 0) {
    return {
      pass: false,
      ipCount: ipRateConfig.count - ipReqToken,
      userCount: userRateConfig.count - userReqToken,
    };
  }
  ipReqToken -= 1;
  userReqToken -= 1;
  const newIpRateInfoObj = {
    count: ipReqToken,
    last_time_sec: curTimeSecond,
  };
  await redisClient.set(
    ipKey,
    JSON.stringify(newIpRateInfoObj),
    { EX: ipRateConfig.interval * 2 },
  );
  const newUserRateInfoObj = {
    count: userReqToken,
    last_time_sec: curTimeSecond,
  };
  await redisClient.set(
    userKey,
    JSON.stringify(newUserRateInfoObj),
    { EX: userRateConfig.interval * 2 },
  );
  return {
    pass: true,
    ipCount: ipRateConfig.count - ipReqToken,
    userCount: userRateConfig.count - userReqToken,
  };
}

async function rateControl(req, res, next) {
  const { ip } = req;
  const userId = req.query.user;
  if (userId === undefined || Number.isNaN(parseInt(userId, 10))) {
    return new ApiResponse(res).sendMsg('User Id should be valid integer', StatusCodes.BAD_REQUEST);
  }
  const curTimeSecond = Math.floor(new Date().getTime() / 1000);
  const result = await checkRate({
    userId,
    ip,
    ipRateConfig: config.rateControl.ipAddr,
    userRateConfig: config.rateControl.user,
    curTimeSecond,
  });
  if (!result.pass) {
    return new ApiResponse(res).sendMsg({
      ip: result.ipCount,
      id: result.userCount,
    }, StatusCodes.TOO_MANY_REQUESTS);
  }
  next();
}
module.exports = {
  middleware: asyncHandler(rateControl),
};

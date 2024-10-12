const { StatusCodes } = require('http-status-codes');

class ResponseSender {
  constructor(resStream) {
    this.resStream = resStream;
  }

  sendMsg(response, code = StatusCodes.OK) {
    this.resStream.status(code).json({ response });
  }

  sendDone(code = StatusCodes.OK) {
    this.sendMsg('done', code);
  }

  sendErr(errMessage, code = StatusCodes.INTERNAL_SERVER_ERROR) {
    this.resStream.status(code).json({ errMessage });
  }
}
module.exports = ResponseSender;

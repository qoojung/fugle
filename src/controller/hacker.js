const hackerApi = require('../model/api/hacker');

const HackerController = {
  async getDivisibleByUserId(userId) {
    const topStories = await hackerApi.getTopStories();
    return topStories.filter((id) => id % userId === 0);
  },
};
module.exports = HackerController;

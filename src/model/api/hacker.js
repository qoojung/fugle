const axios = require('axios');

const BASE_URL = 'https://hacker-news.firebaseio.com/v0/';

const HackerApi = {
  getTopStories: async () => {
    const response = await axios.get(`${BASE_URL}/topstories.json?print=pretty`);
    return response.data;
  },
};

module.exports = HackerApi;

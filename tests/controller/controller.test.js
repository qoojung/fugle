const TickerTopic = require('../../src/controller/hacker');
const hackerApi = require('../../src/model/api/hacker');
jest.mock('../../src/model/api/hacker');

describe('data', () => {
  it('basic operation', async () => {
    hackerApi.getTopStories.mockReturnValue([5, 7, 9]);
    const result = await TickerTopic.getDivisibleByUserId(2);
    expect(result).toIncludeSameMembers([]);
  });
});

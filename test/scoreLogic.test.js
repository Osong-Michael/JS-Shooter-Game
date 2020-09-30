import "@babel/polyfill";
import * as ScoreLogic from '../src/helpers/scoreLogic';

global.fetch = require('jest-fetch-mock');

describe('Posting Score to Api ', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Returns true if API call is successful', async () => {
    fetch.mockResponseOnce(JSON.stringify('Api test call'));
    const result = await ScoreLogic.postScore('Michel', 10);
    expect(result).toBe(true);
  });

  test('Returns false if API call fails', async () => {
    fetch.mockRejectOnce(new Error('fake error message'));
    const result = await ScoreLogic.postScore('Michel', 10);
    expect(result).toBe(false);
  });

  test('Posts to API with correct params', async () => {
    fetch.mockResponseOnce(JSON.stringify('Api test call'));
    await ScoreLogic.postScore('Michel', 10);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ user: 'Michel', score: 10 }));
  });
});

describe('Getting Scores from API', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('Returns an array of objects if API call is successful', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ user: 'Michel', score: 10 }]));
    const scoreBoard = await ScoreLogic.getGameScores('Michel', 10);

    expect(scoreBoard).toEqual([{ user: 'Michel', score: 10 }]);
  });

  test('Returns error message if API call fails', async () => {
    fetch.mockRejectOnce(new Error('fake error message'));
    const scoreBoard = await ScoreLogic.getGameScores('Michel', 10);
    expect(scoreBoard).toBe('Sorry, something went wrong.');
  });
});
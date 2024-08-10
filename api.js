module.exports = {
  async homeyId({ homey }) {
    const homeyId = await homey.cloud.getHomeyId();
    const Homey = require('homey');
    const apiId = Homey.env.WEBHOOK_ID;

    // return homeyId;
    return 'https://webhooks.athom.com/webhook/'+ apiId + '?homey=' + homeyId;
  },
  async getLogs({ homey }) {
    const result = await homey.app.getLogs();
    return result;
  },
  // delete logs
  async deleteLogs({ homey }) {
    const result = await homey.app.deleteLogs();
    return result;
  },
};

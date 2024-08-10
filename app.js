'use strict';

const Homey = require('homey');
const Logger = require('./logger');

class PreComTrigger extends Homey.App {

  async onInit() {
    if (!this.logger) {
      this.logger = new Logger({
        name: 'precomLog',
        length: 200,
        homey: this.homey,
      });
    }
    this.log('Precom App is running!');

    this.homey
      .on('unload', () => {
        this.log('app unload called');
        // save logs to persistant storage
        this.logger.saveLogs();
      })
      .on('memwarn', () => {
        this.log('memwarn!');
      });

    const id = Homey.env.WEBHOOK_ID;
    const secret = Homey.env.WEBHOOK_SECRET;
    const data = {};

    this.webhook = await this.homey.cloud.createWebhook(id, secret, data);
    this.webhook.on('message', args => {
      this.log('Message on Webhook with your Homey ID', args.body);
      let p2000Capcode = '';
      let p2000Melding = '';
      let p2000Gespreksgroep = '';
      let p2000Voertuigen = '';
      let priority = 0; // Empty Calls;
      const regexGroup = /(\[[\s\S]+\])/gi;
      const regexGesprek = /([a-z]{3,5}-[0-9]{2,})/gi;
      const regexMessage = /([a-z]{3,5}-[0-9]{2,} )([\s\S]*?)( [0-9]{5,6})/gi;
      const regexVoertuigen = /([0-9]{5,6})/gi;

      const p2000Message = args.body._alert ? args.body._alert : args.body.data.message;
      const deviceSend = args.body._alert ? 'Apple' : 'Android';
      if (p2000Message.substring(0, 2) === 'P ') {
        priority = parseInt(p2000Message.substring(3, 1), 10);
      }
      const matchMelding = regexMessage.exec(p2000Message);
      if (matchMelding !== null && matchMelding.length > 2) {
        p2000Melding = matchMelding[2];
      } else {
        p2000Melding = p2000Message;
      }

      const matchVoertuigen = regexVoertuigen.exec(p2000Message);
      if (matchVoertuigen !== null && matchVoertuigen.length > 1) {
        p2000Voertuigen = matchVoertuigen.join(',');
      }

      const matchGroup = p2000Message.match(regexGroup);
      if (matchGroup !== null) {
        p2000Capcode = matchGroup[0].replace('[', '')
          .replace(']', '');
      }
      const matchGesprek = p2000Message.match(regexGesprek);
      if (matchGesprek !== null) {
        p2000Gespreksgroep = matchGesprek[0];
      }
      // (^p [0-9]{1} )|([a-z]{3,5}-[0-9]{2} )|( [0-9]{5,6})
      const tokens = {
        message: p2000Melding,
        prio: priority,
        capcode: p2000Capcode,
        communicationgroup: p2000Gespreksgroep,
        pagertext: p2000Message,
        cars: p2000Voertuigen,
      };
      this.log(`Trigger Flow by ${deviceSend}`, tokens);

      const precomTrigger = this.homey.flow.getTriggerCard('precom-trigger');
      precomTrigger.trigger(tokens);
    });
  }

  //  stuff for frontend API
  deleteLogs() {
    return this.logger.deleteLogs();
  }

  getLogs() {
    return this.logger.logArray;
  }

}

module.exports = PreComTrigger;

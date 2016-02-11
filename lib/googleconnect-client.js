var google = require('googleapis');
var config = require('../config');


var Google = function() {
    var oauth2Client = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret, config.google.redirectUrl);

    this.getAuthUrl = function () {
        return oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
              'https://www.googleapis.com/auth/drive',
              'https://www.googleapis.com/auth/drive.file',
              'https://www.googleapis.com/auth/drive.readonly'
          ]
      });
    };
    this.getClient = function () {
        return oauth2Client;
    }
}

module.exports = new Google();

var express = require('express');
var router = express.Router();
var google = require('googleapis');
var googleConnect = require('../lib/googleconnect-client');
var config = require('../config');

/* GET Live Connect Auth callback. */
router.get('/', function (req, res) {
    // Get the auth code from the callback url query parameters
    var authCode = req.query['code'];

    if (authCode) {
        // Request an access token from the auth code
        googleConnect.getClient().getToken(authCode, function(err, responseData) {
          // Now tokens contains an access_token and an optional refresh_token. Save them.
          if(!err) {
              var accessToken = responseData['access_token'],
                  tokenType = responseData['token_type'],
                  expiryDate = Math.floor(responseData['expiry_date']/1000);

              if (accessToken && tokenType && expiryDate) {
                  // Save the access token on a session. Using cookies in this case:
                  res.cookie('google_access_token', accessToken, { maxAge: expiryDate});
                  res.cookie('google_token_type', tokenType, { maxAge: expiryDate});
                  res.cookie('google_expiry_date', expiryDate, { maxAge: expiryDate});

                  res.render('callback');
              } else {
                  // Handle an authentication error response
                  res.render('error', {
                      message: 'Invalid Connect Response',
                      error: {details: JSON.stringify(responseData, null, 2)}
                  });
              }
          }
        });
    } else {
        // Handle an error passed from the callback query params
        var authError = req.query['error'],
            authErrorDescription = req.query['error_description'];
        res.render('error', {
            message: 'Connect Auth Error',
            error: {status: authError, details: authErrorDescription}
        });
    }

});

module.exports = router;

var express = require('express');
var router = express.Router();
var multer  = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });

var liveConnect = require('../lib/liveconnect-client');
var googleConnect = require('../lib/googleconnect-client');

var oneNote = require('../lib/onenote');
var drive = require('../lib/drive');

/* GET Index page */
router.get('/', function (req, res) {
    if(req.cookies['google_access_token'] == null || req.cookies['live_access_token'] == null) {
        var authUrls = {
            live: liveConnect.getAuthUrl(),
            google: googleConnect.getAuthUrl()
        };

        res.render(
            'login',
            {
                title: "Note taking toolbox",
                authUrls: authUrls,
                liveLoggedIn: req.cookies['live_access_token'] != null,
                googleLoggedIn: req.cookies['google_access_token'] != null
            }
        );
    } else {
        oneNote.getSections(req.cookies['live_access_token'], function(error, response, body) {
            // Parse the body since it is a JSON response
            var parsedBody;
            try {
                parsedBody = JSON.parse(body);
            } catch (e) {
                parsedBody = {};
            }

            if(error === null && parsedBody.value != null) {
                res.render('index', { title: "Note taking toolbox", sections: parsedBody.value});
            } else {
                res.render('error', {
                    message: 'Unable to fetch sections',
                    error: {details: JSON.stringify(error, null, 2)}
                });
            }
        });
    }
});

/* POST Create example request */
router.post('/', upload.single('attachment'), function (req, res) {
    var createType = req.body['submit'];
    var section = JSON.parse(req.body['section']);

    googleConnect.getClient().setCredentials({
        access_token: req.cookies['google_access_token'],
        token_type: req.cookies['google_token_type'],
        expiry_date: req.cookies['google_expiry_date']
    });

    // Render the API response with the created links or with error output
    var resultCallback = function (responses) {
        var errors = [];
        var resourceUrl = "";

        responses.forEach(function(response, key) {
            // Parse the body since it is a JSON response
            var parsedBody;
            try {
                parsedBody = JSON.parse(response['body']);
            } catch (e) {
                parsedBody = {};
            }

            if(response['error'] != null) {
                errors.push({
                    driver: key,
                    response: response['response'],
                    error: JSON.stringify(response['error'], null, 2),
                    body: parsedBody
                });
            } else {
                if(key == "oneNote") {
                    // Get the submitted resource url from the JSON response
                    resourceUrl = parsedBody['links'] ? parsedBody['links']['oneNoteWebUrl']['href'] : null;

                    if (!resourceUrl) {
                        errors.push({
                            driver: key,
                            response: response['response'],
                            error: "Could not find resource URL",
                            body: parsedBody
                        });
                    }
                }
            }
        });



        res.render('result', {
            title: errors.length != 0 ? 'Succeeded with errors' : 'Success',
            errors: errors,
            resourceUrl: resourceUrl
        });
    };

    if (createType === 'file') {
        var counter = 2;
        var responses = new Map();
        var createCallback = function(key) {
            return function(e,r,b) {
                counter--;

                responses.set(key, {error: e, response: r, body: b});

                if(counter == 0) {
                    resultCallback(responses);
                }
            }
        };

        drive.uploadToFolder(req.cookies['google_access_token'], req.file.originalname, req.file.buffer, section.name, createCallback('drive'));
        oneNote.createPageWithFile(req.cookies['live_access_token'], req.file.buffer, section.id, createCallback('oneNote'));
    }
});

module.exports = router;

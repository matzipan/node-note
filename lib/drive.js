var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var google = require('googleapis');
var googleConnect = require('../lib/googleconnect-client');
var config = require('../config');

var drive = google.drive({ version: 'v3', auth: googleConnect.getClient() });

var Drive = function() {
    this.uploadToFolder = function (accessToken, fileName, fileBuffer, sectionName, callback) {
        drive.files.list({
            q: "name contains '"+config.drive.parentFolder+"'",
            auth: googleConnect.getClient()
        }, function(err, parents) {
            if(!err) {
                drive.files.list({
                    q: "name contains '"+sectionName+"' and '"+parents.files[0].id+"' in parents",
                    auth: googleConnect.getClient()
                }, function(err, parents) {
                    if(!err) {
                        drive.files.create({
                            resource: {
                                name: fileName,
                                mimeType: 'application/pdf',
                                parents: [parents.files[0].id]
                            },
                            media: {
                                mimeType: 'application/pdf',
                                body: fileBuffer
                            },
                            auth: googleConnect.getClient()
                        }, function(err, result) {
                            callback(err, null, result);
                        });
                    } else {
                        callback(err, null, parents);
                    }
                });
            } else {
                callback(err, null, parents);
            }
        });
    };
}

module.exports = new Drive();

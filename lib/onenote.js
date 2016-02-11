var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var OneNote = function () {
    this.getSections = function(accessToken, callback) {
      var options = {
          url: 'https://www.onenote.com/api/v1.0/me/notes/sections',
          headers: {
              'Authorization': 'Bearer ' + accessToken,
              'Content-Type': 'text/html'
          }
      };

      var r = request.get(options, callback);
    }

    /* Pages API request builder & sender */
    function createPage(accessToken, payload, sectionId, callback, multipart) {
        var options = {
            url: 'https://www.onenote.com/api/v1.0/me/notes/sections/'+sectionId+'/pages',
            headers: {'Authorization': 'Bearer ' + accessToken}
        };

        // Build simple request
        if (!multipart) {
            options.headers['Content-Type'] = 'text/html';
            options.body = payload;
        }
        var r = request.post(options, callback);
        // Build multi-part request
        if (multipart) {
            var CRLF = '\r\n';
            var form = r.form(); // FormData instance
            _.each(payload, function (partData, partId) {
                form.append(partId, partData.body, {
                    // Use custom multi-part header
                    header: CRLF +
                        '--' + form.getBoundary() + CRLF +
                        'Content-Disposition: form-data; name=\"' + partId + '\"' + CRLF +
                        'Content-Type: ' + partData.contentType + CRLF + CRLF
                });

            });
        }
    }

    /**
     * Create OneNote Page with an Embedded File
     *
     * @param {string} accessToken The access token
     * @param {createPageCallback} callback The callback with response data
     */
    this.createPageWithFile = function (accessToken, fileBuffer, sectionId, callback) {
        var htmlPayload =
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <title></title>" +
            "    <meta name=\"created\" content=\"" + (new Date().toISOString()) + "\"/>" +
            "</head>" +
            "<body>" +
            "    <object data-attachment=\"PDF File.pdf\" data=\"name:EmbeddedFile\" type=\"application/pdf\"></object>" +
            "    <img data-render-src=\"name:EmbeddedFile\" />" +
            "</body>" +
            "</html>";

        createPage(accessToken, {
            'Presentation': {
                body: htmlPayload,
                contentType: 'text/html'
            },
            'EmbeddedFile': {
                body: fileBuffer,
                contentType: 'application/pdf'
            }
        }, sectionId, callback, true);
    }

};
module.exports = new OneNote();

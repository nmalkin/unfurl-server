"use strict";

var http = require('http');
var url = require('url');

// Per: https://developer.mozilla.org/en/HTTP/HTTP_response_codes
var REDIRECT_CODES = [301, 302, 303, 307, 308];

var isRedirectCode = function(status) {
    return REDIRECT_CODES.indexOf(status) !== -1;
};

// Listen for requests
require('http').createServer(function(req, res) {
    var query, target;
    query = url.parse(req.url, true).query;

    // Make sure query has target URL
    if(!('url' in query)) {
        res.writeHead(400, {
            'Content-type': 'text/plain'
        });
        res.end('Missing required parameter');
        return;
    }

    target = query.url;

    // Make a request to the target URL
    http.get(target, function(response) {
        if(isRedirectCode(response.statusCode) &&
          ('location' in response.headers)) // If the target is a redirect
        {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.end(JSON.stringify({
                location: response.headers['location']
            }));
        } else { // Not a redirect
            // Notify via status code
            res.writeHead(204, {
                'Content-type': 'text/plain'
            });
            res.end('Not a redirect');
        }
    }).on('error', function(e) {
        console.log('Error with request', url, e);
        res.writeHead(500, {
            'Content-type': 'text/plain'
        });
        res.end('Error with request');
    });
}).listen(process.env.PORT || 3778);

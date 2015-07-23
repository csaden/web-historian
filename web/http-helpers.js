var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

// As you progress, keep thinking about what helper functions you can put here!

exports.sendResponse = function(res, obj, status) {
  status = status || 200;
  res.writeHead(status, headers);
  res.end(obj);
};

exports.collectData = function(req, callback) {
  var data = "";
  req.on("data", function(chunk) {
    data += chunk;
  });
  req.on("end", function() {
    // preserve the original data on a post since we are accepting data from a form submission
    // rather than JSON data as was the case for the chatterbox server
    callback(data);
  });
};

exports.send404 = function(res) {
  res.sendResponse(res, "404: Page not found", 404);
};

exports.sendRedirect = function(res, location, status) {
  status = status || 302;
  res.writeHead(status, {Location: location});
  res.end();
};

exports.serveAssets = function(res, asset, callback) {

  var encoding = {encoding: 'utf-8'};

  // 1. chech in public folder
  fs.readFile ( archive.paths.siteAssets + asset, encoding, function(err, data) {
    if (err) {
      // 2. file doesn't exist in public directory, check archive/sites directory
      fs.readFile( archive.paths.archivedSites + asset, encoding, function(err, data) {
        if (err) {
          // 3. file doesn't exist in either location
          callback ? callback() : exports.send404(res);
        } else {
          // file exists, serve it
          exports.sendResponse(res, data);
        }
      });
    } else {
      exports.sendResponse(res, data);
    }
  });
};


var path = require('path');
var archive = require('../helpers/archive-helpers');
var utils = require('./http-helpers');
var urlParser = require("url");

var actions = {
  "GET": function(req, res) {

    var parts = urlParser.parse(req.url);
    var urlPath = parts.pathname === "/" ? "/index.html" : parts.pathname;
    // look inside public and archives/sites directories
    utils.serveAssets(res, urlPath, function() {
      // is the urlPath in sites .txt
      archive.isUrlInList(urlPath.slice(1), function(inList) {
        if (inList) {
          // redirect to /loading.html
          utils.sendRedirect(res, "/loading.html");
        } else {
          // send404
          utils.send404(res);
        }
      });
    });
  },
  "POST": function(req, res) {
    // must collect data on POST requests
    utils.collectData(req, function(data) {
      var url = data.split('=')[1]; // fragile code; should have error handling here
      // is data in the sites.txt?
      archive.isUrlInList(url, function(inList) {

        if (inList) { // if yes
          //is it archived?
          archive.isUrlArchived(url, function(archived) {
            if (archived) { // if yes
              // display the page
              utils.sendRedirect(res, '/' + url);
            } else { // if no
              // serve loading.html
              utils.sendRedirect(res, "/loading.html");
            }
          });
        } else { // if no
          // append url to site.txt
          archive.addUrlToList(url, function() {
            // redirect to loading.html
            utils.sendRedirect(res, '/loading.html');
          });
        }
      });
    });
  }
};

exports.handleRequest = function(req, res) {
  var action = actions[req.method];
  if (action) {
    action(req, res);
  } else {
    utils.send404(res);
  }
};

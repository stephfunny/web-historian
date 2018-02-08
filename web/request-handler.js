var path = require('path');
var archive = require('../helpers/archive-helpers');
var http = require('./http-helpers.js');
var qs = require('query-string');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  // res.end(archive.paths.list);
  console.log('Serving req type ', req.method, ' for url ', req.url);
  if (req.method === 'POST') { 
    
    //console.log(req);
    http.collectData(req, function(data) {
      var url = qs.parse(data).url;
      archive.isUrlArchived(url, function(exists) {
        if (exists) {
          http.serveAssets(res, url);
        } else {
          archive.isUrlInList(url, function(inList) {
            if (!inList) {
              archive.addUrlToList(url + '\n', function() {
                //console.log('Added ' + url + ' to list');
              });
            }
          });
          http.serveAssets(res, 'loading');
        }
      }); 
    });
    //archive.readListOfUrls(console.log);
  } else if (req.method === 'GET') {
    http.serveAssets(res, req.url);
  }
  
};


//check if archived, if yes, return the archived site
//if not archived, check if it's in list, if yes --> serve loading page
//if not in list, add it to the list --> serve loading page
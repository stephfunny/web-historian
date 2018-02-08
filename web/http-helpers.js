var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
// var url = require('url');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};

exports.serveAssets = function(res, asset, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
  if (asset === '/') {
    fs.readFile(archive.paths.index, function(err, html) {
      if (err) {
        throw err;
      }
      exports.sendResponse(res, html, 200, exports.headers);
    });
  } else if (asset === '/styles.css') {
    fs.readFile(archive.paths.siteAssets + asset, function(err, css) {
      if (err) {
        throw err;
      }
      exports.sendResponse(res, css, 200, {'Content-Type': 'text/css'});
    });
  } else if (asset === 'loading') {
    fs.readFile(archive.paths.siteAssets + '/loading.html', function(err, html) {
      if (err) {
        throw err;
      }
      exports.sendResponse(res, html, 302, exports.headers);
    });
  } else {
    archive.isUrlArchived(asset, function(exists) {
      if (exists) {
        fs.readFile(archive.paths.archivedSites + '/' + asset, function(err, data) {
          if (err) {
            throw err;
          }
          exports.sendResponse(res, data, 200, exports.headers);
        });
      } else {
        res.writeHeader(404, exports.headers);
        res.end();
      }
    });
  }
  //check if archived, if yes, return the archived site
  //if not archived, check if it's in list, if yes --> server loading page
  //if not in list, add it to the list --> serve loading page
  
};



// As you progress, keep thinking about what helper functions you can put here!
exports.sendResponse = function(response, data, statusCode, headers) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(data.toString());
};

exports.collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(data);
  });
};

// exports.collectData = function(request) {
//   var temp = [];
//   var data = '';
//   request.on('data', function(chunk) {
//     data += chunk;
//   });
//   request.on('end', function() {
//     //console.log(qs.parse(data).url);
//     temp.push(qs.parse(data).url);
//     console.log(temp);
//   });
//   return temp;
// };

exports.makeActionHandler = function(actionMap) {
  return function(request, response) {
    var action = actionMap[request.method];
    if (action) {
      action(request, response);
    } else {
      exports.sendResponse(response, '', 404);
    }
  };
};

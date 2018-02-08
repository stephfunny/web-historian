var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var http = require('http');


/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt'),
  index: path.join(__dirname, '../web/public/index.html'),
  css: path.join(__dirname, '../web/public/styles.css')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

var collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(data);
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, 'utf8', function(err, data) {
    if (err) {
      throw err;
    }
    //console.log('data is ', data);
    return callback(data.split('\n'));
  });
};

exports.isUrlInList = function(url, callback) {
  exports.readListOfUrls(function(data) {
    callback(data.indexOf(url) > -1);
  });  
};

exports.addUrlToList = function(url, callback) {
  fs.appendFile(exports.paths.list, url, 'utf8', callback);
};

exports.isUrlArchived = function(url, callback) {
  fs.exists(exports.paths.archivedSites + '/' + url, callback);
};

exports.downloadUrls = function(urls) {
  urls.forEach(function(url) {
    exports.isUrlArchived(url, function(exists) {
      if (!exists) {
        http.get('http://' + url, res => {
          collectData(res, function(data) {
            fs.writeFile(exports.paths.archivedSites + '/' + url, data, 'utf8', err => {
              if (err) {
                throw err;
              }
              console.log('Added ' + url + ' to archives');
            });
          });
        });
      }
    });
  });
};

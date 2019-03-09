var CommandHandler = require('./commandHandler');
var util = util = require('util');
var open = require('mac-open');
var youtubeSearch = require('youtube-search');
var displayManager = require('../displayManager');

function SearchYoutube() {
    CommandHandler.apply(this, ["youtube", false]);
    this.opts = {
      maxResults: 1,
      key: 'AIzaSyDyZMEDTMIb_RmdPjN8wpkXXuBCnHGFBXA'
    };
}

util.inherits(SearchYoutube, CommandHandler);

SearchYoutube.prototype.processCommand = function(term) {
  let deferred = $.Deferred();

  youtubeSearch(term, this.opts, function(err, results) {
    // refer https://github.com/MaxGfeller/youtube-search/blob/master/index.js for fields
    if (err) {
      deferred.reject(err);
      return;
    }
    if (results.length > 0) {
      open(results[0].link);
      deferred.resolve(false);
    } else {
      displayManager.displayStatusBar("No result found");
      deferred.reject();
    }
  });

  return deferred.promise();
}

module.exports = SearchYoutube;

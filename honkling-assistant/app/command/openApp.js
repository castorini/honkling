var CommandHandler = require('./commandHandler');
var util = util = require('util');
const fs = require('fs');
var open = require('mac-open');

function OpenApp() {
    CommandHandler.apply(this, ["go", true]);
}

util.inherits(OpenApp, CommandHandler);

OpenApp.prototype.processCommand = function(term) {
  let deferred = $.Deferred();

  var re = /(?:\.([^.]+))?$/;
  let path = this.processor.getPath();

  if (fs.lstatSync(path).isDirectory()) {
    open(path, { a: "Atom" }, function(error) {
      if (error) {
        displayManager.displayStatusBar("unable to open with Atom");
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    });
  } else {
    var ext = re.exec(path)[1];

    if (ext == "mp3" || ext == "wav") {
      open(path, { a: "iTunes" }, function(error) {
        if (error) {
          displayManager.displayStatusBar("unable to open with iTunes");
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      });
    } else if (ext == "txt") {
      open(path, { a: "TextEdit" }, function(error) {
        if (error) {
          displayManager.displayStatusBar("unable to open with TextEdit");
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      });
    } else {
      displayManager.displayStatusBar("unable to open " + path);
      deferred.resolve(true);
    }
  }

  return deferred.promise();
}

module.exports = OpenApp;

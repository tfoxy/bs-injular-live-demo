(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.deps.createNativeFile', [
    // no dependencies
  ]).constant('createNativeFile', createNativeFile);


  function createNativeFile(parts, filename, properties = {}) {
    let file;
    try {
      file = new File(parts, filename, properties);
    } catch (err) {
      // phantomjs doesn't support FileConstructor
      let date;
      if ('lastModified' in properties) {
        date = new Date(properties.lastModified);
      } else {
        date = new Date();
      }
      file = new Blob(parts, properties);
      file.name = filename;
      file.lastModified = +date;
      file.lastModifiedDate = date;
    }
    return file;
  }
})();

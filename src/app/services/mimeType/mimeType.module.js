(function() {
  'use strict';

  let mimeTypes = Object.create(null);
  angular.extend(mimeTypes, {
    bmp: 'image/bmp',
    css: 'text/css',
    gif: 'image/gif',
    html: 'text/html',
    ico: '  image/x-icon',
    jpe: 'image/jpeg',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    svg: 'image/svg+xml',
    tiff: 'image/tiff',
    webp: 'image/webp',
    xml: 'application/xml',
  });
  
  angular.module('bsInjularLiveDemo.services.mimeType', [
    // no dependencies
  ]).constant('mimeType', {
    _dict: mimeTypes,
    lookup
  });


  function lookup(fileName) {
    if (!fileName) return;
    let extensionIndex = fileName.lastIndexOf('.') + 1;
    let extension = fileName.slice(extensionIndex);
    return this._dict[extension];
  }
})();

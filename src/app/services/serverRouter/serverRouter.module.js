(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.serverRouter', [
    'bsInjularLiveDemo.deps.minimatch',
    'bsInjularLiveDemo.deps.fileChanger',
    'bsInjularLiveDemo.services.fileSystem',
    'bsInjularLiveDemo.services.project',
  ]);
})();

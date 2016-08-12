(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.services.liveDemo', [
    'bsInjularLiveDemo.deps.EventEmitter',
    'bsInjularLiveDemo.deps.minimatch',
    'bsInjularLiveDemo.deps.injular',
    'bsInjularLiveDemo.deps.fileChanger',
    'bsInjularLiveDemo.services.fileSystem',
    'bsInjularLiveDemo.services.serverRouter',
    'bsInjularLiveDemo.services.project',
  ]);
})();

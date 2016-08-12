(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.services.editor', [
    'bsInjularLiveDemo.deps.EventEmitter',
    'bsInjularLiveDemo.deps.ace',
    'bsInjularLiveDemo.services.fileSystem',
    'bsInjularLiveDemo.services.project',
  ]);
})();

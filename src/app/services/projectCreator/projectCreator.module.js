(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.projectCreator', [
    'bsInjularLiveDemo.services.project',
    'bsInjularLiveDemo.services.fileSystem',
    
    // listen to fileSystem events:
    'bsInjularLiveDemo.services.editor',
    'bsInjularLiveDemo.services.serverRouter',
    'bsInjularLiveDemo.services.liveDemo',
  ])
  /* eslint-disable no-unused-vars */
  .run((editor, serverRouter, liveDemo) => {});
  /* eslint-enable no-unused-vars */
})();

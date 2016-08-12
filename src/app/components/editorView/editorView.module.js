(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.components.editorView', [
    'ui.layout',
    'ngFileUpload',
    'filereader',

    'bsInjularLiveDemo.deps.ace',
    'bsInjularLiveDemo.services.editor',
    'bsInjularLiveDemo.services.fileSystem',
    'bsInjularLiveDemo.services.projectCreator',
    'bsInjularLiveDemo.directives.liveDemoIframe',
    'bsInjularLiveDemo.directives.addMovingSplitbarClass',
    'bsInjularLiveDemo.directives.aceModelManager',
  ]);
})();

(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.directives.aceModelManager')
  .directive('aceModelManager', aceModelManagerDirective);
  
  function aceModelManagerDirective($timeout, ace, editor) {
    return {
      restrict: 'A',
      link: postLink,
    };


    function postLink($scope, $element, $attrs) {
      let acee = ace.edit($element[0]);
      window.acee = acee;
      acee.$blockScrolling = Infinity;

      editor.events
      .on('postActiveFileChange', postEditorActiveFileChangeListener);

      $scope.$on('$destroy', destroyListener);
      postEditorActiveFileChangeListener();
      $scope.$eval($attrs.aceModelManagerOnLoad, { $acee: acee });

      function postEditorActiveFileChangeListener() {
        let activeFile = editor.activeFile;
        let newSession = null;
        if (activeFile && !activeFile.file) {
          newSession = activeFile;
        }
        acee.setSession(newSession);
        acee.focus();
      }

      function destroyListener() {
        editor.events
        .off('postActiveFileChange', postEditorActiveFileChangeListener);
      }
    }
  }
})();

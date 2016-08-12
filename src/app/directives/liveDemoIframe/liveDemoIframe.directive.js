(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.directives.liveDemoIframe')
  .directive('liveDemoIframe', liveDemoIframeDirective);
  
  function liveDemoIframeDirective(liveDemo) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      liveDemo.setIframe(element);
      liveDemo.reload();

      scope.$on('$destroy', () => {
        liveDemo.setIframe(null);
      });
    }
  }
})();

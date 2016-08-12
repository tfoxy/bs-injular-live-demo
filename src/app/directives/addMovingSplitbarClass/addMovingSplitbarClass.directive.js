(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.directives.addMovingSplitbarClass')
  .directive('addMovingSplitbarClass', addMovingSplitbarClassDirective);
  
  function addMovingSplitbarClassDirective() {
    return {
      restrict: 'A',
      require: 'uiLayout',
      link: link,
    };

    function link(scope, element, attrs, uiLayoutCtrl) {
      let processSplitbar = uiLayoutCtrl.processSplitbar;
      let mouseUpHandler = uiLayoutCtrl.mouseUpHandler;

      uiLayoutCtrl.processSplitbar = processSplitbarAlt;
      uiLayoutCtrl.mouseUpHandler = mouseUpHandlerAlt;

      function processSplitbarAlt(container) {
        if (uiLayoutCtrl.movingSplitbar) {
          attrs.$addClass('moving-splitbar');
          uiLayoutCtrl.movingSplitbar.element.addClass('-moving');
        }
        return processSplitbar(container);
      }

      function mouseUpHandlerAlt(event) {
        if (uiLayoutCtrl.movingSplitbar) {
          uiLayoutCtrl.movingSplitbar.element.removeClass('-moving');
        }
        attrs.$removeClass('moving-splitbar');
        return mouseUpHandler(event);
      }
    }
  }
})();

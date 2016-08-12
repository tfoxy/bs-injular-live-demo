/* global minimatch */
(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.deps.minimatch', [
    // no dependencies
  ])
  .constant('minimatch', minimatch)
  .constant('match', match);

  function match(name, pattern) {
    if (!pattern) return false;
    return minimatch(name, pattern);
  }
})();

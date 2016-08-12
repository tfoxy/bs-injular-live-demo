(function() {
  'use strict';

  angular.module('bsInjularLiveDemo')
  .config(config);


  function config($logProvider) {
    $logProvider.debugEnabled(location.hostname === 'localhost');
  }

})();

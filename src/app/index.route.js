(function() {
  'use strict';

  angular.module('bsInjularLiveDemo')
  .config(routerConfig);


  function routerConfig($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise('/gh-gist/83f19f04eacc289cd0fc7afedd66559f');

    $stateProvider
    .state('editor', {
      abstract: true,
      template: '<editor-view></editor-view>',
    })
    .state('editor.blank', {
      url: '/blank',
      resolve: {
        __init__: ($log, projectCreator) => {
          try {
            projectCreator.blank();
          } catch (err) {
            $log.error(err);
          }
        }
      }
    })
    .state('editor.gh-gist', {
      url: '/gh-gist/:gistId',
      resolve: {
        __init__: ($log, $stateParams, projectCreator) => {
          try {
            projectCreator.githubGist($stateParams.gistId);
          } catch (err) {
            $log.error(err);
          }
        }
      }
    });
  }

})();

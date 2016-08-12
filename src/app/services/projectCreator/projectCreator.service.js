(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.projectCreator')
  .factory('projectCreator', projectCreatorFactory);
  
  function projectCreatorFactory($http, $log, project, fileSystem) {
    const projectCreator = {
      blank,
      githubGist,
    };

    return projectCreator;


    function blank() {
      let origin = 'blank';
      if (project.origin === origin) return;
      project.origin = origin;
      project.startLoading();
      fileSystem.createFile('index.html', `\
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>[ng-cloak] { display: none; }</style>
  </head>
  <body ng-app="app">
    <!--
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.js"></script>
    -->
  </body>
</html>
`);
      project.doneLoading();
    }


    function githubGist(id) {
      let origin = 'gh-gist_' + id;
      if (project.origin === origin) return;
      project.origin = origin;
      project.startLoading();
      return $http.get(`https://api.github.com/gists/${id}`).then(response => {
        let files = response.data.files;
        for (let fileName in files) {
          let file = files[fileName];
          fileSystem.createFile(fileName, file.content, file.type);
        }
        project.doneLoading();
      }, errResponse => {
        $log.error(errResponse);
      });
    }
  }
})();

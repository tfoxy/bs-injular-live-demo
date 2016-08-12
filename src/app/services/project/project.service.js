(function() {
  'use strict';

  const PROJECT_SETTINGS_FILENAME = '.injular.json';

  angular.module('bsInjularLiveDemo.services.project')
  .factory('project', projectFactory);

  function projectFactory(EventEmitter, fileSystem) {
    const project = {
      get SETTINGS_FILENAME() {
        return PROJECT_SETTINGS_FILENAME;
      },
      origin: null,
      loading: false,
      startLoading,
      doneLoading,
      events: new EventEmitter(),
    };
    resetSettings();

    fileSystem.events.on('postCreate', fileChangeListener);
    fileSystem.events.on('postModify', fileChangeListener);
    fileSystem.events.on('preRename', filePredeleteListener);
    fileSystem.events.on('preDelete', filePredeleteListener);

    return project;


    function fileChangeListener(file) {
      if (file.name === PROJECT_SETTINGS_FILENAME) {
        project.events.emitEvent('preModifySettings');
        project.settings = JSON.parse(file.content);
        if (!project.settings.injular) {
          project.settings.injular = {};
        }
        project.events.emitEvent('postModifySettings');
      }
    }

    function filePredeleteListener(newFile, oldFile) {
      let file = oldFile || newFile;
      if (file.name === PROJECT_SETTINGS_FILENAME && !project.loading) {
        throw new Error(`${PROJECT_SETTINGS_FILENAME} file cannot be deleted`);
      }
    }

    function startLoading() {
      project.loading = true;
      fileSystem.clear();
      resetSettings();
    }

    function doneLoading() {
      autoAddSettingsFile();
      project.loading = false;
      project.events.emitEvent('init');
    }

    function resetSettings() {
      project.settings = {injular: {}};
    }


    function autoAddSettingsFile() {
      if (!fileSystem.hasFile(project.SETTINGS_FILENAME)) {
        let settings = {
          entryFile: 'index.html',
          injular: {
            templates: '**/!(index).html',
            controllers: '**/*.controller?(s).js',
            directives: '**/*.+(directive?(s)|component?(s)).js',
            filters: '**/*.filter?(s).js',
            angularFile: '**/angular?(.min).js',
            moduleFile: '**/+(app|index)?(.module).js'
          },
          fileOrder: [
            '.injular.json'
          ]
        };
        let content = JSON.stringify(settings, null, 2);
        fileSystem.createFile(project.SETTINGS_FILENAME, content);
      }
    }
  }
})();

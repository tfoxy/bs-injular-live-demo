(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.serverRouter')
  .factory('serverRouter', serverRouterFactory);


  function serverRouterFactory(match, fileChanger, fileSystem, project) {
    const _blobUrlCache = new Map();

    const serverRouter = {
      _blobUrlCache,
      getBlobUrl,
      getFile,
      getFileContent,
    };

    fileSystem.events.on('postModify', removeFileCache);
    fileSystem.events.on('postRename', renameFileCache);
    fileSystem.events.on('postDelete', removeFileCache);

    return serverRouter;


    function getFile(url) {
      let file = fileSystem.getFile(url).copy();
      if (file.file) return file;
      let content = file.content;
      let injSettings = project.settings.injular;
      if (match(url, injSettings.templates)) {
        content = fileChanger.wrapTemplate(content, url);
      } else if (match(url, injSettings.directives)) {
        content = fileChanger.wrapDirectiveFile(content, url);
      } else if (match(url, injSettings.moduleFile)) {
        content = fileChanger.appendProvideGetter(content, injSettings.ngApp);
      } else if (match(url, injSettings.angularFile)) {
        content = fileChanger.appendAngularModulePatch(content);
      }
      file.content = content;
      return file;
    }


    function getFileContent(url) {
      return serverRouter.getFile(url).content;
    }


    function getBlobUrl(url) {
      let blobUrl = _blobUrlCache.get(url);
      if (!blobUrl) {
        let file = serverRouter.getFile(url);
        let blob;
        if (file.file) {
          blob = file.file;
        } else {
          let content = file.content;
          let type = file.type;
          blob = new Blob([content], {type});
        }
        blobUrl = URL.createObjectURL(blob);
        _blobUrlCache.set(url, blobUrl);
      }
      return blobUrl;
    }


    function removeFileCache(file) {
      let blobUrl = _blobUrlCache.get(file.name);
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        _blobUrlCache.delete(file.name);
      }
    }


    function renameFileCache(newFile, oldFile) {
      removeFileCache(oldFile);
      serverRouter.getBlobUrl(newFile.name);
    }
  }
})();

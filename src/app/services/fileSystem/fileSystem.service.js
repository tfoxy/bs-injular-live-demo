(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.fileSystem')
  .factory('fileSystem', fileSystemFactory);


  function fileSystemFactory(EventEmitter, MemoryFile) {
    const fileSystem = {
      createFile,
      readFile,
      getFile,
      getFileType,
      getFiles,
      hasFile,
      modifyFile,
      renameFile,
      deleteFile,
      clear,
      events: new EventEmitter(),
    };

    const fileMap = new Map();

    return fileSystem;


    function createFile(name, content='', type=null) {
      let file = new MemoryFile(name, content, type);
      name = file.name;
      if (fileMap.has(name)) {
        throw new Error(`File already exists: ${name}`);
      }
      Object.freeze(file);
      fileSystem.events.emitEvent('preCreate', [file]);
      fileMap.set(name, file);
      fileSystem.events.emitEvent('postCreate', [file]);
      return file;
    }


    function readFile(name) {
      return getFile(name).content;
    }


    function getFile(name) {
      let file = fileMap.get(name);
      if (!file) {
        throw new Error(`File does not exists: ${name}`);
      }
      return file;
    }


    function getFileType(name) {
      return getFile(name).type;
    }


    function getFiles() {
      return fileMap.values();
    }


    function hasFile(name) {
      return fileMap.has(name);
    }


    function modifyFile(name, content) {
      let file = fileMap.get(name);
      if (!file) {
        throw new Error(`File does not exists: ${name}`);
      }
      if (typeof content === 'undefined') {
        throw new Error(`Content is needed when modifying file: ${name}`);
      }
      let newFile = new MemoryFile(name, content, file.type);
      Object.freeze(newFile);
      fileSystem.events.emitEvent('preModify', [newFile, file]);
      fileMap.set(name, newFile);
      fileSystem.events.emitEvent('postModify', [newFile, file]);
    }


    function renameFile(name, newName) {
      let file = fileMap.get(name);
      if (!file) {
        throw new Error(`File does not exists: ${name}`);
      }
      if (name === newName) {
        return;
      }
      if (fileMap.has(newName)) {
        throw new Error(`File already exists: ${name}`);
      }
      let newFile = file.copy();
      newFile.rename(newName);
      Object.freeze(newFile);
      fileSystem.events.emitEvent('preRename', [newFile, file]);
      fileMap.delete(name);
      fileMap.set(newName, newFile);
      fileSystem.events.emitEvent('postRename', [newFile, file]);
      return newFile;
    }


    function deleteFile(name) {
      let file = fileMap.get(name);
      if (!file) {
        throw new Error(`File does not exists: ${name}`);
      }
      fileSystem.events.emitEvent('preDelete', [file]);
      fileMap.delete(name);
      fileSystem.events.emitEvent('postDelete', [file]);
    }


    function clear() {
      for (let fileName of fileMap.keys()) {
        fileSystem.deleteFile(fileName);
      }
    }
  }
})();

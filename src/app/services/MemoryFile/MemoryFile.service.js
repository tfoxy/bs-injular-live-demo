(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.MemoryFile')
  .factory('MemoryFile', MemoryFileFactory);


  function MemoryFileFactory(createNativeFile, mimeType) {
    MemoryFile.prototype.copy = copy;
    MemoryFile.prototype.rename = rename;

    return MemoryFile;


    function MemoryFile(name, content='', type=null) {
      if (name instanceof Blob) {
        let file = name;
        this.name = file.name;
        this.file = file;
        this.type = file.type || mimeType.lookup(file.name);
      } else {
        this.name = name;
        this.content = content;
        this.type = type || mimeType.lookup(name);
      }
      if (!this.name) {
        throw new Error('Name is missing');
      }
    }


    function copy() {
      return new MemoryFile(
        this.file || this.name, this.content, this.type
      );
    }


    function rename(newName) {
      let file = this.file;
      if (file) {
        let newFile = createNativeFile([file], newName, {
          type: file.type,
          lastModified: file.lastModified
        });
        this.file = newFile;
      }
      this.name = newName;
    }
  }
})();

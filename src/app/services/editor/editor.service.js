(function() {
  'use strict';

  angular.module('bsInjularLiveDemo.services.editor')
  .factory('editor', editorFactory);

  function editorFactory($timeout, EventEmitter, ace, fileSystem, project) {
    const aceModelist = ace.require('ace/ext/modelist');
    const settings = {
      autoSave: true,
      delayedAutoSaveDelay: 1000,
      instantAutoSaveDelay: 80,
    };
    const fileList = [];
    const fileMap = new Map();
    const delayedAutoSaveFileSet = new Set();
    const instantAutoSaveFileSet = new Set();
    const timeouts = {
      delayedAutoSave: null,
      instantAutoSave: null,
    };

    const editor = {
      activeFile: null,
      settings,
      fileList,
      fileMap,
      changeActiveFile,
      fileContentChanged,
      events: new EventEmitter(),
    };

    for (let fsFile of fileSystem.getFiles()) {
      addFile(fsFile);
    }

    fileSystem.events.on('postCreate', addFile);
    // fileSystem.events.on('postModify', fileModifiedListener);
    fileSystem.events.on('postRename', renameFile);
    fileSystem.events.on('postDelete', deleteFile);

    project.events.on('postModifySettings', projectSettingsModifiedListener);
    project.events.on('init', projectInitListener);

    return editor;


    function fileContentChanged(file) {
      let fileSet, timeoutName, delay;
      let name = file.name;
      if (
          name.endsWith('.js') ||
          name === project.SETTINGS_FILENAME ||
          name === project.settings.entryFile) {
        fileSet = delayedAutoSaveFileSet;
        timeoutName = 'delayedAutoSave';
        delay = settings.delayedAutoSaveDelay;
      } else {
        fileSet = instantAutoSaveFileSet;
        timeoutName = 'instantAutoSave';
        delay = settings.instantAutoSaveDelay;
      }
      $timeout.cancel(timeouts[timeoutName]);
      fileSet.add(name);
      timeouts[timeoutName] = $timeout(saveFileChanges, delay);

      function saveFileChanges() {
        for (let fileName of fileSet.values()) {
          let setFile = fileMap.get(fileName);
          fileSystem.modifyFile(setFile.name, setFile.content);
        }
        fileSet.clear();
      }
    }


    function aceChangeListener(change, file) {
      fileContentChanged(file);
    }


    function addFile(fsFile) {
      let file;
      if (fsFile.file) {
        file = createRawFile(fsFile);
      } else {
        file = createAceFile(fsFile);
      }
      fileMap.set(file.name, file);
      fileList.push(file);
      reorderFileList();
      editor.changeActiveFile(file.name);
    }

    function createAceFile(fsFile) {
      let mode = aceModelist.getModeForPath(fsFile.name).mode;
      let file = ace.createEditSession(fsFile.content, mode);
      file.name = fsFile.name;
      Object.defineProperty(file, 'content', {
        get: () => file.doc.getValue(),
        set: val => file.doc.setValue(val),
      });
      disableEditorWarnings(file);
      file.on('change', aceChangeListener);
      return file;
    }

    function createRawFile(fsFile) {
      return fsFile.copy();
    }

    function disableEditorWarnings(file) {
      file.on('changeAnnotation', () => {
        if (file.name.endsWith('.html') && file.name !== project.settings.entryFile) {
          let annotations = file.getAnnotations();
          let len = annotations.length;
          let i = len;
          while (i--) {
            if (/doctype first\. Expected/.test(annotations[i].text)) {
              annotations.splice(i, 1);
            }
          }
          if (annotations.length < len) {
            file.setAnnotations(annotations);
          }
        }
      });
    }

    // function fileModifiedListener(file) {
    // }

    function renameFile(newFile, oldFile) {
      let newName = newFile.name;
      let oldName = oldFile.name;
      let file = fileMap.get(oldName);
      fileMap.delete(oldName);
      file.name = newName;
      let mode = aceModelist.getModeForPath(newName).mode;
      file.setMode(mode);
      fileMap.set(file.name, file);
      reorderFileList();

      if (delayedAutoSaveFileSet.delete(oldName)) {
        delayedAutoSaveFileSet.put(newName);
      }
      if (instantAutoSaveFileSet.delete(oldName)) {
        instantAutoSaveFileSet.put(newName);
      }
    }

    function deleteFile(fsFile) {
      fileMap.delete(fsFile.name);
      for (let [index, file] of fileList.entries()) {
        if (file.name === fsFile.name) {
          fileList.splice(index, 1);
          delayedAutoSaveFileSet.delete(file.name);
          instantAutoSaveFileSet.delete(file.name);
        }
      }
      let firstFile = editor.fileList[0];
      editor.changeActiveFile(firstFile ? firstFile.name : null);
    }

    function projectSettingsModifiedListener() {
      reorderFileList();
    }

    function projectInitListener() {
      let firstFile = editor.fileList[0];
      editor.changeActiveFile(firstFile ? firstFile.name : null);
    }

    function reorderFileList() {
      let fileOrder = project.settings.fileOrder || [];
      fileList.sort((left, right) => {
        let leftIndex = fileOrder.indexOf(left.name);
        let rightIndex = fileOrder.indexOf(right.name);
        if (leftIndex < 0) leftIndex = fileOrder.length;
        if (rightIndex < 0) rightIndex = fileOrder.length;
        let order = leftIndex - rightIndex;
        if (order === 0) {
          order = left.name <= right.name ? -1 : 1;
        }
        return order;
      });
    }

    function changeActiveFile(fileName) {
      let file = null;
      if (fileName) {
        file = fileMap.get(fileName);
        if (!file) {
          throw new Error(`File ${fileName} is not in editor`);
        }
      }
      let prevFile = editor.activeFile;
      editor.events.emitEvent('preActiveFileChange', [file, prevFile]);
      editor.activeFile = file;
      editor.events.emitEvent('postActiveFileChange', [file, prevFile]);
    }
  }
})();

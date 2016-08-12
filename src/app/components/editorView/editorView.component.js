(function() {
  'use strict';
  const mobileMaxWidth = 480;

  angular.module('bsInjularLiveDemo.components.editorView')
  .component('editorView', {
    templateUrl: 'app/components/editorView/editorView.html',
    controller: EditorViewController,
  });


  function EditorViewController($scope, $window, $timeout, FileReader, ace, editor, fileSystem) {
    const $ctrl = this;

    const uiLayout = {
      flow: 'column',
      disableToggle: true,
      dividerSize: 5,
    };
    const collapsed = {
      fileList: false,
      editor: false,
      liveView: false,
    };
    let previousCollapsedFileListStatus;

    angular.extend($ctrl, {
      uiLayout,
      collapsed,
      editor,
      aceEditorLoadListener,
      changeActiveFile,
      toggleEditorCollapse,
      showNewFilePrompt,
      showRenameFilePrompt,
      importFiles,
      removeFile,
    });

    activate();


    function activate() {
      if ($window.outerWidth <= mobileMaxWidth) {
        uiLayout.dividerSize = 10;
        $ctrl.hideOutputMode = true;
      }
      $scope.$on('ui.layout.loaded', () => {
        $timeout(() => {
          if ($window.outerWidth > mobileMaxWidth) {
            collapsed.fileList = false;
            collapsed.editor = false;
            collapsed.liveView = false;
          } else {
            collapsed.fileList = true;
            collapsed.editor = true;
            collapsed.liveView = false;
          }
        });
      });
    }

    function aceEditorLoadListener(acee) {
      setEditorCommands(acee);
    }

    function setEditorCommands(acee) {
      acee.commands.addCommands({
        saveFile: {
          bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli',
          },
          exec: () => {
            let file = editor.activeFile;
            fileSystem.modifyFile(file.name, file.content);
          },
        },
        newFile: {
          bindKey: {
            win: 'Ctrl-B',
            mac: 'Command-B',
            sender: 'editor|cli',
          },
          exec: () => {
            $scope.$apply(() => {
              showNewFilePrompt();
            });
          },
        },
      });
    }

    function showNewFilePrompt() {
      let newFileName = $window.prompt('New filename');
      if (newFileName) {
        fileSystem.createFile(newFileName);
      }
    }

    function showRenameFilePrompt(file) {
      let newFileName = $window.prompt('Rename file', file.name);
      if (newFileName) {
        fileSystem.renameFile(file.name, newFileName);
      }
    }

    function changeActiveFile(file) {
      collapsed.editor = false;
      editor.changeActiveFile(file.name);
    }

    function toggleEditorCollapse() {
      collapsed.editor = !collapsed.editor;
      if (collapsed.editor) {
        previousCollapsedFileListStatus = collapsed.fileList;
        collapsed.fileList = true;
      } else if (!previousCollapsedFileListStatus) {
        collapsed.fileList = false;
      }
    }

    function importFiles(files) {
      for (let file of files) {
        // TODO use file.path when available
        if (!file.name) {  // File does not have a name when it is pasted
          let extension = (file.type === 'image/png' ? '.png' : '');
          let newName = 'unnamed_file';
          let counter = 1;
          let name = newName + extension;
          while (fileSystem.hasFile(name)) {
            name = newName + '_' + (++counter) + extension;
          }
          file.name = name;
        }
        // TODO reserve file name
        FileReader.readAsText(file, undefined, $scope).then(data => {
          if (isStringBinary(data)) {
            fileSystem.createFile(file);
          } else {
            fileSystem.createFile(file.name, data, file.type);
          }
        }, err => {
          /* eslint-disable no-console */
          console.error(err);
          /* eslint-enable no-console */
        });
      }
    }

    function isStringBinary(string) {
      /* eslint-disable no-control-regex */
      return /[\x00-\x08\x0E-\x1F]/.test(string);
      /* eslint-enable no-control-regex */
    }

    function removeFile(file) {
      let removeConfirmed = $window.confirm(
        `Are you sure that you want to delete ${file.name}?`
      );
      if (removeConfirmed) {
        fileSystem.deleteFile(file.name);
      }
    }
  }
})();

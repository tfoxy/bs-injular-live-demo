describe('bsInjularLiveDemo.services.editor', () => {
  'use strict';
  var editor, fileSystem, project, createNativeFile;
  
  beforeEach(angular.mock.module('bsInjularLiveDemo.services.editor'));
  
  beforeEach(inject((_editor_, _fileSystem_, _project_, _createNativeFile_) => {
    editor = _editor_;
    fileSystem = _fileSystem_;
    project = _project_;
    createNativeFile = _createNativeFile_;
  }));
  
  it('should initialize successfully', () => {
    assert(editor);
  });
  
  it('should add file to fileList when file is created', () => {
    fileSystem.createFile('foo', 'bar');
    expect(editor.fileList).to.have.length(1);
    expect(editor.fileList[0]).to.have.property('name', 'foo');
  });
  
  it('should add file to fileMap when file is created', () => {
    fileSystem.createFile('foo', 'bar');
    expect(editor.fileMap).to.have.property('size', 1);
    expect(editor.fileMap.get('foo')).to.have.property('name', 'foo');
  });
  
  it('should add file to fileMap when a raw file is created', () => {
    fileSystem.createFile(createNativeFile(['bar'], 'foo'));
    expect(editor.fileMap).to.have.property('size', 1);
    expect(editor.fileMap.get('foo')).to.have.property('name', 'foo');
  });
  
  it('should let content of file to be modified, but without changing it in fileSystem', () => {
    fileSystem.createFile('foo', 'bar');
    editor.fileList[0].content = 'foobar';
    expect(editor.fileList[0]).to.have.property('content', 'foobar');
    let content = fileSystem.readFile('foo');
    expect(content).to.equal('bar');
  });
  
  it('should remove file from fileList when file is deleted', () => {
    fileSystem.createFile('foo');
    fileSystem.deleteFile('foo');
    expect(editor.fileList).to.have.length(0);
  });
  
  it('should remove file from fileMap when file is deleted', () => {
    fileSystem.createFile('foo');
    fileSystem.deleteFile('foo');
    expect(editor.fileMap).to.have.property('size', 0);
  });
  
  it('should order files according to project settings', () => {
    project.settings = {fileOrder: ['foo', 'bar']};
    fileSystem.createFile('bar');
    fileSystem.createFile('foo');
    expect(editor.fileList).to.have.length(2);
    expect(editor.fileList[0]).to.have.property('name', 'foo');
    expect(editor.fileList[1]).to.have.property('name', 'bar');
  });
  
  it('should default to alphabetically ordering files', () => {
    fileSystem.createFile('foo');
    fileSystem.createFile('bar');
    expect(editor.fileList).to.have.length(2);
    expect(editor.fileList[0]).to.have.property('name', 'bar');
    expect(editor.fileList[1]).to.have.property('name', 'foo');
  });
  
  it('should reorder files when project settings are modified', () => {
    fileSystem.createFile('foo');
    fileSystem.createFile('bar');
    fileSystem.createFile(
      project.SETTINGS_FILENAME,
      '{"fileOrder": ["foo", "bar"]}'
    );
    expect(editor.fileList).to.have.length(3);
    expect(editor.fileList[0]).to.have.property('name', 'foo');
    expect(editor.fileList[1]).to.have.property('name', 'bar');
    expect(editor.fileList[2]).to.have.property('name', project.SETTINGS_FILENAME);
  });

  describe('.fileContentChanged', () => {

    it('should save template almost instantly', inject(($timeout) => {
      project.settings.injular.templates = 'template.html';
      fileSystem.createFile('template.html', 'foo');
      let file = editor.fileList[0];
      file.content = 'bar';
      editor.fileContentChanged(file);
      $timeout.flush(editor.settings.instantAutoSaveDelay - 1);
      expect(fileSystem.readFile('template.html')).to.equal('foo');
      $timeout.flush(1);
      expect(fileSystem.readFile('template.html')).to.equal('bar');
    }));

    it('should save script after delayedAutoSaveDelay', inject(($timeout) => {
      fileSystem.createFile('script.js', 'foo');
      let file = editor.fileList[0];
      file.content = 'bar';
      editor.fileContentChanged(file);
      expect(fileSystem.readFile('script.js')).to.equal('foo');
      $timeout.flush(editor.settings.delayedAutoSaveDelay - 1);
      expect(fileSystem.readFile('script.js')).to.equal('foo');
      $timeout.flush(1);
      expect(fileSystem.readFile('script.js')).to.equal('bar');
    }));

    it('should save project settings after delayedAutoSaveDelay', inject(($timeout) => {
      fileSystem.createFile(project.SETTINGS_FILENAME, '{}');
      let file = editor.fileList[0];
      file.content = '{"foo": "bar"}';
      editor.fileContentChanged(file);
      expect(fileSystem.readFile(file.name)).to.equal('{}');
      $timeout.flush(editor.settings.delayedAutoSaveDelay - 1);
      expect(fileSystem.readFile(file.name)).to.equal('{}');
      $timeout.flush(1);
      expect(fileSystem.readFile(file.name)).to.equal('{"foo": "bar"}');
    }));

    it('should save multiple scripts together', inject(($timeout) => {
      fileSystem.createFile('foo.js', 'foo');
      fileSystem.createFile('bar.js', 'bar');
      let fooFile = editor.fileMap.get('foo.js');
      let barFile = editor.fileMap.get('bar.js');
      fooFile.content = 'fooChanged';
      editor.fileContentChanged(fooFile);
      $timeout.flush(editor.settings.delayedAutoSaveDelay - 1);
      barFile.content = 'barChanged';
      editor.fileContentChanged(barFile);
      $timeout.flush(editor.settings.delayedAutoSaveDelay - 1);
      expect(fileSystem.readFile(fooFile.name)).to.equal('foo');
      expect(fileSystem.readFile(barFile.name)).to.equal('bar');
      $timeout.flush(1);
      expect(fileSystem.readFile(barFile.name)).to.equal('barChanged');
      expect(fileSystem.readFile(fooFile.name)).to.equal('fooChanged');
    }));

    it('should save any other file that is not a script almost instantly', inject(($timeout) => {
      fileSystem.createFile('foo.json', 'foo');
      let jsonFile = editor.fileMap.get('foo.json');
      jsonFile.content = 'fooChanged';
      editor.fileContentChanged(jsonFile);
      $timeout.flush(editor.settings.instantAutoSaveDelay - 1);
      expect(fileSystem.readFile(jsonFile.name)).to.equal('foo', 'jsonFile');
      $timeout.flush(1);
      expect(fileSystem.readFile(jsonFile.name)).to.equal('fooChanged', 'jsonFile');

      fileSystem.createFile('foo.png', 'foo');
      let pngFile = editor.fileMap.get('foo.png');
      pngFile.content = 'fooChanged';
      editor.fileContentChanged(pngFile);
      $timeout.flush(editor.settings.instantAutoSaveDelay - 1);
      expect(fileSystem.readFile(pngFile.name)).to.equal('foo', 'pngFile');
      $timeout.flush(1);
      expect(fileSystem.readFile(pngFile.name)).to.equal('fooChanged', 'pngFile');
    }));

    it('should not autosave script that was deleted', inject(($timeout) => {
      fileSystem.createFile('foo.js', 'foo');
      let jsonFile = editor.fileList[0];
      jsonFile.content = 'fooChanged';
      editor.fileContentChanged(jsonFile);
      fileSystem.deleteFile(jsonFile.name);
      let fn = () => $timeout.flush(editor.settings.delayedAutoSaveDelay);
      expect(fn).to.not.throw(Error);
    }));

  });
});

describe('bsInjularLiveDemo.services.editor initializer', () => {
  'use strict';
  var $injector, fileSystem;
  
  beforeEach(angular.mock.module('bsInjularLiveDemo.services.editor'));
  
  beforeEach(inject((_$injector_, _fileSystem_) => {
    $injector = _$injector_;
    fileSystem = _fileSystem_;
  }));
  
  it('should add files from fileSystem', () => {
    fileSystem.createFile('foo');
    var editor = $injector.get('editor');
    expect(editor.fileList).to.have.length(1);
    expect(editor.fileList[0]).to.have.property('name', 'foo');
    expect(editor.fileMap.has('foo')).to.equal(true);
  });
});

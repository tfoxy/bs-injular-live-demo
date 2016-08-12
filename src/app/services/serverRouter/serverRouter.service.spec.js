describe('bsInjularLiveDemo.services.serverRouter', () => {
  'use strict';
  var serverRouter, fileSystem, project, createNativeFile;

  beforeEach(angular.mock.module('bsInjularLiveDemo.services.serverRouter'));

  beforeEach(inject((_serverRouter_, _fileSystem_, _project_, _createNativeFile_) => {
    serverRouter = _serverRouter_;
    fileSystem = _fileSystem_;
    project = _project_;
    createNativeFile = _createNativeFile_;
  }));

  it('should initialize successfully', () => {
    assert(serverRouter);
  });

  it('should be an object', () => {
    expect(serverRouter).to.be.an('object');
  });

  describe('.getFileContent', () => {

    it('should return the content of the file', () => {
      fileSystem.createFile('foo', 'bar');
      let content = serverRouter.getFileContent('foo');
      expect(content).to.equal('bar');
    });

    it('should tamper an angular template', () => {
      project.settings.injular.templates = '*.html';
      let content = '<div></div>';
      fileSystem.createFile('foo.html', content);
      let tamperedContent = serverRouter.getFileContent('foo.html');
      expect(tamperedContent).to.not.equal(content);
      expect(tamperedContent).to.include(content);
    });

    it('should tamper the angular file', () => {
      project.settings.injular.angularFile = 'angular.js';
      let content = `var angular = {'foo': 'bar'};`;
      fileSystem.createFile('angular.js', content);
      let tamperedContent = serverRouter.getFileContent('angular.js');
      expect(tamperedContent).to.not.equal(content);
      expect(tamperedContent).to.include(content);
    });

    it('should tamper the main module file', () => {
      project.settings.injular.moduleFile = 'index.module.js';
      project.settings.injular.ngApp = 'fooApp';
      let content = `var foo = 'bar';`;
      fileSystem.createFile('index.module.js', content);
      let tamperedContent = serverRouter.getFileContent('index.module.js');
      expect(tamperedContent).to.not.equal(content);
      expect(tamperedContent).to.include(content);
    });

  });

  describe('.getBlobUrl', () => {

    it('should return the blob url for the given url', () => {
      fileSystem.createFile('foo', 'bar');
      let url = serverRouter.getBlobUrl('foo');
      expect(url).to.startWith('blob:');
    });

    it('should return the same blob url when calling it twice with the same url', () => {
      fileSystem.createFile('foo', 'bar');
      let firstUrl = serverRouter.getBlobUrl('foo');
      let secondUrl = serverRouter.getBlobUrl('foo');
      expect(secondUrl).to.equal(firstUrl);
    });

    it('should return a different blob url when file was modified', () => {
      fileSystem.createFile('foo', 'bar');
      let firstUrl = serverRouter.getBlobUrl('foo');
      fileSystem.modifyFile('foo', 'foobar');
      let secondUrl = serverRouter.getBlobUrl('foo');
      expect(secondUrl).to.not.equal(firstUrl);
    });

    it('should throw an error if file was deleted after calling it at least once', () => {
      fileSystem.createFile('foo', 'bar');
      serverRouter.getBlobUrl('foo');
      fileSystem.deleteFile('foo');
      let fn = () => serverRouter.getBlobUrl('foo');
      expect(fn).to.throw(Error);
    });

    it('should throw an error if file was renamed after calling it at least once', () => {
      fileSystem.createFile('foo', 'bar');
      serverRouter.getBlobUrl('foo');
      fileSystem.renameFile('foo', 'foo2');
      let fn = () => serverRouter.getBlobUrl('foo');
      expect(fn).to.throw(Error);
    });

    it('should return the blob url of the file when handling an imported file', () => {
      let file = createNativeFile(['bar'], 'foo', { type: 'text/plain' });
      fileSystem.createFile(file);
      let url = serverRouter.getBlobUrl('foo');
      expect(url).to.startWith('blob:');

      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      expect(xhr.responseText).to.equal('bar');
    });

  });
});

describe('bsInjularLiveDemo.services.fileSystem', () => {
  'use strict';
  let fileSystem, createNativeFile;

  beforeEach(angular.mock.module('bsInjularLiveDemo.services.fileSystem'));

  beforeEach(inject((_fileSystem_, _createNativeFile_) => {
    fileSystem = _fileSystem_;
    createNativeFile = _createNativeFile_;
  }));

  it('should initialize successfully', () => {
    assert(fileSystem);
  });

  it('should return an object', () => {
    expect(fileSystem).to.be.an('object');
  });

  describe('.createFile', () => {

    it('should return created file', () => {
      let file = fileSystem.createFile('foo');
      expect(file).to.be.an('object')
      .and.to.have.property('name', 'foo');
    });

    it('should throw an error when file already exists', () => {
      fileSystem.createFile('foo');
      let fn = () => fileSystem.createFile('foo');
      expect(fn).to.throw(Error);
    });

    it('should emit postCreate with the file properties frozen', () => {
      let file;
      let spy = sinon.spy(_file => file = _file);
      fileSystem.events.on('postCreate', spy);
      fileSystem.createFile('foo', 'bar');
      expect(spy).to.have.callCount(1);
      let fn = () => file.content = '';
      expect(fn).to.throw(Error);
    });

    it('should accept a native File', () => {
      let file = createNativeFile(['bar'], 'foo', { type: 'text/plain' });
      fileSystem.createFile(file);
      let fsFile = fileSystem.getFile('foo');
      expect(fsFile).to.have.property('file', file);
      expect(fsFile).to.have.property('name', 'foo');
      expect(fsFile).to.have.property('type', 'text/plain');
    });

  });

  describe('.readFile', () => {

    it('should return the file content', () => {
      fileSystem.createFile('foo', 'bar');
      let content = fileSystem.readFile('foo');
      expect(content).to.equal('bar');
    });

    it('should throw an error when file does not exists', () => {
      let fn = () => fileSystem.readFile('foo');
      expect(fn).to.throw(Error);
    });

  });

  describe('.modifyFile', () => {

    it('should not return anything', () => {
      fileSystem.createFile('foo', 'bar');
      let val = fileSystem.modifyFile('foo', 'foobar');
      expect(val).to.be.an('undefined');
    });

    it('should throw an error when file does not exists', () => {
      let fn = () => fileSystem.modifyFile('foo', 'bar');
      expect(fn).to.throw(Error);
    });

    it('should throw an error when no content is given', () => {
      fileSystem.createFile('foo', 'bar');
      let fn = () => fileSystem.modifyFile('foo');
      expect(fn).to.throw(Error);
    });

    it('should change the content when reading the file later', () => {
      fileSystem.createFile('foo', 'bar');
      fileSystem.modifyFile('foo', 'foobar');
      let content = fileSystem.readFile('foo');
      expect(content).to.equal('foobar');
    });

    it('should emit postModify with the file properties frozen', () => {
      let file;
      let spy = sinon.spy(_file => file = _file);
      fileSystem.createFile('foo', 'bar');
      fileSystem.events.on('postModify', spy);
      fileSystem.modifyFile('foo', 'foobar');
      expect(spy).to.have.callCount(1);
      let fn = () => file.content = '';
      expect(fn).to.throw(Error);
    });

  });

  describe('.deleteFile', () => {

    it('should not return anything', () => {
      fileSystem.createFile('foo');
      let val = fileSystem.deleteFile('foo');
      expect(val).to.be.an('undefined');
    });

    it('should throw an error when file does not exists', () => {
      let fn = () => fileSystem.deleteFile('foo');
      expect(fn).to.throw(Error);
    });

    it('should throw an error when trying to delete twice', () => {
      fileSystem.createFile('foo');
      fileSystem.deleteFile('foo');
      let fn = () => fileSystem.deleteFile('foo');
      expect(fn).to.throw(Error);
    });

    it('should emit postDelete with the file properties frozen', () => {
      let file;
      let spy = sinon.spy(_file => file = _file);
      fileSystem.createFile('foo', 'bar');
      fileSystem.events.on('postDelete', spy);
      fileSystem.deleteFile('foo');
      expect(spy).to.have.callCount(1);
      let fn = () => file.content = '';
      expect(fn).to.throw(Error);
    });

  });

  describe('.renameFile', () => {

    it('should have file with new name', () => {
      fileSystem.createFile('foo');
      fileSystem.renameFile('foo', 'bar');
      expect(fileSystem.hasFile('bar')).to.equal(true);
    });

    it('should not have file with old name', () => {
      fileSystem.createFile('foo');
      fileSystem.renameFile('foo', 'bar');
      expect(fileSystem.hasFile('foo')).to.equal(false);
    });

    it('should return renamed file', () => {
      fileSystem.createFile('foo');
      let file = fileSystem.renameFile('foo', 'bar');
      expect(file).to.be.an('object')
      .and.to.have.property('name', 'bar');
    });

    it('should work with File', done => {
      let file = createNativeFile(['bar'], 'foo', { type: 'text/plain' });
      fileSystem.createFile(file);
      fileSystem.renameFile('foo', 'foo2');
      let fsFile = fileSystem.getFile('foo2');
      expect(fsFile).to.have.property('file');
      expect(fsFile).to.have.property('name', 'foo2');
      expect(fsFile).to.have.property('type', 'text/plain');
      expect(fsFile.file).to.have.property('name', 'foo2');
      expect(fsFile.file).to.have.property('lastModified', file.lastModified);
      expect(fsFile.file).to.have.property('lastModifiedDate');

      let fileReader = new FileReader();
      fileReader.onload = evt => {
        expect(evt.target.result).to.equal('bar');
        done();
      };
      fileReader.onerror = done;
      fileReader.readAsText(fsFile.file);
    });

  });
});

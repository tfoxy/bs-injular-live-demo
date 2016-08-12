describe('bsInjularLiveDemo.services.MemoryFile', function() {
  'use strict';
  var MemoryFile;

  beforeEach(angular.mock.module('bsInjularLiveDemo.services.MemoryFile'));

  beforeEach(inject(function(_MemoryFile_) {
    MemoryFile = _MemoryFile_;
  }));

  it('should initialize successfully', function() {
    assert(MemoryFile);
  });

  it('should return a function', function() {
    expect(MemoryFile).to.be.a('function');
  });

  it('should return an instance with empty content when calling it with new', function() {
    expect(new MemoryFile('foobar')).to.have.property('content', '');
  });

  it('should throw an error when creating a file with no name', function() {
    let fn = () => new MemoryFile('');
    expect(fn).to.throw(Error);
  });
});

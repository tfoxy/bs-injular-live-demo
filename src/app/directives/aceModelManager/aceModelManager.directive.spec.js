describe('bsInjularLiveDemo.directives.aceModelManager', () => {
  'use strict';
  let $scope, compileAndDigest, createDirectiveElement;
  let ace, editor, fileSystem, createNativeFile;

  beforeEach(angular.mock.module('bsInjularLiveDemo.directives.aceModelManager'));

  beforeEach(inject(($rootScope, $compile) => {
    $scope = $rootScope.$new();
    compileAndDigest = function(html) {
      let element = angular.element(html);
      $compile(element)($scope);
      $scope.$digest();

      return element;
    };
    createDirectiveElement = function() {
      let t = '<div ace-model-manager></div>';
      return compileAndDigest(t);
    };
  }));

  beforeEach(inject((_ace_, _editor_, _fileSystem_, _createNativeFile_) => {
    ace = _ace_;
    editor = _editor_;
    fileSystem = _fileSystem_;
    createNativeFile =_createNativeFile_;
  }));

  it('should compile and digest successfully', () => {
    let element = createDirectiveElement();
    expect(element[0].tagName).to.equal('DIV');
  });

  it('should listen to editor events', () => {
    sinon.spy(editor.events, 'on');
    createDirectiveElement();
    sinon.assert.called(editor.events.on);
  });

  it('should set ace session to initial active file', () => {
    fileSystem.createFile('foo.js', 'bar');
    let el = createDirectiveElement();
    let acee = ace.edit(el[0]);
    expect(acee.session).to.have.property('name', 'foo.js');
    expect(acee.session).to.have.property('content', 'bar');
  });

  it('should set ace session to null when there is no initial active file', () => {
    let el = createDirectiveElement();
    let acee = ace.edit(el[0]);
    expect(acee.session).to.equal(null);
  });

  it('should change ace session on active file change', () => {
    fileSystem.createFile('foo.js');
    let el = createDirectiveElement();
    let acee = ace.edit(el[0]);
    let initialSession = acee.session;
    fileSystem.createFile('foo.css');
    expect(acee.session).to.not.equal(initialSession);
    expect(acee.session).to.have.property('name', 'foo.css');
  });

  it('should unset session when changing to no active file', () => {
    fileSystem.createFile('foo.js');
    let el = createDirectiveElement();
    let acee = ace.edit(el[0]);
    expect(acee.session).to.not.equal(null);
    editor.changeActiveFile(null);
    expect(acee.session).to.equal(null);
  });

  it('should unset session when active file is a raw file', () => {
    fileSystem.createFile(createNativeFile(['bar'], 'foo.js'));
    let el = createDirectiveElement();
    let acee = ace.edit(el[0]);
    expect(acee.session).to.equal(null);
  });

  describe('on "$destroy"', () => {

    it('should stop listening to editor events', () => {
      sinon.spy(editor.events, 'off');
      createDirectiveElement();
      $scope.$emit('$destroy');
      sinon.assert.called(editor.events.off);
    });

  });
});

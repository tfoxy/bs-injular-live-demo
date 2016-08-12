describe('bsInjularLiveDemo.services.project', () => {
  'use strict';
  var project, fileSystem;

  beforeEach(angular.mock.module('bsInjularLiveDemo.services.project'));

  beforeEach(inject((_project_, _fileSystem_) => {
    project = _project_;
    fileSystem = _fileSystem_;
  }));

  it('should initialize successfully', () => {
    assert(project);
  });

  it('should have a read-only SETTINGS_FILENAME property', () => {
    expect(project).to.have.property('SETTINGS_FILENAME');
    let fn = () => project.SETTINGS_FILENAME = 'foo';
    expect(fn).to.throw(Error);
  });

  it('should change settings when ".injular.json" file is created', () => {
    fileSystem.createFile(project.SETTINGS_FILENAME, '{"foo": "bar"}');
    expect(project.settings).to.have.property('foo', 'bar');
  });

  it('should change settings when ".injular.json" file is modified', () => {
    fileSystem.createFile(project.SETTINGS_FILENAME, '{"foo": "bar"}');
    fileSystem.modifyFile(project.SETTINGS_FILENAME, '{"foo": "foobar"}');
    expect(project.settings).to.have.property('foo', 'foobar');
  });

  it('should not let ".injular.json" file to be deleted when there is an origin', () => {
    project.origin = 'fooTest';
    fileSystem.createFile(project.SETTINGS_FILENAME, '{"foo": "bar"}');
    let fn = () => {
      fileSystem.deleteFile(project.SETTINGS_FILENAME);
    };
    expect(fn).to.throw(Error);
    let content = fileSystem.readFile(project.SETTINGS_FILENAME);
    expect(content).to.equal('{"foo": "bar"}');
  });

  it('should emit postModifySettings when settings are modified', () => {
    let spy = sinon.spy();
    project.events.on('postModifySettings', spy);
    fileSystem.createFile(project.SETTINGS_FILENAME, '{"foo": "bar"}');
    expect(spy).to.have.callCount(1);
    fileSystem.modifyFile(project.SETTINGS_FILENAME, '{"foo": "foobar"}');
    expect(spy).to.have.callCount(2);
  });
});

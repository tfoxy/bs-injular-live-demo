describe('bsInjularLiveDemo.services.projectCreator', function() {
  'use strict';
  var projectCreator;
  
  beforeEach(angular.mock.module('bsInjularLiveDemo.services.projectCreator'));
  
  beforeEach(inject(function(_projectCreator_) {
    projectCreator = _projectCreator_;
  }));
  
  it('should initialize successfully', function() {
    assert(projectCreator);
  });
});

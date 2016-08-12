describe('bsInjularLiveDemo.directives.addMovingSplitbarClass', function() {
  'use strict';
  var $scope, compileAndDigest;

  beforeEach(angular.mock.module('bsInjularLiveDemo.directives.addMovingSplitbarClass'));

  beforeEach(inject(function($rootScope, $compile) {
    $scope = $rootScope.$new();
    compileAndDigest = function(html) {
      var element = angular.element(html);
      $compile(element)($scope);
      $scope.$digest();

      return element;
    };
  }));

  it('should compile and digest successfully', function() {
    var t = '<div ui-layout add-moving-splitbar-class></div>';
    var element = compileAndDigest(t);
    expect(element[0].tagName).to.equal('DIV');
  });
});

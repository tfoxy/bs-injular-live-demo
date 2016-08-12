describe('bsInjularLiveDemo.directives.liveDemoIframe', () => {
  'use strict';
  let div, $scope, compileAndDigest;

  beforeEach(() => {
    div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.removeChild(div);
  });

  beforeEach(angular.mock.module('bsInjularLiveDemo.directives.liveDemoIframe'));

  beforeEach(inject(($rootScope, $compile) => {
    $scope = $rootScope.$new();
    compileAndDigest = (html, parent) => {
      var element = angular.element(html);
      if (parent) parent.appendChild(element[0]);
      $compile(element)($scope);
      $scope.$digest();

      return element;
    };
  }));

  it('should compile and digest successfully', () => {
    var t = '<iframe live-demo-iframe></iframe>';
    var element = compileAndDigest(t, div);
    expect(element[0].tagName).to.equal('IFRAME');
  });
});

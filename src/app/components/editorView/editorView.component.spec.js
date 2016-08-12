describe('bsInjularLiveDemo.components.editorView', () => {
  'use strict';
  let $scope, compileAndDigest, $rootEl;

  before(() => {
    let rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    $rootEl = angular.element(rootEl);
  });

  beforeEach(angular.mock.module('bsInjularLiveDemo.components.editorView'));
  beforeEach(angular.mock.module('app/components/editorView/editorView.html'));

  beforeEach(inject(($rootScope, $compile) => {
    $scope = $rootScope.$new();
    compileAndDigest = (html) => {
      let element = angular.element(html);
      $rootEl.append(element);
      $compile(element)($scope);
      $scope.$digest();

      return element;
    };
  }));

  afterEach(() => {
    $rootEl.children().remove();
  });

  after(() => {
    $rootEl.remove();
  });

  it('should compile and digest successfully', () => {
    let t = '<editor-view></editor-view>';
    let element = compileAndDigest(t);
    expect(element[0].tagName).to.equal('EDITOR-VIEW');
    expect(element.children().length).to.be.gt(0);
  });
});

describe('bsInjularLiveDemo.components.editorView.$ctrl', () => {
  'use strict';
  let $componentController;

  beforeEach(angular.mock.module('bsInjularLiveDemo.components.editorView'));

  beforeEach(inject($injector => {
    $componentController = $injector.get('$componentController');
  }));

  it('should initialize successfully', () => {
    let $ctrl = $componentController('editorView');
    assert($ctrl);
  });

});

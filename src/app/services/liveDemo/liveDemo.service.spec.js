describe('bsInjularLiveDemo.services.liveDemo', () => {
  'use strict';
  let div, liveDemo, fileSystem, project;

  const IFRAME_HTML = '<iframe style="display:none" src="about:blank"></iframe>';

  beforeEach(() => {
    div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);
  });

  afterEach(() => {
    document.body.removeChild(div);
  });

  beforeEach(angular.mock.module('bsInjularLiveDemo.services.liveDemo'));

  beforeEach(inject((_liveDemo_, _fileSystem_, _project_) => {
    liveDemo = _liveDemo_;
    fileSystem = _fileSystem_;
    project = _project_;
  }));

  it('should initialize successfully', () => {
    assert(liveDemo);
  });

  describe('.setIframe', () => {

    it('should accept an iframe jqlite element', () => {
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
    });

    it('should throw an error if iframe does not have a window', () => {
      let $iframe = angular.element(IFRAME_HTML);
      let fn = () => liveDemo.setIframe($iframe);
      expect(fn).to.throw(Error);
    });

    it('should set the content of the entryFile as the document', done => {
      fileSystem.createFile('index.html', '<html foo="bar"></html>');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      $iframe.on('load', () => {
        let doc = $iframe[0].contentDocument.documentElement;
        expect(doc.getAttribute('foo')).to.equal('bar', doc.outerHTML);
        done();
      });
    });

    it('should set the doctype', done => {
      fileSystem.createFile('index.html', '<!DOCTYPE foodoc><html></html>');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      $iframe.on('load', () => {
        let doc = $iframe[0].contentDocument;
        assert(doc.doctype);
        expect(doc.doctype.name).to.equal('foodoc');
        done();
      });
    });

    it('should change local stylesheet to blob', done => {
      let doc;
      let html = 
        `<link rel="stylesheet" href="foo.css">`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.css', 'body {color: red}');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        doc = liveDemo._window.document;
        // Iframe needs to be removed so resources are not downloaded
        $iframe.remove();
      });
      liveDemo.events.on('postReplaceDocument', () => {
        let links = doc.getElementsByTagName('link');
        expect(links).to.have.length(1);
        expect(links[0].getAttribute('href')).to.startWith('blob:');
        done();
      });
    });

    it('should change local script to blob', done => {
      let doc;
      let html = 
        `<script id="script" src="foo.js"></script>`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.js', 'var foo = "bar"');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        doc = liveDemo._window.document;
        // Iframe needs to be removed so resources are not downloaded
        $iframe.remove();
      });
      liveDemo.events.on('postReplaceDocument', () => {
        let script = doc.getElementById('script');
        expect(script.getAttribute('src')).to.startWith('blob:');
        done();
      });
    });

    it('should append the patch-angular script after the angular script', done => {
      let doc;
      let html = `\
<html>
<script src="http://www.example.com/angular.js"></script>
<script src="http://www.example.com/foo.js"></script>
</html>`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.js', 'var foo = "bar"');
      project.settings.entryFile = 'index.html';
      project.settings.injular.angularFile = '**/angular.js';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        doc = liveDemo._window.document;
        // Iframe needs to be removed so resources are not downloaded
        $iframe.remove();
      });
      liveDemo.events.on('postReplaceDocument', () => {
        let docHtml = doc.documentElement.outerHTML;
        let i;
        for (i = 0; i < doc.scripts.length; i++) {
          if ((doc.scripts[i].getAttribute('src') || '').endsWith('/angular.js'))
            break;
        }
        if (i >= doc.scripts.length) {
          throw Error('/angular.js script not found.\n' + docHtml);
        }
        expect(doc.scripts[i].getAttribute('src')).to.endWith('/angular.js', docHtml);
        expect(doc.scripts[i + 1].text).to.have.property('length').that.is.greaterThan(1, docHtml);
        expect(doc.scripts[i + 2].getAttribute('src')).to.endWith('/foo.js', docHtml);
        done();
      });
    });

    it('should fake xhr requests that are local and return the content from fileSystem', done => {
      let fileContent = 'var foo = "bar"';
      let html = `\
<script>
xhr = new XMLHttpRequest();
xhr.open('GET', 'foo.js', false);
xhr.send();
</script>`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.js', fileContent);
      project.settings.entryFile = 'index.html';
      project.settings.injular.angularFile = '**/angular.js';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        liveDemo._window.addEventListener('DOMContentLoaded', () => {
          expect(liveDemo._window.xhr).to.be.an('object');
          expect(liveDemo._window.xhr.responseText).to.equal(fileContent, liveDemo._window.xhr.status);
          done();
        });
      });
    });

    it('should fake xhr requests that are local and return 404 if file is not in fileSystem', done => {
      let html = `\
<script>
xhr = new XMLHttpRequest();
xhr.open('GET', 'foo.js', false);
xhr.send();
</script>`;
      fileSystem.createFile('index.html', html);
      project.settings.entryFile = 'index.html';
      project.settings.injular.angularFile = '**/angular.js';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        liveDemo._window.addEventListener('DOMContentLoaded', () => {
          expect(liveDemo._window.xhr).to.be.an('object');
          expect(liveDemo._window.xhr.status).to.equal(404);
          done();
        });
      });
    });

    it('should change local image src to blob when document is created', done => {
      let doc;
      let html = 
        `<img id="img" src="foo.jpg">`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.jpg');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('preReplaceDocument', () => {
        doc = liveDemo._window.document;
        // Iframe needs to be removed so resources are not downloaded
        $iframe.remove();
      });
      liveDemo.events.on('postReplaceDocument', () => {
        let img = doc.getElementById('img');
        expect(img.getAttribute('src')).to.startWith('blob:');
        done();
      });
    });

    it('should change local image src to blob when innerHTML is set', done => {
      let html = `<div id="div"></div>`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.jpg');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo._noRequests = true;
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('postReplaceDocument', () => {
        let doc = liveDemo._window.document;
        let div = doc.getElementById('div');
        div.innerHTML = `<img id="img" src="foo.jpg">`;
        // Wait for MutationObserver
        setTimeout(function() {
          let img = doc.getElementById('img');
          expect(img.getAttribute('src')).to.startWith('blob:');
          done();
        });
      });
    });

    it('should change local image src to blob when it is set after document creation', done => {
      let html = `<img id="img">`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.jpg');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo._noRequests = true;
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('postReplaceDocument', () => {
        let doc = liveDemo._window.document;
        let img = doc.getElementById('img');
        img.setAttribute('src', 'foo.jpg');
        // Wait for MutationObserver
        setTimeout(function() {
          expect(img.getAttribute('src')).to.startWith('blob:');
          done();
        });
      });
    });

    it('should change local image src to blob prior to being inserted into the document', done => {
      fileSystem.createFile('index.html');
      fileSystem.createFile('foo.jpg');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo._noRequests = true;
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('postReplaceDocument', () => {
        let doc = liveDemo._window.document;
        let img = doc.createElement('img');
        img.setAttribute('src', 'foo.jpg');
        // Wait for MutationObserver
        setTimeout(function() {
          expect(img.getAttribute('src')).to.startWith('blob:');
          doc.body.appendChild(img);  // make sure there is no problem by inserting image
          done();
        });
      });
    });

    it('should change local image src to blob when innerHTML is set and image is a child', done => {
      let html = `<div id="div"></div>`;
      fileSystem.createFile('index.html', html);
      fileSystem.createFile('foo.jpg');
      project.settings.entryFile = 'index.html';
      let $iframe = angular.element(IFRAME_HTML);
      div.appendChild($iframe[0]);
      liveDemo._noRequests = true;
      liveDemo.setIframe($iframe);
      liveDemo.reload();
      liveDemo.events.on('postReplaceDocument', () => {
        let doc = liveDemo._window.document;
        let div = doc.getElementById('div');
        div.innerHTML = `<b><i><img id="img" src="foo.jpg"></i></b>`;
        // Wait for MutationObserver
        setTimeout(function() {
          let img = doc.getElementById('img');
          expect(img.getAttribute('src')).to.startWith('blob:');
          done();
        });
      });
    });

  });
});

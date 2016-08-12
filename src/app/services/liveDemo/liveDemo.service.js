(function() {
  'use strict';
  
  angular.module('bsInjularLiveDemo.services.liveDemo')
  .factory('liveDemo', liveDemoFactory);


  function liveDemoFactory($log, $window, EventEmitter, match, injular, fileChanger, fileSystem, serverRouter, project) {
    const domain = $window.location.protocol + '//' + $window.location.host;

    const liveDemo = {
      events: new EventEmitter(),
      setIframe,
      reload,
      _replaceDocument,
    };

    fileSystem.events.on('postCreate', fileModifiedListener);
    fileSystem.events.on('postRename', fileModifiedListener);
    fileSystem.events.on('postModify', fileModifiedListener);
    fileSystem.events.on('postDelete', _reloadFn);

    project.events.on('init', _reloadFn);
    project.events.on('postModifySettings', _reloadFn);

    return liveDemo;


    function setIframe($iframe) {
      if (this.$iframe === $iframe) return;
      this.$iframe = $iframe;
      this._injular = null;
      this._window = null;
      if (!$iframe) return;
      this._window = $iframe[0].contentWindow;
      if (!this._window) {
        throw new Error('Iframe does not have a window');
      }
      this.$iframe.on('load', () => {
        if ($iframe === this.$iframe) {
          this._window = this.$iframe[0].contentWindow;
          this._replaceDocument();
        }
      });
    }


    function reload() {
      if (!this._window) return;
      if (project.loading) {
        this._window.document.body.textContent = 'Loading...';
      } else {
        this._window.location.replace('about:blank');
        this._injular = null;
      }
    }

    function _reloadFn() {
      liveDemo.reload();
    }


    function fileModifiedListener(file) {
      const settings = project.settings;
      if (!liveDemo._injular) {
        liveDemo.reload();
      } else if (match(file.name, settings.injular.templates)) {
        let content = serverRouter.getFileContent(file.name);
        liveDemo._injular.injectTemplate({
          template: content,
          templateUrl: file.name,
          reloadRoute: settings.injular.reloadRouteOnTemplateInjection,
          avoidCleanScope: settings.injular.avoidCleanScope,
          logLevel: settings.logLevel,
        });
      } else {
        let recipes = getNgRecipes(file.name);
        if (recipes.length) {
          liveDemo._injular.injectScript({
            script: file.content,
            scriptUrl: file.name,
            recipes,
            logLevel: settings.logLevel
          });
        } else {
          liveDemo.reload();
        }
      }
    }


    function _replaceDocument() {
      if (project.settings.entryFile) {
        let win = this._window;
        let doc = win.document.open();
        this.events.emitEvent('preReplaceDocument');
        injular.newInstance(win, doc);
        this._injular = win.injular;
        delete win.injular;
        win.___setUpSinonFakeRequest = getSetUpSinonFakeRequestFn(win);
        let html = getDocumentHtmlString();
        doc.write(html);
        doc.close();
        observerDomMutation(doc);
        this.events.emitEvent('postReplaceDocument');
      }
    }


    function getNgRecipes(name) {
      const injSettings = project.settings.injular;
      let recipes = [];
      if (match(name, injSettings.controllers)) {
        recipes.push('controller');
      } else if (match(name, injSettings.directives)) {
        recipes.push('directive');
      } else if (match(name, injSettings.filters)) {
        recipes.push('filter');
      }
      return recipes;
    }


    function getDocumentHtmlString() {
      let entryFile = project.settings.entryFile;
      try {
        let initialHtml = serverRouter.getFileContent(entryFile);
        let doc = htmlToDom(initialHtml);
        modifyDocumentScriptsSrc(doc);
        modifyDocumentLinksHref(doc);
        modifyDocumentImgsSrc(doc);
        prependSinonFakeRequest(doc);
        return getDoctypeHtml(doc) + doc.documentElement.outerHTML;
      } catch (err) {
        $log.error(err);
        return `<p style="color:red">${err}</p>`;
      }
    }


    function htmlToDom(content) {
      let doc = document.implementation.createHTMLDocument();
      doc.open();
      doc.write('<base href="/">\n' + content);
      doc.close();
      return doc;
    }


    function modifyDocumentScriptsSrc(doc) {
      let scripts = doc.scripts;
      for (let i = 0; i < scripts.length; i++) {
        let script = scripts[i];
        let src = script.src;
        if (src.startsWith(domain) && script.getAttribute('src')) {
          let srcPath = src.slice(domain.length + 1);
          let blobUrl = serverRouter.getBlobUrl(srcPath);
          script.setAttribute('injular-src', src);
          script.setAttribute('src', blobUrl);
        } else if (match(src, project.settings.injular.angularFile)) {
          let newScript = doc.createElement('script');
          newScript.text = fileChanger.appendAngularModulePatch('');
          script.parentNode.insertBefore(newScript, script.nextSibling);
        }
      }
    }


    function modifyDocumentLinksHref(doc) {
      let links = doc.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let href = link.href;
        if (String.prototype.startsWith.call(href, domain)) {
          let path = href.slice(domain.length);
          if (path.startsWith('/')) {
            path = path.slice(1);
          }
          let blobUrl = serverRouter.getBlobUrl(path);
          link.setAttribute('href', blobUrl);
        }
      }
    }


    function modifyDocumentImgsSrc(doc) {
      let imgs = doc.getElementsByTagName('img');
      for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
        blobifyImgSrc(img);
      }
    }


    function prependSinonFakeRequest(doc) {
      if (liveDemo._noRequests) return;
      let sinonFilterScriptElement = doc.createElement('script');
      sinonFilterScriptElement.text = `\
window.___setUpSinonFakeRequest();delete window.___setUpSinonFakeRequest;delete window.sinon;`;
      doc.head.insertBefore(sinonFilterScriptElement, doc.head.firstChild);

      let sinonScriptElement = doc.createElement('script');
      sinonScriptElement.setAttribute('src', 'assets/sinon-server-1.17.3.js');
      doc.head.insertBefore(sinonScriptElement, doc.head.firstChild);
    }


    function observerDomMutation(doc) {
      if (typeof MutationObserver === 'undefined') return;
      let observer = new MutationObserver(callback);
      let config = { attributes: true, childList: true, subtree: true };
      observer.observe(doc, config);

      let createElement = doc.createElement;
      doc.createElement = observeCreateElement;


      function callback(mutations) {
        for (let mutation of mutations) {
          for (let node of mutation.addedNodes) {
            blobifyImgSrc(node);
            let tw = document.createTreeWalker(
              node,
              NodeFilter.SHOW_ELEMENT,
              (node) => {
                if (node.tagName === 'IMG') {
                  return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
              }
            );
            while ((node = tw.nextNode())) {
              blobifyImgSrc(node);
            }
          }
          if (mutation.attributeName === 'src') {
            blobifyImgSrc(mutation.target);
          }
        }
      }

      function observeCreateElement() {
        let el = createElement.apply(this, arguments);
        observer.observe(el, config);
        return el;
      }
    }


    function blobifyImgSrc(node) {
      let src = node.src || '';
      if (String.prototype.startsWith.call(src, domain)) {
        let path = src.slice(domain.length);
        if (path.startsWith('/')) {
          path = path.slice(1);
        }
        let blobUrl = serverRouter.getBlobUrl(path);
        node.setAttribute('src', blobUrl);
        node.setAttribute('injular-src', src);
      }
    }


    function getSetUpSinonFakeRequestFn(win) {
      return setUpSinonFakeRequest;

      function setUpSinonFakeRequest() {
        let anchor = win.document.createElement('a');
        let server = win.sinon.fakeServer.create();
        server.xhr.useFilters = true;
        server.xhr.addFilter(filter);
        server.respondWith(respondWith);
        server.autoRespond = true;
        let scripts = win.document.scripts;
        win.document.head.removeChild(scripts[1]);
        win.document.head.removeChild(scripts[0]);

        function filter(method, url) {
          try {
            getLocalFileFromUrl(url);
            return false;
          } catch(err) {
            return true;
          }
        }

        function respondWith(xhr) {
          let headers = {};
          let localFile = getLocalFileFromUrl(xhr.url);
          if (localFile.type) {
            headers['Content-Type'] = localFile.type;
          }
          xhr.respond(200, headers, localFile.content);
        }

        function getLocalFileFromUrl(url) {
          anchor.href = url;
          let href = anchor.href;
          if (href.startsWith(domain)) {
            let fileName = href.slice(domain.length + 1);
            return serverRouter.getFile(fileName);
          }
        }
      }
    }


    function getDoctypeHtml(doc) {
      var node = doc.doctype;
      if (!node) return '';
      return "<!DOCTYPE "
          + node.name
          + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
          + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
          + (node.systemId ? ' "' + node.systemId + '"' : '')
          + '>\n';
    }
  }
})();

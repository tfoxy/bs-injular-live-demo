"use strict";!function(){angular.module("bsInjularLiveDemo.services.serverRouter",["bsInjularLiveDemo.deps.minimatch","bsInjularLiveDemo.deps.fileChanger","bsInjularLiveDemo.services.fileSystem","bsInjularLiveDemo.services.project"])}(),function(){function e(e,t,n,i){function r(r){var o=n.getFile(r).copy();if(o.file)return o;var a=o.content,l=i.settings.injular;return e(r,l.templates)?a=t.wrapTemplate(a,r):e(r,l.directives)?a=t.wrapDirectiveFile(a,r):e(r,l.moduleFile)?a=t.appendProvideGetter(a,l.ngApp):e(r,l.angularFile)&&(a=t.appendAngularModulePatch(a)),o.content=a,o}function o(e){return u.getFile(e).content}function a(e){var t=c.get(e);if(!t){var n=u.getFile(e),i=void 0;if(n.file)i=n.file;else{var r=n.content,o=n.type;i=new Blob([r],{type:o})}t=URL.createObjectURL(i),c.set(e,t)}return t}function l(e){var t=c.get(e.name);t&&(URL.revokeObjectURL(t),c["delete"](e.name))}function s(e,t){l(t),u.getBlobUrl(e.name)}var c=new Map,u={_blobUrlCache:c,getBlobUrl:a,getFile:r,getFileContent:o};return n.events.on("postModify",l),n.events.on("postRename",s),n.events.on("postDelete",l),u}e.$inject=["match","fileChanger","fileSystem","project"],angular.module("bsInjularLiveDemo.services.serverRouter").factory("serverRouter",e)}(),function(){angular.module("bsInjularLiveDemo.services.projectCreator",["bsInjularLiveDemo.services.project","bsInjularLiveDemo.services.fileSystem","bsInjularLiveDemo.services.editor","bsInjularLiveDemo.services.serverRouter","bsInjularLiveDemo.services.liveDemo"]).run(["editor","serverRouter","liveDemo",function(e,t,n){}])}(),function(){function e(e,t,n,i){function r(){var e="blank";n.origin!==e&&(n.origin=e,n.startLoading(),i.createFile("index.html",'<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <style>[ng-cloak] { display: none; }</style>\n  </head>\n  <body ng-app="app">\n    <!--\n    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.js"></script>\n    -->\n  </body>\n</html>\n'),n.doneLoading())}function o(r){var o="gh-gist_"+r;if(n.origin!==o)return n.origin=o,n.startLoading(),e.get("https://api.github.com/gists/"+r).then(function(e){var t=e.data.files;for(var r in t){var o=t[r];i.createFile(r,o.content,o.type)}n.doneLoading()},function(e){t.error(e)})}var a={blank:r,githubGist:o};return a}e.$inject=["$http","$log","project","fileSystem"],angular.module("bsInjularLiveDemo.services.projectCreator").factory("projectCreator",e)}(),function(){angular.module("bsInjularLiveDemo.services.project",["bsInjularLiveDemo.deps.EventEmitter","bsInjularLiveDemo.services.fileSystem"])}(),function(){function e(e,n){function i(e){e.name===t&&(c.events.emitEvent("preModifySettings"),c.settings=JSON.parse(e.content),c.settings.injular||(c.settings.injular={}),c.events.emitEvent("postModifySettings"))}function r(e,n){var i=n||e;if(i.name===t&&!c.loading)throw new Error(t+" file cannot be deleted")}function o(){c.loading=!0,n.clear(),l()}function a(){s(),c.loading=!1,c.events.emitEvent("init")}function l(){c.settings={injular:{}}}function s(){if(!n.hasFile(c.SETTINGS_FILENAME)){var e={entryFile:"index.html",injular:{templates:"**/!(index).html",controllers:"**/*.controller?(s).js",directives:"**/*.+(directive?(s)|component?(s)).js",filters:"**/*.filter?(s).js",angularFile:"**/angular?(.min).js",moduleFile:"**/+(app|index)?(.module).js"},fileOrder:[".injular.json"]},t=JSON.stringify(e,null,2);n.createFile(c.SETTINGS_FILENAME,t)}}var c={get SETTINGS_FILENAME(){return t},origin:null,loading:!1,startLoading:o,doneLoading:a,events:new e};return l(),n.events.on("postCreate",i),n.events.on("postModify",i),n.events.on("preRename",r),n.events.on("preDelete",r),c}e.$inject=["EventEmitter","fileSystem"];var t=".injular.json";angular.module("bsInjularLiveDemo.services.project").factory("project",e)}(),function(){angular.module("bsInjularLiveDemo.services.liveDemo",["bsInjularLiveDemo.deps.EventEmitter","bsInjularLiveDemo.deps.minimatch","bsInjularLiveDemo.deps.injular","bsInjularLiveDemo.deps.fileChanger","bsInjularLiveDemo.services.fileSystem","bsInjularLiveDemo.services.serverRouter","bsInjularLiveDemo.services.project"])}(),function(){function e(e,t,n,i,r,o,a,l,s){function c(e){var t=this;if(this.$iframe!==e&&(this.$iframe=e,this._injular=null,this._window=null,e)){if(this._window=e[0].contentWindow,!this._window)throw new Error("Iframe does not have a window");this.$iframe.on("load",function(){e===t.$iframe&&(t._window=t.$iframe[0].contentWindow,t._replaceDocument())})}}function u(){this._window&&(s.loading?this._window.document.body.textContent="Loading...":(this._window.location.replace("about:blank"),this._injular=null))}function v(){E.reload()}function d(e){var t=s.settings;if(E._injular)if(i(e.name,t.injular.templates)){var n=l.getFileContent(e.name);E._injular.injectTemplate({template:n,templateUrl:e.name,reloadRoute:t.injular.reloadRouteOnTemplateInjection,avoidCleanScope:t.injular.avoidCleanScope,logLevel:t.logLevel})}else{var r=f(e.name);r.length?E._injular.injectScript({script:e.content,scriptUrl:e.name,recipes:r,logLevel:t.logLevel}):E.reload()}else E.reload()}function m(){if(s.settings.entryFile){var e=this._window,t=e.document.open();this.events.emitEvent("preReplaceDocument"),r.newInstance(e,t),this._injular=e.injular,delete e.injular,e.___setUpSinonFakeRequest=F(e);var n=p();t.write(n),t.close(),w(t),this.events.emitEvent("postReplaceDocument")}}function f(e){var t=s.settings.injular,n=[];return i(e,t.controllers)?n.push("controller"):i(e,t.directives)?n.push("directive"):i(e,t.filters)&&n.push("filter"),n}function p(){var t=s.settings.entryFile;try{var n=l.getFileContent(t),i=g(n);return h(i),b(i),y(i),j(i),D(i)+i.documentElement.outerHTML}catch(r){return e.error(r),'<p style="color:red">'+r+"</p>"}}function g(e){var t=document.implementation.createHTMLDocument();return t.open(),t.write('<base href="/">\n'+e),t.close(),t}function h(e){for(var t=e.scripts,n=0;n<t.length;n++){var r=t[n],a=r.src;if(a.startsWith(I)&&r.getAttribute("src")){var c=a.slice(I.length+1),u=l.getBlobUrl(c);r.setAttribute("injular-src",a),r.setAttribute("src",u)}else if(i(a,s.settings.injular.angularFile)){var v=e.createElement("script");v.text=o.appendAngularModulePatch(""),r.parentNode.insertBefore(v,r.nextSibling)}}}function b(e){for(var t=e.getElementsByTagName("link"),n=0;n<t.length;n++){var i=t[n],r=i.href;if(String.prototype.startsWith.call(r,I)){var o=r.slice(I.length);o.startsWith("/")&&(o=o.slice(1));var a=l.getBlobUrl(o);i.setAttribute("href",a)}}}function y(e){for(var t=e.getElementsByTagName("img"),n=0;n<t.length;n++){var i=t[n];L(i)}}function j(e){if(!E._noRequests){var t=e.createElement("script");t.text="window.___setUpSinonFakeRequest();delete window.___setUpSinonFakeRequest;delete window.sinon;",e.head.insertBefore(t,e.head.firstChild);var n=e.createElement("script");n.setAttribute("src","assets/sinon-server-1.17.3.js"),e.head.insertBefore(n,e.head.firstChild)}}function w(e){function t(e){var t=!0,n=!1,i=void 0;try{for(var r,o=e[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=r.value,l=!0,s=!1,c=void 0;try{for(var u,v=a.addedNodes[Symbol.iterator]();!(l=(u=v.next()).done);l=!0){var d=u.value;L(d);for(var m=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT,function(e){return"IMG"===e.tagName?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});d=m.nextNode();)L(d)}}catch(f){s=!0,c=f}finally{try{!l&&v["return"]&&v["return"]()}finally{if(s)throw c}}"src"===a.attributeName&&L(a.target)}}catch(f){n=!0,i=f}finally{try{!t&&o["return"]&&o["return"]()}finally{if(n)throw i}}}function n(){var e=o.apply(this,arguments);return i.observe(e,r),e}if("undefined"!=typeof MutationObserver){var i=new MutationObserver(t),r={attributes:!0,childList:!0,subtree:!0};i.observe(e,r);var o=e.createElement;e.createElement=n}}function L(e){var t=e.src||"";if(String.prototype.startsWith.call(t,I)){var n=t.slice(I.length);n.startsWith("/")&&(n=n.slice(1));var i=l.getBlobUrl(n);e.setAttribute("src",i),e.setAttribute("injular-src",t)}}function F(e){function t(){function t(e,t){try{return i(t),!1}catch(n){return!0}}function n(e){var t={},n=i(e.url);n.type&&(t["Content-Type"]=n.type),e.respond(200,t,n.content)}function i(e){r.href=e;var t=r.href;if(t.startsWith(I)){var n=t.slice(I.length+1);return l.getFile(n)}}var r=e.document.createElement("a"),o=e.sinon.fakeServer.create();o.xhr.useFilters=!0,o.xhr.addFilter(t),o.respondWith(n),o.autoRespond=!0;var a=e.document.scripts;e.document.head.removeChild(a[1]),e.document.head.removeChild(a[0])}return t}function D(e){var t=e.doctype;return t?"<!DOCTYPE "+t.name+(t.publicId?' PUBLIC "'+t.publicId+'"':"")+(!t.publicId&&t.systemId?" SYSTEM":"")+(t.systemId?' "'+t.systemId+'"':"")+">\n":""}var I=t.location.protocol+"//"+t.location.host,E={events:new n,setIframe:c,reload:u,_replaceDocument:m};return a.events.on("postCreate",d),a.events.on("postRename",d),a.events.on("postModify",d),a.events.on("postDelete",v),s.events.on("init",v),s.events.on("postModifySettings",v),E}e.$inject=["$log","$window","EventEmitter","match","injular","fileChanger","fileSystem","serverRouter","project"],angular.module("bsInjularLiveDemo.services.liveDemo").factory("liveDemo",e)}(),function(){angular.module("bsInjularLiveDemo.services.editor",["bsInjularLiveDemo.deps.EventEmitter","bsInjularLiveDemo.deps.ace","bsInjularLiveDemo.services.fileSystem","bsInjularLiveDemo.services.project"])}();var _slicedToArray=function(){function e(e,t){var n=[],i=!0,r=!1,o=void 0;try{for(var a,l=e[Symbol.iterator]();!(i=(a=l.next()).done)&&(n.push(a.value),!t||n.length!==t);i=!0);}catch(s){r=!0,o=s}finally{try{!i&&l["return"]&&l["return"]()}finally{if(r)throw o}}return n}return function(t,n){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();!function(){function e(e,t,n,i,r){function o(t){function n(){var e=!0,t=!1,n=void 0;try{for(var r,a=o.values()[Symbol.iterator]();!(e=(r=a.next()).done);e=!0){var l=r.value,s=j.get(l);i.modifyFile(s.name,s.content)}}catch(c){t=!0,n=c}finally{try{!e&&a["return"]&&a["return"]()}finally{if(t)throw n}}o.clear()}var o=void 0,a=void 0,l=void 0,s=t.name;s.endsWith(".js")||s===r.SETTINGS_FILENAME||s===r.settings.entryFile?(o=w,a="delayedAutoSave",l=b.delayedAutoSaveDelay):(o=L,a="instantAutoSave",l=b.instantAutoSaveDelay),e.cancel(F[a]),o.add(s),F[a]=e(n,l)}function a(e,t){o(t)}function l(e){var t=void 0;t=e.file?c(e):s(e),j.set(t.name,t),y.push(t),p(),D.changeActiveFile(t.name)}function s(e){var t=h.getModeForPath(e.name).mode,i=n.createEditSession(e.content,t);return i.name=e.name,Object.defineProperty(i,"content",{get:function(){return i.doc.getValue()},set:function(e){return i.doc.setValue(e)}}),u(i),i.on("change",a),i}function c(e){return e.copy()}function u(e){e.on("changeAnnotation",function(){if(e.name.endsWith(".html")&&e.name!==r.settings.entryFile){for(var t=e.getAnnotations(),n=t.length,i=n;i--;)/doctype first\. Expected/.test(t[i].text)&&t.splice(i,1);t.length<n&&e.setAnnotations(t)}})}function v(e,t){var n=e.name,i=t.name,r=j.get(i);j["delete"](i),r.name=n;var o=h.getModeForPath(n).mode;r.setMode(o),j.set(r.name,r),p(),w["delete"](i)&&w.put(n),L["delete"](i)&&L.put(n)}function d(e){j["delete"](e.name);var t=!0,n=!1,i=void 0;try{for(var r,o=y.entries()[Symbol.iterator]();!(t=(r=o.next()).done);t=!0){var a=_slicedToArray(r.value,2),l=a[0],s=a[1];s.name===e.name&&(y.splice(l,1),w["delete"](s.name),L["delete"](s.name))}}catch(c){n=!0,i=c}finally{try{!t&&o["return"]&&o["return"]()}finally{if(n)throw i}}var u=D.fileList[0];D.changeActiveFile(u?u.name:null)}function m(){p()}function f(){var e=D.fileList[0];D.changeActiveFile(e?e.name:null)}function p(){var e=r.settings.fileOrder||[];y.sort(function(t,n){var i=e.indexOf(t.name),r=e.indexOf(n.name);0>i&&(i=e.length),0>r&&(r=e.length);var o=i-r;return 0===o&&(o=t.name<=n.name?-1:1),o})}function g(e){var t=null;if(e&&(t=j.get(e),!t))throw new Error("File "+e+" is not in editor");var n=D.activeFile;D.events.emitEvent("preActiveFileChange",[t,n]),D.activeFile=t,D.events.emitEvent("postActiveFileChange",[t,n])}var h=n.require("ace/ext/modelist"),b={autoSave:!0,delayedAutoSaveDelay:1e3,instantAutoSaveDelay:80},y=[],j=new Map,w=new Set,L=new Set,F={delayedAutoSave:null,instantAutoSave:null},D={activeFile:null,settings:b,fileList:y,fileMap:j,changeActiveFile:g,fileContentChanged:o,events:new t},I=!0,E=!1,S=void 0;try{for(var $,C=i.getFiles()[Symbol.iterator]();!(I=($=C.next()).done);I=!0){var M=$.value;l(M)}}catch(x){E=!0,S=x}finally{try{!I&&C["return"]&&C["return"]()}finally{if(E)throw S}}return i.events.on("postCreate",l),i.events.on("postRename",v),i.events.on("postDelete",d),r.events.on("postModifySettings",m),r.events.on("init",f),D}e.$inject=["$timeout","EventEmitter","ace","fileSystem","project"],angular.module("bsInjularLiveDemo.services.editor").factory("editor",e)}(),function(){angular.module("bsInjularLiveDemo.services.fileSystem",["bsInjularLiveDemo.deps.EventEmitter","bsInjularLiveDemo.services.MemoryFile"])}(),function(){function e(e,t){function n(e){var n=arguments.length<=1||void 0===arguments[1]?"":arguments[1],i=arguments.length<=2||void 0===arguments[2]?null:arguments[2],r=new t(e,n,i);if(e=r.name,m.has(e))throw new Error("File already exists: "+e);return Object.freeze(r),d.events.emitEvent("preCreate",[r]),m.set(e,r),d.events.emitEvent("postCreate",[r]),r}function i(e){return r(e).content}function r(e){var t=m.get(e);if(!t)throw new Error("File does not exists: "+e);return t}function o(e){return r(e).type}function a(){return m.values()}function l(e){return m.has(e)}function s(e,n){var i=m.get(e);if(!i)throw new Error("File does not exists: "+e);if("undefined"==typeof n)throw new Error("Content is needed when modifying file: "+e);var r=new t(e,n,i.type);Object.freeze(r),d.events.emitEvent("preModify",[r,i]),m.set(e,r),d.events.emitEvent("postModify",[r,i])}function c(e,t){var n=m.get(e);if(!n)throw new Error("File does not exists: "+e);if(e!==t){if(m.has(t))throw new Error("File already exists: "+e);var i=n.copy();return i.rename(t),Object.freeze(i),d.events.emitEvent("preRename",[i,n]),m["delete"](e),m.set(t,i),d.events.emitEvent("postRename",[i,n]),i}}function u(e){var t=m.get(e);if(!t)throw new Error("File does not exists: "+e);d.events.emitEvent("preDelete",[t]),m["delete"](e),d.events.emitEvent("postDelete",[t])}function v(){var e=!0,t=!1,n=void 0;try{for(var i,r=m.keys()[Symbol.iterator]();!(e=(i=r.next()).done);e=!0){var o=i.value;d.deleteFile(o)}}catch(a){t=!0,n=a}finally{try{!e&&r["return"]&&r["return"]()}finally{if(t)throw n}}}var d={createFile:n,readFile:i,getFile:r,getFileType:o,getFiles:a,hasFile:l,modifyFile:s,renameFile:c,deleteFile:u,clear:v,events:new e},m=new Map;return d}e.$inject=["EventEmitter","MemoryFile"],angular.module("bsInjularLiveDemo.services.fileSystem").factory("fileSystem",e)}(),function(){angular.module("bsInjularLiveDemo.services.MemoryFile",["bsInjularLiveDemo.deps.createNativeFile","bsInjularLiveDemo.services.mimeType"])}(),function(){function e(e,t){function n(e){var n=arguments.length<=1||void 0===arguments[1]?"":arguments[1],i=arguments.length<=2||void 0===arguments[2]?null:arguments[2];if(e instanceof Blob){var r=e;this.name=r.name,this.file=r,this.type=r.type||t.lookup(r.name)}else this.name=e,this.content=n,this.type=i||t.lookup(e);if(!this.name)throw new Error("Name is missing")}function i(){return new n(this.file||this.name,this.content,this.type)}function r(t){var n=this.file;if(n){var i=e([n],t,{type:n.type,lastModified:n.lastModified});this.file=i}this.name=t}return n.prototype.copy=i,n.prototype.rename=r,n}e.$inject=["createNativeFile","mimeType"],angular.module("bsInjularLiveDemo.services.MemoryFile").factory("MemoryFile",e)}(),function(){angular.module("bsInjularLiveDemo.directives.liveDemoIframe",["bsInjularLiveDemo.services.liveDemo"])}(),function(){function e(e){function t(t,n){e.setIframe(n),e.reload(),t.$on("$destroy",function(){e.setIframe(null)})}return{restrict:"A",link:t}}e.$inject=["liveDemo"],angular.module("bsInjularLiveDemo.directives.liveDemoIframe").directive("liveDemoIframe",e)}(),function(){angular.module("bsInjularLiveDemo.directives.addMovingSplitbarClass",["ui.layout"])}(),function(){function e(){function e(e,t,n,i){function r(e){return i.movingSplitbar&&(n.$addClass("moving-splitbar"),i.movingSplitbar.element.addClass("-moving")),a(e)}function o(e){return i.movingSplitbar&&i.movingSplitbar.element.removeClass("-moving"),n.$removeClass("moving-splitbar"),l(e)}var a=i.processSplitbar,l=i.mouseUpHandler;i.processSplitbar=r,i.mouseUpHandler=o}return{restrict:"A",require:"uiLayout",link:e}}angular.module("bsInjularLiveDemo.directives.addMovingSplitbarClass").directive("addMovingSplitbarClass",e)}(),function(){angular.module("bsInjularLiveDemo.directives.aceModelManager",["bsInjularLiveDemo.deps.ace","bsInjularLiveDemo.services.editor"])}(),function(){function e(e,t,n){function i(e,i,r){function o(){var e=n.activeFile,t=null;e&&!e.file&&(t=e),l.setSession(t),l.focus()}function a(){n.events.off("postActiveFileChange",o)}var l=t.edit(i[0]);window.acee=l,l.$blockScrolling=1/0,n.events.on("postActiveFileChange",o),e.$on("$destroy",a),o(),e.$eval(r.aceModelManagerOnLoad,{$acee:l})}return{restrict:"A",link:i}}e.$inject=["$timeout","ace","editor"],angular.module("bsInjularLiveDemo.directives.aceModelManager").directive("aceModelManager",e)}(),function(){angular.module("bsInjularLiveDemo.components.editorView",["ui.layout","ngFileUpload","filereader","bsInjularLiveDemo.deps.ace","bsInjularLiveDemo.services.editor","bsInjularLiveDemo.services.fileSystem","bsInjularLiveDemo.services.projectCreator","bsInjularLiveDemo.directives.liveDemoIframe","bsInjularLiveDemo.directives.addMovingSplitbarClass","bsInjularLiveDemo.directives.aceModelManager"])}(),function(){function e(e,n,i,r,o,a,l){function s(){n.outerWidth<=t&&(y.dividerSize=10,b.hideOutputMode=!0),e.$on("ui.layout.loaded",function(){i(function(){n.outerWidth>t?(j.fileList=!1,j.editor=!1,j.liveView=!1):(j.fileList=!0,j.editor=!0,j.liveView=!1)})})}function c(e){u(e)}function u(t){t.commands.addCommands({saveFile:{bindKey:{win:"Ctrl-S",mac:"Command-S",sender:"editor|cli"},exec:function(){var e=a.activeFile;l.modifyFile(e.name,e.content)}},newFile:{bindKey:{win:"Ctrl-B",mac:"Command-B",sender:"editor|cli"},exec:function(){e.$apply(function(){v()})}}})}function v(){var e=n.prompt("New filename");e&&l.createFile(e)}function d(e){var t=n.prompt("Rename file",e.name);t&&l.renameFile(e.name,t)}function m(e){j.editor=!1,a.changeActiveFile(e.name)}function f(){j.editor=!j.editor,j.editor?(w=j.fileList,j.fileList=!0):w||(j.fileList=!1)}function p(t){var n=!0,i=!1,o=void 0;try{for(var a,s=function(){var t=a.value;if(!t.name){for(var n="image/png"===t.type?".png":"",i="unnamed_file",o=1,s=i+n;l.hasFile(s);)s=i+"_"+ ++o+n;t.name=s}r.readAsText(t,void 0,e).then(function(e){g(e)?l.createFile(t):l.createFile(t.name,e,t.type)},function(e){console.error(e)})},c=t[Symbol.iterator]();!(n=(a=c.next()).done);n=!0)s()}catch(u){i=!0,o=u}finally{try{!n&&c["return"]&&c["return"]()}finally{if(i)throw o}}}function g(e){return/[\x00-\x08\x0E-\x1F]/.test(e)}function h(e){var t=n.confirm("Are you sure that you want to delete "+e.name+"?");t&&l.deleteFile(e.name)}var b=this,y={flow:"column",disableToggle:!0,dividerSize:5},j={fileList:!1,editor:!1,liveView:!1},w=void 0;angular.extend(b,{uiLayout:y,collapsed:j,editor:a,aceEditorLoadListener:c,changeActiveFile:m,toggleEditorCollapse:f,showNewFilePrompt:v,showRenameFilePrompt:d,importFiles:p,removeFile:h}),s()}e.$inject=["$scope","$window","$timeout","FileReader","ace","editor","fileSystem"];var t=480;angular.module("bsInjularLiveDemo.components.editorView").component("editorView",{templateUrl:"app/components/editorView/editorView.html",controller:e})}(),function(){angular.module("bsInjularLiveDemo",["ngTouch","ui.router","bsInjularLiveDemo.components.editorView"])}(),function(){function e(e,t){e.otherwise("/gh-gist/83f19f04eacc289cd0fc7afedd66559f"),t.state("editor",{"abstract":!0,template:"<editor-view></editor-view>"}).state("editor.blank",{url:"/blank",resolve:{__init__:["$log","projectCreator",function(e,t){try{t.blank()}catch(n){e.error(n)}}]}}).state("editor.gh-gist",{url:"/gh-gist/:gistId",resolve:{__init__:["$log","$stateParams","projectCreator",function(e,t,n){try{n.githubGist(t.gistId)}catch(i){e.error(i)}}]}})}e.$inject=["$urlRouterProvider","$stateProvider"],angular.module("bsInjularLiveDemo").config(e)}(),function(){function e(e){e.debugEnabled("localhost"===location.hostname)}e.$inject=["$logProvider"],angular.module("bsInjularLiveDemo").config(e)}(),function(){function e(e){if(e){var t=e.lastIndexOf(".")+1,n=e.slice(t);return this._dict[n]}}var t=Object.create(null);angular.extend(t,{bmp:"image/bmp",css:"text/css",gif:"image/gif",html:"text/html",ico:"  image/x-icon",jpe:"image/jpeg",jpeg:"image/jpeg",jpg:"image/jpeg",js:"application/javascript",json:"application/json",png:"image/png",svg:"image/svg+xml",tiff:"image/tiff",webp:"image/webp",xml:"application/xml"}),angular.module("bsInjularLiveDemo.services.mimeType",[]).constant("mimeType",{_dict:t,lookup:e})}(),function(){function e(e,t){return t?minimatch(e,t):!1}angular.module("bsInjularLiveDemo.deps.minimatch",[]).constant("minimatch",minimatch).constant("match",e)}(),function(){angular.module("bsInjularLiveDemo.deps.injular",[]).constant("injular",injular)}(),function(){angular.module("bsInjularLiveDemo.deps.fileChanger",[]).constant("fileChanger",fileChanger)}(),function(){function e(e,t){var n=arguments.length<=2||void 0===arguments[2]?{}:arguments[2],i=void 0;try{i=new File(e,t,n)}catch(r){var o=void 0;o="lastModified"in n?new Date(n.lastModified):new Date,i=new Blob(e,n),i.name=t,i.lastModified=+o,i.lastModifiedDate=o}return i}angular.module("bsInjularLiveDemo.deps.createNativeFile",[]).constant("createNativeFile",e)}(),function(){angular.module("bsInjularLiveDemo.deps.ace",[]).constant("ace",ace)}(),function(){angular.module("bsInjularLiveDemo.deps.EventEmitter",[]).constant("EventEmitter",EventEmitter)}(),angular.module("bsInjularLiveDemo").run(["$templateCache",function(e){e.put("app/components/editorView/editorView.html",'<div class=editor-view ngf-drop=$ctrl.importFiles($files) ngf-multiple=true ngf-drag-over-class="\'-dragging-file\'" ng-model-options="{updateOn: \'drop paste\'}"><div class=topbar><button type=button class="btn-clear nav-button" ng-click="$ctrl.collapsed.fileList = !$ctrl.collapsed.fileList"><i class="fa fa-navicon"></i></button><div class=toggle-panel-buttons><button type=button class="btn-clear editor-button" ng-click=$ctrl.toggleEditorCollapse() ng-class="{\'active\': !$ctrl.collapsed.editor}">Editor</button><!--\n   --><button type=button class="btn-clear live-view-button" ng-click="$ctrl.collapsed.liveView = !$ctrl.collapsed.liveView" ng-class="{\'active\': !$ctrl.collapsed.liveView}">Output</button><label class=hide-mode-label><span></span> <input type=checkbox ng-model=$ctrl.hideOutputMode> <span>Hide mode</span></label></div></div><div class=content ui-layout=$ctrl.uiLayout add-moving-splitbar-class ui-layout-loaded><div class=file-list-wrapper ui-layout-container collapsed=$ctrl.collapsed.fileList size=175px><ul class=file-list><li ng-repeat="file in $ctrl.editor.fileList track by file.name" class=file-list-item ng-class="{\'active\': $ctrl.editor.activeFile === file}"><button type=button class="select-file-button btn-clear" ng-click=$ctrl.changeActiveFile(file) ng-dblclick=$ctrl.showRenameFilePrompt(file)>{{file.name}}</button> <button type=button class="remove-file-button btn-clear" ng-click=$ctrl.removeFile(file)><i class="fa fa-remove" aria-hidden=true></i></button></li><li class=file-list-item><button type=button class="file-bar-button select-file-button btn-clear" ng-click=$ctrl.showNewFilePrompt()><i class="fa fa-file-code-o" aria-hidden=true></i><span>New file</span></button></li></ul></div><div class=editor-wrapper ui-layout-container collapsed=$ctrl.collapsed.editor><div ace-model-manager ace-model-manager-on-load=$ctrl.aceEditorLoadListener($acee) ng-show=!$ctrl.editor.activeFile.file></div><img ng-src={{$ctrl.editor.activeFile.file|ngfDataUrl}} ng-if=$ctrl.editor.activeFile.file></div><div class=live-view-wrapper ui-layout-container collapsed=$ctrl.collapsed.liveView><div class=live-view-overlay></div><iframe id=live-view ng-if="!$ctrl.collapsed.liveView || $ctrl.hideOutputMode" live-demo-iframe ng-src=about:blank></iframe></div></div></div>')}]);
//# sourceMappingURL=../maps/scripts/app-f88bc13e40.js.map
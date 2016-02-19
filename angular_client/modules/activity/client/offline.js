(function() {
  if (window.require) {
    window.nodeWebkitRequire = window.require;
    delete window.require;
  }
  if (window.exports) {
    window.nodeWebkitExports = window.exports;
    delete window.exports;
  }
  if (window.module) {
    window.nodeWebkitModule = window.module;
    delete window.module;
  }
  if (!nodeWebkitRequire || typeof nodeWebkitRequire !== "function") {
    return;
  }
  var gui = nodeWebkitRequire('nw.gui');


  // Extend application menu for Mac OS
  if (process.platform == "darwin") {
    var menu = new gui.Menu({
      type: "menubar"
    });
    menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
    gui.Window.get().menu = menu;
  }

  gui.Window.get().show();
})();

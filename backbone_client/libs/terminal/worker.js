self.requestFileSystemSync = self.requestFileSystemSync ||
                             self.webkitRequestFileSystemSync;

var paths = [];
var fs = null;

self.onmessage = function(e) {
  var data = e.data;

  if ('type' in data && 'size' in data) {
    fs = requestFileSystemSync(data.type, data.size);
  }

  switch (data.cmd) {
    case 'init':
      var dirs = {
        '/usr/local/bin/': ['helloworld.cpp'],
        '/usr/local/': [
            'a.txt', 'b.txt', 'c.txt', 'd.txt', 'e.txt', 'f.txt', 'g.txt', 'h.txt',
            'i.txt', 'j.txt','k.txt','l.txt','m.txt','n.txt'],
        '/pics/': ['one.png', 'two.jpg', 'three.png', 'four.jpg', 'five.png'],
        '/var/www/': ['index.html'],
        '/var/www/htdocs/css/': ['main.css'],
        '/var/www/htdocs/js/': ['main.js'],
        '/var/www/htdocs/': ['blank.html', 'index.html'],
        '/Users/eric/cupcakes/': [
          'chocolate.png', 'white.png', 'pink.png', 'mini.png'],
        'Users/arne/TOP_SECRET/': ['html4_rocks.txt']
      };

      for (var dir in dirs) {
        var folders = dir.split('/');

        // Throw out './' or '/' if present on the beginning of our path.
        if (folders[0] == '.' || folders[0] == '') {
          folders = folders.slice(1);
        }

        createDir(fs.root, folders);

        dirs[dir].forEach(function(file, i) {
          var fileEntry = createFile(fs.root, dir + file);
        });
      };

      createFile

      self.postMessage({msg: 'Files loaded!'});
      break;
    case 'read':
      paths = [];
      getAllFileEntries(fs.root.createReader(), fs.root.name);
      self.postMessage({entries: paths});
      //self.close();
      break;
    default:
      // noop
  }
};

function getAllFileEntries(dirReader, name) {

  var entries = dirReader.readEntries();

  for (var i = 0, entry; entry = entries[i]; ++i) {
    if (entry.isDirectory) {
      //paths.push('root' + entry.fullPath + '/.');//.substring(1));
      paths.push((entry.fullPath + '/.').substring(1));
      getAllFileEntries(entry.createReader(), entry.name);
    } else {
      //paths.push('root' + entry.fullPath);//.substring(1));
      paths.push(entry.fullPath.substring(1));
    }
  }
}

function createFile(rootDirEntry, path) {
  return rootDirEntry.getFile(path, {create: true});
}

function createDir(rootDirEntry, folders) {
  if (folders.length) {
    var dirEntry = rootDirEntry.getDirectory(folders[0], {create: true});

    // Recursively add the new subfolder if we still have a subfolder to create.
    createDir(dirEntry, folders.slice(1));
  }
}
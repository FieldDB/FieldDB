/*
Copyright 2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eric Bidelman (ericbidelman@chromium.org)
*/

var util = util || {};
util.toArray = function(list) {
  return Array.prototype.slice.call(list || [], 0);
};

// Cross-browser impl to get document's height.
util.getDocHeight = function() {
  var d = document;
  return Math.max(
      Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
      Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
      Math.max(d.body.clientHeight, d.documentElement.clientHeight)
  );
};


// TODO(ericbidelman): add fallback to html5 audio.
function Sound(opt_loop) {
  var self_ = this;
  var context_ = null;
  var source_ = null;
  var loop_ = opt_loop || false;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (window.AudioContext) {
    context_ = new window.AudioContext();
  }

  this.load = function(url, mixToMono, opt_callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (context_) {
        /*self_.sample = context_.createBuffer(this.response, mixToMono);
        if (opt_callback) {
          opt_callback();
        }
        */
        context_.decodeAudioData(this.response, function(audioBuffer) {
          self_.sample = audioBuffer;
          opt_callback && opt_callback();
        }, function(e) {
          console.log(e);
        });
      }
    };
    xhr.send();
  };

  this.play = function() {
    if (context_) {
      source_ = context_.createBufferSource();
      source_.buffer = self_.sample;
      source_.looping = loop_;
      source_.connect(context_.destination);
      source_.noteOn(0);
    }
  };

  this.stop = function() {
    if (source_) {
      source_.noteOff(0);
      source_.disconnect(0);
    }
  };
}

var Terminal = Terminal || function(containerId) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem ||
                             window.webkitRequestFileSystem;

  const VERSION_ = '1.0.0';
  const CMDS_ = [
    '3d', 'cat', 'cd', 'cp', 'clear', 'date', 'help', 'install', 'ls', 'mkdir',
    'mv', 'open', 'pwd', 'rm', 'rmdir', 'theme', 'version', 'who', 'wget'
  ];
  const THEMES_ = ['default', 'cream'];

  var fs_ = null;
  var cwd_ = null;
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;

  var timer_ = null;
  var magicWord_ = null;

  var fsn_ = null;
  var is3D_ = false;

  // Fire worker to return recursive snapshot of current FS tree.
  var worker_ = new Worker('worker.js');
  worker_.onmessage = function(e) {
    var data = e.data;
    if (data.entries) {
      fsn_.contentWindow.postMessage({cmd: 'build', data: data.entries},
                                     window.location.origin);
    }
    if (data.msg) {
      output('<div>' + data.msg + '</div>');
    }
  };
  worker_.onerror = function(e) { console.log(e) };

  // Create terminal and cache DOM nodes;
  var container_ = document.getElementById(containerId);
  container_.insertAdjacentHTML('beforeEnd',
      ['<output></output>',
       '<div id="input-line" class="input-line">',
       '<div class="prompt">$&gt;</div><div><input class="cmdline" autofocus /></div>',
       '</div>'].join(''));
  var cmdLine_ = container_.querySelector('#input-line .cmdline');
  var output_ = container_.querySelector('output');
  var interlace_ = document.querySelector('.interlace');
  var bell_ = new Sound(false);
  bell_.load('beep.mp3', false);

  // Hackery to resize the interlace background image as the container grows.
  output_.addEventListener('DOMSubtreeModified', function(e) {
    var docHeight = util.getDocHeight();
    document.documentElement.style.height = docHeight + 'px';
    //document.body.style.background = '-webkit-radial-gradient(center ' + (Math.round(docHeight / 2)) + 'px, contain, rgba(0,75,0,0.8), black) center center no-repeat, black';
    interlace_.style.height = docHeight + 'px';
    setTimeout(function() { // Need this wrapped in a setTimeout. Chrome is jupming to top :(
      //window.scrollTo(0, docHeight);
      cmdLine_.scrollIntoView();
    }, 0);
    //window.scrollTo(0, docHeight);
  }, false);

  output_.addEventListener('click', function(e) {
    var el = e.target;
    if (el.classList.contains('file') || el.classList.contains('folder')) {
      cmdLine_.value += ' ' + el.textContent;
    }
  }, false);

  window.addEventListener('click', function(e) {
    //if (!document.body.classList.contains('offscreen')) {
      cmdLine_.focus();
    //}
  }, false);

  // Always force text cursor to end of input line.
  cmdLine_.addEventListener('click', inputTextClick_, false);

  // Handle up/down key presses for shell history and enter for new command.
  cmdLine_.addEventListener('keydown', keyboardShortcutHandler_, false);
  cmdLine_.addEventListener('keyup', historyHandler_, false); // keyup needed for input blinker to appear at end of input.
  cmdLine_.addEventListener('keydown', processNewCommand_, false);

  /*window.addEventListener('beforeunload', function(e) {
    return "Don't leave me!";
  }, false);*/

  function inputTextClick_(e) {
    this.value = this.value;
  }

  function keyboardShortcutHandler_(e) {
    // Toggle CRT screen flicker.
    if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) { // crtl+s
      container_.classList.toggle('flicker');
      output('<div>Screen flicker: ' +
             (container_.classList.contains('flicker') ? 'on' : 'off') +
             '</div>');
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function selectFile_(el) {
    alert(el)
  }

  function historyHandler_(e) { // Tab needs to be keydown.

    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
        this.value = this.value; // Sets cursor to end of input.
      }
    }
  }

  function processNewCommand_(e) {

    // Beep on backspace and no value on command line.
    if (!this.value && e.keyCode == 8) {
      bell_.stop();
      bell_.play();
      return;
    }

    if (e.keyCode == 9) { // Tab
      e.preventDefault();
      // TODO(ericbidelman): Implement tab suggest.
    } else if (e.keyCode == 13) { // enter

      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      output_.appendChild(line);

      // Parse out command, args, and trim off whitespace.
      // TODO(ericbidelman): Support multiple comma separated commands.
      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function(val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();
        args = args.splice(1); // Remove cmd from arg list.
      }

      switch (cmd) {
        case '3d':
          clear_(this);
          output('Hold on to your butts!');
          toggle3DView_();
          break;
        case 'cat':
          var fileName = args.join(' ');

          if (!fileName) {
            output('usage: ' + cmd + ' filename');
            break;
          }

          read_(cmd, fileName, function(result) {
            output('<pre>' + result + '</pre>');
          });

          break;
        case 'clear':
          clear_(this);
          return;
        case 'date':
          output((new Date()).toLocaleString());
          break;
        case 'exit':
          if (is3D_) {
            toggle3DView_();
          }
          if (timer_ != null) {
            magicWord_.stop();
            clearInterval(timer_);
          }
          break;
        case 'help':
          output('<div class="ls-files">' + CMDS_.join('<br>') + '</div>');
          output('<p>Add files by dragging them from your desktop.</p>');
          break;
        case 'install':
          // Check is installed.
          if (window.chrome && window.chrome.app) {
            if (!window.chrome.app.isInstalled) {
              try {
                chrome.app.install();
              } catch(e) {
                alert(e + '\nEnable is about:flags');
              }
            } else {
              output('This app is already installed.');
            }
          }
          break;
        case 'ls':
          ls_(function(entries) {
            if (entries.length) {
              var html = formatColumns_(entries);
              util.toArray(entries).forEach(function(entry, i) {
                html.push(
                    '<span class="', entry.isDirectory ? 'folder' : 'file',
                    '">', entry.name, '</span><br>');
              });
              html.push('</div>');
              output(html.join(''));
            }
          });
          break;
        case 'pwd':
          output(cwd_.fullPath);
          break;
        case 'cd':
          var dest = args.join(' ') || '/';

          cwd_.getDirectory(dest, {}, function(dirEntry) {
            cwd_ = dirEntry;
            output('<div>' + dirEntry.fullPath + '</div>');

            // Tell FSN visualizer that we're cd'ing.
            if (fsn_) {
              fsn_.contentWindow.postMessage({cmd: 'cd', data: dest}, location.origin);
            }

          }, function(e) { invalidOpForEntryType_(e, cmd, dest); });

          break;
        case 'mkdir':
          var dashP = false;
          var index = args.indexOf('-p');
          if (index != -1) {
            args.splice(index, 1);
            dashP = true;
          }

          if (!args.length) {
            output('usage: ' + cmd + ' [-p] directory<br>');
            break;
          }

          // Create each directory passed as an argument.
          args.forEach(function(dirName, i) {
            if (dashP) {
              var folders = dirName.split('/');

              // Throw out './' or '/' if present on the beginning of our path.
              if (folders[0] == '.' || folders[0] == '') {
                folders = folders.slice(1);
              }

              createDir_(cwd_, folders);
            } else {
              cwd_.getDirectory(dirName, {create: true, exclusive: true}, function() {
                // Tell FSN visualizer that we're mkdir'ing.
                if (fsn_) {
                  fsn_.contentWindow.postMessage({cmd: 'mkdir', data: dirName}, location.origin);
                }
              }, function(e) { invalidOpForEntryType_(e, cmd, dirName); });
            }
          });
          break;
        case 'cp':
        case 'mv':
          var src = args[0];
          var dest = args[1];

          if (!src || !dest) {
            output(['usage: ', cmd, ' source target<br>',
                   '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', cmd,
                   ' source directory/'].join(''));
            break;
          }

          var runAction = function(cmd, srcDirEntry, destDirEntry, opt_newName) {
            var newName = opt_newName || null;
            if (cmd == 'mv') {
                srcDirEntry.moveTo(destDirEntry, newName);
              } else {
                srcDirEntry.copyTo(destDirEntry, newName);
              }
          };

          // Moving to a folder? (e.g. second arg ends in '/').
          if (dest[dest.length - 1] == '/') {
            cwd_.getDirectory(src, {}, function(srcDirEntry) {
              // Create blacklist for dirs we can't re-create.
              var create = [
                '.', './', '..', '../', '/'].indexOf(dest) != -1 ? false : true;

              cwd_.getDirectory(dest, {create: create}, function(destDirEntry) {
                runAction(cmd, srcDirEntry, destDirEntry);
              }, errorHandler_);
            }, function(e) {
              // Try the src entry as a file instead.
              cwd_.getFile(src, {}, function(srcDirEntry) {
                cwd_.getDirectory(dest, {}, function(destDirEntry) {
                  runAction(cmd, srcDirEntry, destDirEntry);
                }, errorHandler_);
              }, errorHandler_);
            });
          } else { // Treat src/destination as files.
            cwd_.getFile(src, {}, function(srcFileEntry) {
              srcFileEntry.getParent(function(parentDirEntry) {
                runAction(cmd, srcFileEntry, parentDirEntry, dest);
              }, errorHandler_);
            }, errorHandler_);
          }

          break;
        case 'open':
          var fileName = args.join(' ');

          if (!fileName) {
            output('usage: ' + cmd + ' filename');
            break;
          }

          open_(cmd, fileName, function(fileEntry) {
            var myWin = window.open(fileEntry.toURL(), 'mywin');
          });

          break;
        case 'init':
          if (worker_) {
            worker_.postMessage({cmd: 'init', type: type_, size: size_});
          }
          break;
        case 'rm':
          // Remove recursively? If so, remove the flag(s) from the arg list.
          var recursive = false;
          ['-r', '-f', '-rf', '-fr'].forEach(function(arg, i) {
            var index = args.indexOf(arg);
            if (index != -1) {
              args.splice(index, 1);
              recursive = true;
            }
          });

          // Remove each file passed as an argument.
          args.forEach(function(fileName, i) {
            cwd_.getFile(fileName, {}, function(fileEntry) {
              fileEntry.remove(function() {
                // Tell FSN visualizer that we're rm'ing.
                if (fsn_) {
                  fsn_.contentWindow.postMessage({cmd: 'rm', data: fileName}, location.origin);
                }
              }, errorHandler_);
            }, function(e) {
              if (recursive && e.code == FileError.TYPE_MISMATCH_ERR) {
                cwd_.getDirectory(fileName, {}, function(dirEntry) {
                  dirEntry.removeRecursively(null, errorHandler_);
                }, errorHandler_);
              } else if (e.code == FileError.INVALID_STATE_ERR) {
                output(cmd + ': ' + fileName + ': is a directory<br>');
              } else {
                errorHandler_(e);
              }
            });
          });
          break;
        case 'rmdir':
          // Remove each directory passed as an argument.
          args.forEach(function(dirName, i) {
            cwd_.getDirectory(dirName, {}, function(dirEntry) {
              dirEntry.remove(function() {
                // Tell FSN visualizer that we're rmdir'ing.
                if (fsn_) {
                  fsn_.contentWindow.postMessage({cmd: 'rm', data: dirName}, location.origin);
                }
              }, function(e) {
                if (e.code == FileError.INVALID_MODIFICATION_ERR) {
                  output(cmd + ': ' + dirName + ': Directory not empty<br>');
                } else {
                  errorHandler_(e);
                }
              });
            }, function(e) { invalidOpForEntryType_(e, cmd, dirName); });
          });
          break;
        case 'sudo':
          if (timer_ != null) {
            magicWord_.stop();
            clearInterval(timer_);
          }
          if (!magicWord_) {
            magicWord_ = new Sound(true);
            magicWord_.load('magic_word.mp3', false, function() {
              magicWord_.play();
            });
          } else {
            magicWord_.play();
          }
          timer_ = setInterval(function() {
            output("<div>YOU DIDN'T SAY THE MAGIC WORD!</div>");
          }, 100);
          break;
        case 'theme':
          var theme = args.join(' ');
          if (!theme) {
            output(['usage: ', cmd, ' ' + THEMES_.join(',')].join(''));
          } else {
            if (THEMES_.indexOf(theme) != -1) {
              setTheme_(theme);
            } else {
              output('Error - Unrecognized theme used');
            }
          }
          break;
        case 'version':
        case 'ver':
          output(VERSION_);
          break;
        case 'wget':
          var url = args[0];
          if (!url) {
            output(['usage: ', cmd, ' missing URL'].join(''));
            break;
          } else if (url.search('^http://') == -1) {
            url = 'http://' + url;
          }
          var xhr = new XMLHttpRequest();
          xhr.onload = function(e) {
            if (this.status == 200 && this.readyState == 4) {
              output('<textarea>' + this.response + '</textarea>');
            } else {
              output('ERROR: ' + this.status + ' ' + this.statusText);
            }
          };
          xhr.onerror = function(e) {
            output('ERROR: ' + this.status + ' ' + this.statusText);
            output('Could not fetch ' + url);
          };
          xhr.open('GET', url, true);
          xhr.send();
          break;
        case 'who':
          output(document.title +
                 ' - By: Eric Bidelman &lt;ericbidelman@chromium.org&gt;');
          break;
        default:
          if (cmd) {
            output(cmd + ': command not found');
          }
      };

      this.value = ''; // Clear/setup line for next input.
    }
  }

  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function(entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    // If we have 3 or less entries, shorten the output container's height.
    // 15px height with a monospace font-size of ~12px;
    var height = entries.length == 1 ? 'height: ' + (entries.length * 30) + 'px;' :
                 entries.length <= 3 ? 'height: ' + (entries.length * 18) + 'px;' : '';

    // ~12px monospace font yields ~8px screen width.
    var colWidth = maxName.length * 16;//;8;

    return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
  }

  function invalidOpForEntryType_(e, cmd, dest) {
    if (e.code == FileError.NOT_FOUND_ERR) {
      output(cmd + ': ' + dest + ': No such file or directory<br>');
    } else if (e.code == FileError.INVALID_STATE_ERR) {
      output(cmd + ': ' + dest + ': Not a directory<br>');
    } else if (e.code == FileError.INVALID_MODIFICATION_ERR) {
      output(cmd + ': ' + dest + ': File already exists<br>');
    } else {
      errorHandler_(e);
    }
  }

  function errorHandler_(e) {
    var msg = '';
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };
    output('<div>Error: ' + msg + '</div>');
  }

  function createDir_(rootDirEntry, folders, opt_errorCallback) {
    var errorCallback = opt_errorCallback || errorHandler_;

    rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {

      // Recursively add the new subfolder if we still have a subfolder to create.
      if (folders.length) {
        createDir_(dirEntry, folders.slice(1));
      }
    }, errorCallback);
  }

  function open_(cmd, path, successCallback) {
    if (!fs_) {
      return;
    }

    cwd_.getFile(path, {}, successCallback, function(e) {
      if (e.code == FileError.NOT_FOUND_ERR) {
        output(cmd + ': ' + path + ': No such file or directory<br>');
      }
    });
  }

  function read_(cmd, path, successCallback) {
    if (!fs_) {
      return;
    }

    cwd_.getFile(path, {}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
          successCallback(this.result);
        };

        reader.readAsText(file);
      }, errorHandler_);
    }, function(e) {
      if (e.code == FileError.INVALID_STATE_ERR) {
        output(cmd + ': ' + path + ': is a directory<br>');
      } else if (e.code == FileError.NOT_FOUND_ERR) {
        output(cmd + ': ' + path + ': No such file or directory<br>');
      }
    });
  }

  function ls_(successCallback) {
    if (!fs_) {
      return;
    }

    // Read contents of current working directory. According to spec, need to
    // keep calling readEntries() until length of result array is 0. We're
    // guarenteed the same entry won't be returned again.
    var entries = [];
    var reader = cwd_.createReader();

    var readEntries = function() {
      reader.readEntries(function(results) {
        if (!results.length) {
          entries = entries.sort();
          successCallback(entries);
        } else {
          entries = entries.concat(util.toArray(results));
          readEntries();
        }
      }, errorHandler_);
    };

    readEntries();
  }

  function clear_(input) {
    output_.innerHTML = '';
    input.value = '';
    document.documentElement.style.height = '100%';
    interlace_.style.height = '100%';
  }

  function setTheme_(theme) {
    var currentUrl = document.location.pathname;

    if (!theme || theme == 'default') {
      //history.replaceState({}, '', currentUrl);
      localStorage.removeItem('theme');
      document.body.className = '';
      return;
    }

    if (theme) {
      document.body.classList.add(theme);
      localStorage.theme = theme;
      //history.replaceState({}, '', currentUrl + '#theme=' + theme);
    }
  }

  function toggle3DView_() {
    var body = document.body;
    body.classList.toggle('offscreen');

    is3D_ = !is3D_;

    if (body.classList.contains('offscreen')) {

      container_.style.webkitTransform =
          'translateY(' + (util.getDocHeight() - 175) + 'px)';

      var transEnd_ = function(e) {
        var iframe = document.createElement('iframe');
        iframe.id = 'fsn';
        iframe.src = '../fsn/fsn_proto.html';

        fsn_ = body.insertBefore(iframe, body.firstElementChild);

        iframe.contentWindow.onload = function() {
          worker_.postMessage({cmd: 'read', type: type_, size: size_});
        }
        container_.removeEventListener('webkitTransitionEnd', transEnd_, false);
      };
      container_.addEventListener('webkitTransitionEnd', transEnd_, false);
    } else {
      container_.style.webkitTransform = 'translateY(0)';
      body.removeChild(fsn_);
      fsn_ = null;
    }
  }

  function output(html) {
    output_.insertAdjacentHTML('beforeEnd', html);
    //output_.scrollIntoView();
    cmdLine_.scrollIntoView();
  }

  return {
    initFS: function(persistent, size) {
      output('<div>Welcome to ' + document.title +
             '! (v' + VERSION_ + ')</div>');
      output((new Date()).toLocaleString());
      output('<p>Documentation: type "help"</p>');

      if (!!!window.requestFileSystem) {
        output('<div>Sorry! The FileSystem APIs are not available in your browser.</div>');
        return;
      }

      var type = persistent ? window.PERSISTENT : window.TEMPORARY;
      window.requestFileSystem(type, size, function(filesystem) {
        fs_ = filesystem;
        cwd_ = fs_.root;
        type_ = type;
        size_ = size;

        // If we get this far, attempt to create a folder to test if the
        // --unlimited-quota-for-files fag is set.
        cwd_.getDirectory('testquotaforfsfolder', {create: true}, function(dirEntry) {
          dirEntry.remove(function() { // If successfully created, just delete it.
            // noop.
          });
        }, function(e) {
          if (e.code == FileError.QUOTA_EXCEEDED_ERR) {
            output('ERROR: Write access to the FileSystem is unavailable.<br>');
            output('Type "install" or run Chrome with the --unlimited-quota-for-files flag.');
          } else {
            errorHandler_(e);
          }
        });

      }, errorHandler_);
    },
    output: output,
    setTheme: setTheme_,
    getCmdLine: function() { return cmdLine_; },
    addDroppedFiles: function(files) {
      util.toArray(files).forEach(function(file, i) {
        cwd_.getFile(file.name, {create: true, exclusive: true}, function(fileEntry) {

          // Tell FSN visualizer we've added a file.
          if (fsn_) {
            fsn_.contentWindow.postMessage({cmd: 'touch', data: file.name}, location.origin);
          }
          
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(file);
          }, errorHandler_);
        }, errorHandler_);
      });
    },
    toggle3DView: toggle3DView_,
    selectFile: selectFile_
  }
};


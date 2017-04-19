import React, { Component } from 'react'

var audioExtensions = [
  '.3gp',
  '.aa',
  '.aac',
  '.aax',
  '.act',
  '.aiff',
  '.amr',
  '.ape',
  '.au',
  '.awb',
  '.dct',
  '.dss',
  '.dvf',
  '.flac',
  '.gsm',
  '.iklax',
  '.ivs',
  '.m4a',
  '.m4b',
  '.m4p',
  '.mmf',
  '.mp3',
  '.mpc',
  '.msv',
  '.opus',
  '.raw',
  '.sln',
  '.tta',
  '.vox',
  '.wav',
  '.wma',
  '.wv',
  '.ogg',
  '.oga',
  '.mogg',
  '.ra',
  '.rm',
  '.webm'
]

var imageExtensions = [
  '.jpeg',
  '.jpg',
  '.gif',
  '.png',
  '.apng',
  '.svg',
  '.bmp',
  '.ico'
]

class Media extends Component {
  render () {
    return (
      <div>
        Media
      </div>
    )

    if (!opts.media) {
      return ''
    }
    return mediaView = opts.media.map(function (media) {
      var fileIdentifier = media.filename.substring(0, media.filename.lastIndexOf('.'))
      var extension = media.filename.replace(fileIdentifier, '')
      media.description = media.description || ''
      if ((media.type && media.type.includes('audio')) || audioExtensions.indexOf(extension) > -1) {
        return '<audio title="' + media.description + '" controls src="' + opts.corpus.speech.url + '/' + opts.corpus.dbname + '/' + fileIdentifier + '/' + media.filename + '"></audio>'
      } else if ((media.type && media.type.includes('image')) || imageExtensions.indexOf(extension) > -1) {
        var url = opts.corpus.speech.url + '/' + opts.corpus.dbname + '/' + fileIdentifier + '/' + media.filename
        return '<br/><a target="_blank" href="' + url + '"><image title="' + media.description + '" src="' + url + '"/></a>'
      } else {
        console.log('unsupported media', media)
      }
    }).join(' ')
  }
}

Media.propTypes = {}

export default Media

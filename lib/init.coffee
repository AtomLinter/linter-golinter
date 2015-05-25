path = require 'path'

module.exports =
  config:
    executablePath:
      title: 'golint Executable Path'
      description: 'The path where `golint` is located'
      type: 'string'
      default: ''
    extraOptions:
      title: 'Extra Options'
      description: 'Options for `golint` command'
      type: 'string'
      default: '-min_confidence=0.8'
  activate: ->
    console.log 'activate linter-golinter'

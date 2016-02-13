{CompositeDisposable} = require 'atom'

lint = (editor, command, options) ->
  helpers = require('atom-linter')
  regex = '(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s(?<message>.+)'
  file = editor.getPath()

  helpers.exec(command, [options, file], {stream: 'both'}).then (output) ->
    warnings = helpers.parse(output.stdout, regex).map (message) ->
      message.type = 'Warning'
      message
    errors = helpers.parse(output.stderr, regex).map (message) ->
      message.type = 'Error'
      message
    return warnings.concat(errors)

module.exports =
  config:
    executablePath:
      title: 'golint Executable Path'
      description: 'The path to `golint` executable'
      type: 'string'
      default: 'golint'
    extraOptions:
      title: 'Extra Options'
      description: 'Options for `golint` command'
      type: 'string'
      default: '-min_confidence=0.8'

  activate: ->
    require('atom-package-deps').install('linter-golinter')

    linterName = 'linter-golinter'

    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.config.observe "#{linterName}.executablePath",
      (executablePath) => @executablePath = executablePath

    @subscriptions.add atom.config.observe "#{linterName}.extraOptions",
      (extraOptions) => @extraOptions = extraOptions

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    provider =
      grammarScopes: ['source.go']
      scope: 'file'
      lintOnFly: false
      lint: (editor) => lint editor, @executablePath, @extraOptions

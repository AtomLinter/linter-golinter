{BufferedProcess, CompositeDisposable} = require 'atom'

lint = (editor, command, options) ->
  helpers = require('atom-linter')
  regex = '(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s(?<message>.+)'
  file = editor.getPath()

  new Promise (resolve, reject) ->
    stdout = ''
    stderr = ''

    new BufferedProcess
      command: command
      args: [options, file]
      stdout: (data) -> stdout += data
      stderr: (data) -> stderr += data
      exit: ->
        warnings = helpers.parse(stdout, regex).map (message) ->
          message.type = 'warning'
          message

        errors = helpers.parse(stderr, regex).map (message) ->
          message.type = 'error'
          message

        resolve warnings.concat(errors)

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
      lintOnFly: true
      lint: (editor) => lint editor, @executablePath, @extraOptions

{BufferedProcess, CompositeDisposable} = require 'atom'

regex = /(.*):(\d+):(\d+):\s(.*)/

module.exports =
  config:
    executablePath:
      title: 'golint Executable Path'
      description: 'The path where `golint` is located'
      type: 'string'
      default: 'golint'

    extraOptions:
      title: 'Extra Options'
      description: 'Options for `golint` command'
      type: 'string'
      default: '-min_confidence=0.8'

  activate: ->
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.config.observe 'linter-golinter.executablePath',
      (executablePath) =>
        @executablePath = executablePath

    @subscriptions.add atom.config.observe 'linter-golinter.extraOptions',
      (extraOptions) =>
        @extraOptions = extraOptions

  deactivate: ->
    @subscriptions.dispose()

  provideLinter: ->
    provider =
      grammarScopes: ['source.go']
      scope: 'file'
      lintOnFly: false

      lint: (textEditor) =>
        return new Promise (resolve, reject) =>
          filePath = textEditor.getPath()
          errors = []

          process = new BufferedProcess
            command: @executablePath
            args: [@extraOptions, filePath]

            stdout: (data) ->
              matches = data.match regex
              if matches?.length >= 4
                errors.push
                  type: 'warning'
                  text: matches[4]
                  filePath: matches[1]
                  range: [
                    [parseInt(matches[2]) - 1, parseInt(matches[3]) - 1],
                    [parseInt(matches[2]) - 1, parseInt(matches[3])]
                  ]

            exit: (code) ->
              return resolve [] unless code is 0
              resolve errors

          process.onWillThrowError ({error, handle}) =>
            atom.notifications.addError "Failed to run #{@executablePath}!",
              detail: "Please make sure the executable is available on your Path
                or configure the 'golint Executable Path' option.\n
                Detailed error: #{error.message}"
              dismissable: true
            handle()
            resolve []

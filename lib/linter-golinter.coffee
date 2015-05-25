linterPath = atom.packages.getLoadedPackage('linter').path
Linter = require "#{linterPath}/lib/linter"

class LinterGolinter extends Linter
  @syntax: ['source.go']

  defaultCmd: 'golint'

  cmd: null

  errorStream: 'stdout'

  linterName: 'golinter'

  regex: '.+?:(?<line>\\d+):((?<col>\\d+):)?(?<warning>.+)'

  options: ['executablePath', 'extraOptions']

  constructor: (@editor) ->
    super(@editor)

    @cmd = @defaultCmd

    keyPath = "linter-#{@linterName}.extraOptions"

    @extraOptionsListener = atom.config.observe keyPath, =>
      @cmd = "#{@defaultCmd} #{@extraOptions}"

  destroy: ->
    @extraOptionsListener.dispose()

  formatMessage: (match) ->
    match.warning

module.exports = LinterGolinter

# linter-golinter

This plugin for [Linter][linter] provides an interface to the
[golint](https://github.com/golang/lint) tool. It will be used
with files that have the `Go` syntax.

## Installation

```ShellSession
$ apm install linter-golinter
```

## Settings

You can configure linter-golinter inside the Atom settings menu or by editing
your ``~/.atom/config.cson` file (choose Open Your Config in Atom menu):

```CoffeeScript
"linter-golinter":
  "executablePath": "golint" # Path to golint executable.
```

_If the default path resolution of just `golint` is not working for you, you
can use the command `which golint` on UNIX / OS X or `where.exe golint` on
Windows in a terminal / command prompt to print the path to your `golint`
installation. In most cases it should be `$GOPATH/bin/golint`._

[linter]: https://github.com/atom-community/linter

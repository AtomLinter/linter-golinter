# linter-golinter

[![Build Status](https://travis-ci.org/AtomLinter/linter-golinter.svg?branch=master)](https://travis-ci.org/AtomLinter/linter-golinter)

This plugin for [Linter][linter] provides an interface to the
[golint](https://github.com/golang/lint) tool. It will be used
with files that have the `Go` syntax.

## Installation

```ShellSession
$ apm install linter-golinter
```

## Settings

You can configure linter-golinter inside the Atom settings menu or by editing
your `~/.atom/config.cson` file (choose Open Your Config in Atom menu):

```CoffeeScript
"linter-golinter":
  "extraOptions": "-min_confidence=0.8"
```


[linter]: https://github.com/atom-community/linter

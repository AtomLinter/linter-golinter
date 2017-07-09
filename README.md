# linter-golinter

[![Build Status](https://travis-ci.org/AtomLinter/linter-golinter.svg?branch=master)](https://travis-ci.org/AtomLinter/linter-golinter)

This plugin for [Linter][linter] provides an interface to the
[golint](https://github.com/golang/lint) tool. It will be used
with files that have the `Go` syntax.

## Prerequisites

  1. [Install Go](https://golang.org/doc/install) for your system.
  
  2. Install `golint` per the instructions at its [repo](https://github.com/golang/lint).

## Installation

```ShellSession
$ apm install linter-golinter
```

## Settings

You can configure linter-golinter inside the Atom settings menu or by editing
your `~/.atom/config.cson` file (choose Open Your Config in Atom menu):

```CoffeeScript
"linter-golinter":
  "executablePath": "golint" # Path to golint executable.
```

> Tip:
> 
> Add your [`GOPATH`](https://github.com/golang/go/wiki/GOPATH) binaries directory to your `PATH`. If you installed `Go` to the default location, you can use this shell command to add it to your `.bashrc` file:
> 
> ```bash
> printf "\nexport PATH=\$PATH:\$HOME/go/bin\n" >> $HOME/.bashrc
> ```
> 
> This should prevent needing to set the `golint` executable path.

_If the default path resolution of just `golint` is not working for you, you
can try using the command `which golint` on UNIX / macOS or `where.exe golint` on
Windows in a terminal / command prompt to print the path to your `golint`
installation. In most cases it should be `$GOPATH/bin/golint`._

[linter]: https://github.com/atom-community/linter

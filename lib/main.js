'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let helpers = null;
let executablePath;
let extraOptions;

const regex = /(.+):(\d+):(\d+):\s(.+)/g;

const getMessagesFromStd = (std, textEditor, severity) => {
  const messages = [];
  if (std !== null || std !== '') {
    let match = regex.exec(std);
    while (match !== null) {
      console.log(match);
      // Bump line number down 2 instead of 1 due to inserted extra line
      const line = Number.parseInt(match[2], 10) - 1;
      const col = Number.parseInt(match[3], 10) - 1;
      const excerpt = match[4];
      const file = textEditor.getPath();
      const position = helpers.generateRange(textEditor, line, col);

      messages.push({
        excerpt,
        severity,
        location: {
          file,
          position,
        },
      });
      match = regex.exec(std);
    }
  }
  return messages;
};

const lint = (editor, command, options) => {
  if (!helpers) {
    helpers = require('atom-linter');
  }

  const file = editor.getPath();
  const text = editor.getText();

  return helpers.exec(command, [options, file], { stream: 'both' }).then((output) => {
    if (editor.getText() !== text) {
      // Editor contents changed, tell Linter not to update
      return null;
    }

    const messages = getMessagesFromStd(output.stdout, editor, 'warning');
    messages.push(...getMessagesFromStd(output.stderr, editor, 'error'));
    return messages;
  });
};

export default {
  activate() {
    require('atom-package-deps').install('linter-golinter');

    const linterName = 'linter-golinter';

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.config.observe(`${linterName}.executablePath`, (value) => {
        executablePath = value;
      }),
      atom.config.observe(`${linterName}.extraOptions`, (value) => {
        extraOptions = value;
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      grammarScopes: ['source.go'],
      scope: 'file',
      lintsOnChange: false,
      name: 'Golint',
      lint: editor => lint(editor, executablePath, extraOptions),
    };
  },
};

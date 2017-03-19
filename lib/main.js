'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let helpers = null;
let executablePath;
let extraOptions;

const lint = (editor, command, options) => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  const regex = '(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s(?<message>.+)';
  const file = editor.getPath();
  const text = editor.getText();

  return helpers.exec(command, [options, file], { stream: 'both' }).then((output) => {
    if (editor.getText() !== text) {
      // Editor contents changed, tell Linter not to update
      return null;
    }

    const warnings = helpers.parse(output.stdout, regex).map((parsed) => {
      const message = Object.assign({}, parsed);
      const line = message.range[0][0];
      const col = message.range[0][1];
      message.range = helpers.generateRange(editor, line, col);
      message.type = 'Warning';
      return message;
    });

    const errors = helpers.parse(output.stderr, regex).map((parsed) => {
      const message = Object.assign({}, parsed);
      const line = message.range[0][0];
      const col = message.range[0][1];
      message.range = helpers.generateRange(editor, line, col);
      message.type = 'Error';
      return message;
    });

    return warnings.concat(errors);
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
    );

    this.subscriptions.add(
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
      lintOnFly: false,
      name: 'Golint',
      lint: editor => lint(editor, executablePath, extraOptions),
    };
  },
};

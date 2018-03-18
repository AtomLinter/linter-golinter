'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let helpers = null;
let executablePath;
let extraOptions;
let executableValidated;

const exePathValid = (exePath) => {
  const validityCheck = new Promise((resolve, reject) => {
    try {
      const exec = require('child_process').execFile;
      exec(exePath || executablePath, (err) => {
        if (err) return reject(err);
        executableValidated = true;
        return resolve();
      });
    } catch (ex) {
      return reject(ex);
    }
    return null;
  });

  return validityCheck;
};


const getNgoLinter = () => {
  const ngo = require('ngo')();
  const path = require('path');
  const ngoLintPath = path.join(ngo.env.GOBIN, 'golint');

  const setAsNgoPath = () => {
    executablePath = ngoLintPath;
    executableValidated = true;
    return Promise.resolve();
  };

  const ngoPathInvalid = () => {
    const getCmd = ngo(['get', '-u', 'golang.org/x/lint/golint']);
    getCmd.then(setAsNgoPath);
    getCmd.catch(() => Promise.reject(new Error('Unable to get linter')));
    return getCmd;
  };
  return exePathValid(ngoLintPath).then(setAsNgoPath).catch(ngoPathInvalid);
};

const getLinter = () => {
  if (executablePath && executableValidated) return Promise.resolve();
  if (!executablePath) return getNgoLinter();
  return exePathValid().then(Promise.resolve).catch(getNgoLinter);
};

const lint = (editor) => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  const regex = '(?<file>.+):(?<line>\\d+):(?<col>\\d+):\\s(?<message>.+)';
  const file = editor.getPath();
  const text = editor.getText();

  const lintCmd = () => helpers.exec(
    executablePath,
    [extraOptions, file],
    { stream: 'both' },
  );
  return getLinter().then(lintCmd).then((output) => {
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
  }).catch(atom.notifications.addWarning);
};

export default {
  activate() {
    require('atom-package-deps').install('linter-golinter');

    const linterName = 'linter-golinter';

    this.subscriptions = new CompositeDisposable();

    const extraOptionsObserver = atom.config.observe(
      `${linterName}.extraOptions`,
      (value) => { extraOptions = value; },
    );

    this.subscriptions.add(extraOptionsObserver);
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
      lint: editor => lint(editor),
    };
  },
};

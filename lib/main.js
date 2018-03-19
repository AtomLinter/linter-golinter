'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let helpers = null;
let executablePath;
let extraOptions;
let executableValidated;
let retrievingLinter;
let downloadingWarned;

const exePathValid = exePath => new Promise((resolve, reject) => {
  try {
    const exec = require('child_process').execFile;

    exec(exePath || executablePath, (err) => {
      if (err) return reject(err);
      executableValidated = true;
      return resolve();
    });
  } catch (ex) { return reject(ex); }

  return null;
});


const getNgoLinter = () => {
  const ngo = require('ngo')();
  const path = require('path');
  const ngoLintPath = path.join(ngo.env.GOBIN, 'golint');

  const setAsNgoPath = () => {
    executablePath = ngoLintPath;
    executableValidated = true;
    retrievingLinter = false;

    return Promise.resolve();
  };

  const ngoPathInvalid = () => {
    retrievingLinter = true;
    const getCmd = ['get', '-u', 'golang.org/x/lint/golint'];

    return ngo(getCmd).then(() => {
      atom.notifications.addSuccess('`linter-golinter` is ready to use');
      return setAsNgoPath();
    });
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

  if (retrievingLinter) {
    if (downloadingWarned) return Promise.resolve(null);
    
    const infoOpts = {
      dismissable: true,
      icon: 'cloud-download',
      description: [
        'This should only happen after a fresh install or update.',
        'We will let you know once the download is complete and',
        '`linter-golinter` is ready to use.',
      ].join(' '),
    };

    atom.notifications.addInfo('Downloading `golint` binary...', infoOpts);
    downloadingWarned = true;

    return Promise.resolve(null);
  }

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
  }).catch((err = '') => {
    retrievingLinter = false;

    const errorOpts = {
      dismissable: true,
      stack: err.stack || err.message || err,
    };
    atom.notifications.addError('Unable to get golint binary', errorOpts);

    return Promise.resolve(null);
  });
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

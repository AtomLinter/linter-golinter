'use babel';

import * as path from 'path';

const lint = require(path.join('..', 'lib', 'init.coffee')).provideLinter().lint;

const goodPath = path.join(__dirname, 'fixtures', 'good.go');
const errorsPath = path.join(__dirname, 'fixtures', 'errors.go');

describe('The golint provider for Linter', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-golinter');
      return atom.packages.activatePackage('language-go').then(() =>
        atom.workspace.open(goodPath)
      );
    });
  });

  describe('checks a file with issues and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(errorsPath).then((openEditor) => { editor = openEditor; })
      );
    });

    it('finds at least one message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0)
        )
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        const messageText = 'error var unexp should have name of the form errFoo';
        return lint(editor).then((messages) => {
          expect(messages[0].type).toBe('Warning');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].text).toBe(messageText);
          expect(messages[0].filePath).toBe(errorsPath);
          expect(messages[0].range).toEqual([[12, 4], [12, 9]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(0)
        )
      )
    );
  });
});

'use babel';

import * as path from 'path';

const goodPath = path.join(__dirname, 'fixtures', 'good.go');
const errorsPath = path.join(__dirname, 'fixtures', 'errors.go');

describe('The golint provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'init.coffee')).provideLinter().lint;

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
        atom.workspace.open(errorsPath).then(openEditor => { editor = openEditor; })
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
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Warning');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual(messageText);
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+errors\.go$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[12, 4], [12, 83]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toEqual(0)
        )
      )
    );
  });
});

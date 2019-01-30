'use babel';

import * as path from 'path';

const { lint } = require('../lib/main.js').provideLinter();

const goodPath = path.join(__dirname, 'fixtures', 'good.go');
const errorsPath = path.join(__dirname, 'fixtures', 'errors.go');

describe('The golint provider for Linter', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-golinter');
      return atom.packages.activatePackage('language-go').then(() =>
        atom.workspace.open(goodPath));
    });
  });

  describe('checks a file with issues and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(errorsPath).then((openEditor) => { editor = openEditor; }));
    });

    it('finds at least one message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0)));
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        const messageText = 'error var unexp should have name of the form errFoo';
        return lint(editor).then((messages) => {
          expect(messages[0].severity).toBe('warning');
          expect(messages[0].url).not.toBeDefined();
          expect(messages[0].description).not.toBeDefined();
          expect(messages[0].excerpt).toBe(messageText);
          expect(messages[0].location.file).toBe(errorsPath);
          expect(messages[0].location.position).toEqual([[12, 4], [12, 9]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(0))));
  });
});

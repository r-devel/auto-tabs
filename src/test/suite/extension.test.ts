import * as assert from 'assert';
import * as vscode from 'vscode';
import { unexpandText, unexpandLine, UnexpandOptions } from '../../unexpand';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    suite('unexpandLine', () => {
        test('converts leading spaces to tabs', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            // 4 spaces should become 1 tab
            assert.strictEqual(unexpandLine('    hello', options), '\thello');

            // 8 spaces should become 2 tabs
            assert.strictEqual(unexpandLine('        hello', options), '\t\thello');

            // 3 spaces should remain as spaces
            assert.strictEqual(unexpandLine('   hello', options), '   hello');

            // 5 spaces should become 1 tab + 1 space
            assert.strictEqual(unexpandLine('     hello', options), '\t hello');
        });

        test('preserves existing tabs in leading whitespace', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            // Tab + 4 spaces should become 2 tabs
            assert.strictEqual(unexpandLine('\t    hello', options), '\t\thello');

            // Tab + 3 spaces should remain as tab + 3 spaces
            assert.strictEqual(unexpandLine('\t   hello', options), '\t   hello');
        });

        test('does not convert spaces in content when convertAllSpaces is false', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            assert.strictEqual(unexpandLine('    hello    world', options), '\thello    world');
        });

        test('converts all spaces when convertAllSpaces is true', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: true };

            // Should convert spaces everywhere
            assert.strictEqual(unexpandLine('    hello    world', options), '\thello\tworld');

            // Should handle partial space sequences
            assert.strictEqual(unexpandLine('  hello  world', options), '  hello  world');

            // Should convert 8 spaces to 2 tabs
            assert.strictEqual(unexpandLine('        hello', options), '\t\thello');
        });

        test('handles empty and whitespace-only lines', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            assert.strictEqual(unexpandLine('', options), '');
            assert.strictEqual(unexpandLine('    ', options), '\t');
            assert.strictEqual(unexpandLine('   ', options), '   ');
        });

        test('works with different tab sizes', () => {
            const options8: UnexpandOptions = { tabSize: 8, convertAllSpaces: false };
            const options2: UnexpandOptions = { tabSize: 2, convertAllSpaces: false };

            // 8 spaces with tabSize 8
            assert.strictEqual(unexpandLine('        hello', options8), '\thello');

            // 8 spaces with tabSize 2
            assert.strictEqual(unexpandLine('        hello', options2), '\t\t\t\thello');

            // 2 spaces with tabSize 2
            assert.strictEqual(unexpandLine('  hello', options2), '\thello');
        });
    });

    suite('unexpandText', () => {
        test('processes multiple lines', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };
            const input = '    line1\n        line2\n   line3';
            const expected = '\tline1\n\t\tline2\n   line3';

            assert.strictEqual(unexpandText(input, options), expected);
        });

        test('preserves line endings', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };
            const input = '    hello\n    world\n';
            const expected = '\thello\n\tworld\n';

            assert.strictEqual(unexpandText(input, options), expected);
        });

        test('handles single line text', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            assert.strictEqual(unexpandText('    hello', options), '\thello');
        });

        test('handles empty text', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            assert.strictEqual(unexpandText('', options), '');
        });
    });

    suite('edge cases', () => {
        test('handles mixed tabs and spaces correctly', () => {
            const options: UnexpandOptions = { tabSize: 4, convertAllSpaces: false };

            // Tab followed by spaces that complete another tab
            assert.strictEqual(unexpandLine('\t    code', options), '\t\tcode');

            // Multiple tabs and spaces
            assert.strictEqual(unexpandLine('\t\t  code', options), '\t\t  code');
        });

        test('handles very large tab sizes', () => {
            const options: UnexpandOptions = { tabSize: 16, convertAllSpaces: false };
            const sixteenSpaces = '                '; // 16 spaces

            assert.strictEqual(unexpandLine(sixteenSpaces + 'code', options), '\tcode');
        });

        test('handles tab size of 1', () => {
            const options: UnexpandOptions = { tabSize: 1, convertAllSpaces: false };

            assert.strictEqual(unexpandLine(' code', options), '\tcode');
            assert.strictEqual(unexpandLine('  code', options), '\t\tcode');
        });
    });
});
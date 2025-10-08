import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Smart Tab Integration Tests', () => {
    // Note: These tests require extension activation and may need to be run
    // manually in VS Code for full integration testing. For automated testing,
    // we focus on the core unexpand algorithm which is thoroughly tested in extension.test.ts

    suiteSetup(async () => {
        // Ensure extension is activated
        const extension = vscode.extensions.getExtension('r-devel.auto-tabs');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
    });

    test('extension commands are registered', async () => {
        // Test that our commands are available in VS Code
        const commands = await vscode.commands.getCommands();

        assert.ok(commands.includes('auto-tabs.format'),
            'format command should be registered');
        assert.ok(commands.includes('auto-tabs.formatLine'),
            'formatLine command should be registered');
        assert.ok(commands.includes('auto-tabs.smartTab'),
            'smartTab command should be registered');
    });

    test('configuration schema is available', () => {
        const config = vscode.workspace.getConfiguration('autoTabs');

        // Test that configuration options exist
        assert.strictEqual(typeof config.get('convertAllSpaces'), 'boolean');

        // Test default values
        assert.strictEqual(config.get('convertAllSpaces'), false);
    });
});
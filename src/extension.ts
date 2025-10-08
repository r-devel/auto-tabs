import * as vscode from 'vscode';
import { unexpandText, UnexpandOptions } from './unexpand';

// TypeScript-based unexpand implementation
function runUnexpand(text: string): string {
    const autoTabsConfig = vscode.workspace.getConfiguration('autoTabs');
    const convertAllSpaces = autoTabsConfig.get<boolean>('convertAllSpaces', false);
    const editor = vscode.window.activeTextEditor;
    const tabSize = editor?.options.tabSize || 8;

    const options: UnexpandOptions = {
        tabSize: typeof tabSize === 'number' ? tabSize : 8,
        convertAllSpaces
    };

    return unexpandText(text, options);
}

export function activate(context: vscode.ExtensionContext) {
    // Register as document formatter for C files only
    const formatter = vscode.languages.registerDocumentFormattingEditProvider(
        [
            { scheme: 'file', language: 'c' },
        ],
        {
            provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                try {
                    const formattedText = runUnexpand(document.getText());
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    return [vscode.TextEdit.replace(fullRange, formattedText)];
                } catch (error) {
                    throw new Error(`Auto-tabs formatting failed: ${error}`);
                }
            }
        }
    );


    // Register explicit command for manual formatting
    const formatCommand = vscode.commands.registerCommand('auto-tabs.format', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.commands.executeCommand('editor.action.formatDocument');
        }
    });

    // Register command for formatting current line only
    const formatLineCommand = vscode.commands.registerCommand('auto-tabs.formatLine', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const currentLine = document.lineAt(selection.active.line);
        const lineText = currentLine.text;

        try {
            const formattedText = runUnexpand(lineText);
            const lineRange = currentLine.range;

            await editor.edit(editBuilder => {
                editBuilder.replace(lineRange, formattedText.trimEnd());
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Auto-tabs formatting failed: ${error}`);
        }
    });

    // Register smart tab command that indents and formats
    const smartTabCommand = vscode.commands.registerCommand('auto-tabs.smartTab', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const selection = editor.selection;

        // If there's a selection, just do normal tab behavior
        if (!selection.isEmpty) {
            await vscode.commands.executeCommand('tab');
            return;
        }

        const position = selection.active;
        const currentLine = document.lineAt(position.line);
        const lineText = currentLine.text;
        const cursorColumn = position.character;

        // Check if cursor is in leading whitespace or at beginning of line
        const isInLeadingWhitespace = cursorColumn === 0 ||
            lineText.substring(0, cursorColumn).trim() === '';

        if (isInLeadingWhitespace) {
            const indentSize = editor.options.indentSize;
            const tabSize = editor.options.tabSize;
            let spaces = '    '; // Default to 4 spaces
            if (typeof indentSize === "string") {
                if (typeof tabSize !== "string" && tabSize) {
                    spaces = ' '.repeat(tabSize);
                }
            } else if (indentSize) {
                spaces = ' '.repeat(indentSize);
            }

            try {
                // Create the new line content with inserted spaces
                const newLineText = lineText.substring(0, cursorColumn) + spaces + lineText.substring(cursorColumn);

                // Format it with unexpand
                const formattedText = runUnexpand(newLineText);

                // Replace the entire line in a single edit operation
                const lineRange = currentLine.range;

                await editor.edit(editBuilder => {
                    editBuilder.replace(lineRange, formattedText.trimEnd());
                });

                // Position cursor at the end of leading whitespace in the formatted line
                const updatedLine = document.lineAt(position.line);
                let endOfIndentation = 0;

                // Find the end of leading whitespace
                for (let i = 0; i < updatedLine.text.length; i++) {
                    if (updatedLine.text[i] === ' ' || updatedLine.text[i] === '\t') {
                        endOfIndentation = i + 1;
                    } else {
                        break;
                    }
                }

                const newPosition = new vscode.Position(position.line, endOfIndentation);
                editor.selection = new vscode.Selection(newPosition, newPosition);

            } catch (error) {
                vscode.window.showErrorMessage(`Auto-tabs formatting failed: ${error}`);
            }
        } else {
            // Cursor is in middle of line content, do normal tab behavior
            await vscode.commands.executeCommand('tab');
        }
    });

    context.subscriptions.push(formatter, formatCommand, formatLineCommand, smartTabCommand);
}

export function deactivate() {}

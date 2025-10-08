/**
 * TypeScript implementation of the unexpand command
 * Converts sequences of spaces to tabs according to specified tab stops
 */

export interface UnexpandOptions {
    tabSize: number;
    convertAllSpaces: boolean; // true = -a flag (all spaces), false = leading only
}

/**
 * Convert spaces to tabs in a single line
 */
export function unexpandLine(line: string, options: UnexpandOptions): string {
    const { tabSize, convertAllSpaces } = options;

    if (!convertAllSpaces) {
        // Default behavior: only convert leading whitespace
        return unexpandLeadingSpaces(line, tabSize);
    } else {
        // -a flag behavior: convert all space sequences
        return unexpandAllSpaces(line, tabSize);
    }
}

/**
 * Convert spaces to tabs in entire text (multiple lines)
 */
export function unexpandText(text: string, options: UnexpandOptions): string {
    const lines = text.split('\n');
    const processedLines = lines.map(line => unexpandLine(line, options));
    return processedLines.join('\n');
}

/**
 * Convert only leading spaces to tabs (default unexpand behavior)
 */
function unexpandLeadingSpaces(line: string, tabSize: number): string {
    // Find the end of leading whitespace
    let leadingEnd = 0;
    while (leadingEnd < line.length && (line[leadingEnd] === ' ' || line[leadingEnd] === '\t')) {
        leadingEnd++;
    }

    if (leadingEnd === 0) {
        // No leading whitespace
        return line;
    }

    const leadingPart = line.substring(0, leadingEnd);
    const restOfLine = line.substring(leadingEnd);

    // Convert the leading whitespace
    let result = '';
    let spaceCount = 0;

    for (let i = 0; i < leadingPart.length; i++) {
        const char = leadingPart[i];

        if (char === ' ') {
            spaceCount++;
            // When we accumulate enough spaces for a tab, convert them
            if (spaceCount === tabSize) {
                result += '\t';
                spaceCount = 0;
            }
        } else if (char === '\t') {
            // Flush any accumulated spaces, then add the tab
            result += ' '.repeat(spaceCount);
            result += '\t';
            spaceCount = 0;
        }
    }

    // Flush any remaining spaces
    result += ' '.repeat(spaceCount);

    return result + restOfLine;
}

/**
 * Convert all space sequences to tabs (-a flag behavior)
 */
function unexpandAllSpaces(line: string, tabSize: number): string {
    let result = '';
    let spaceCount = 0;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === ' ') {
            spaceCount++;
        } else {
            // Non-space character - flush any accumulated spaces
            if (spaceCount > 0) {
                const tabsToAdd = Math.floor(spaceCount / tabSize);
                const remainingSpaces = spaceCount % tabSize;
                result += '\t'.repeat(tabsToAdd);
                result += ' '.repeat(remainingSpaces);
                spaceCount = 0;
            }
            result += char;
        }
    }

    // Handle spaces at end of line
    if (spaceCount > 0) {
        const tabsToAdd = Math.floor(spaceCount / tabSize);
        const remainingSpaces = spaceCount % tabSize;
        result += '\t'.repeat(tabsToAdd);
        result += ' '.repeat(remainingSpaces);
    }

    return result;
}
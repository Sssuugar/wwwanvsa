const fs = require('fs');
const path = require('path');

const contentDir = path.resolve(__dirname, '../docs/content');
// Regex for **"text"** or **“text”** (bold outside quotes)
// Captures: 1=quote_start, 2=text, 3=quote_end
const pattern = /\*\*([“""])(.+?)([”""])\*\*/g;

const isFixMode = process.argv.includes('--fix');

function scanDir(dir) {
    let hasError = false;
    let fixedCount = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const result = scanDir(fullPath);
            if (result.hasError) hasError = true;
            fixedCount += result.fixedCount;
        } else if (file.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let fileChanged = false;

            // Check for matches
            if (pattern.test(content)) {
                if (isFixMode) {
                    // Replace **“text”** with “**text**”
                    // The regex captures: $1=open quote, $2=text, $3=close quote
                    // We want: $1**$2**$3
                    const newContent = content.replace(pattern, (match, q1, text, q3) => {
                        return `${q1}**${text}**${q3}`;
                    });

                    if (newContent !== content) {
                        fs.writeFileSync(fullPath, newContent, 'utf-8');
                        console.log(`FIXED: ${fullPath}`);
                        fixedCount++;
                        fileChanged = true;
                    }
                } else {
                    // Just report errors
                    let match;
                    // Reset regex lastIndex just in case, though pattern doesn't use lastIndex if not sticky/global loop
                    // But replace uses global. Let's re-match for logging.
                    const reportPattern = /\*\*([“""])(.+?)([”""])\*\*/g;
                    while ((match = reportPattern.exec(content)) !== null) {
                        console.error(`ERROR in ${fullPath}:`);
                        console.error(`  Found improper bold syntax: ${match[0]}`);
                        console.error(`  Should be: ${match[1]}**${match[2]}**${match[3]}`);
                        hasError = true;
                    }
                }
            }
        }
    });

    return { hasError, fixedCount };
}

console.log(`Scanning markdown files... ${isFixMode ? '(Auto-Fix Mode)' : '(Check Mode)'}`);
const result = scanDir(contentDir);

if (isFixMode) {
    console.log(`\nScan complete. Fixed ${result.fixedCount} issues.`);
} else {
    if (result.hasError) {
        console.error('\nFAILED: Found improper bold syntax usage. Run "pnpm fix:md" to auto-fix.');
        process.exit(1);
    } else {
        console.log('PASSED: No bold syntax errors found.');
    }
}

// Test Results Reporter
import fs from 'fs';
import path from 'path';

export function generateTestResultsTable(results) {
    const table = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              📊 API TEST RESULTS                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Test Suite                    │ Test Name                    │ Status │ Time ║
╟──────────────────────────────────────────────────────────────────────────────╢
${results.map(result => {
        const statusIcon = result.status === 'passed' ? '✅' : '❌';
        const statusText = result.status === 'passed' ? 'PASS' : 'FAIL';
        return `║ ${result.suite.padEnd(30)} │ ${result.name.padEnd(30)} │ ${statusText.padEnd(6)} │ ${result.duration}ms ║`;
    }).join('\n')}
╟──────────────────────────────────────────────────────────────────────────────╢
║ Total Tests: ${results.length.toString().padEnd(65)} ║
║ ✅ Passed: ${results.filter(r => r.status === 'passed').length.toString().padEnd(67)} ║
║ ❌ Failed: ${results.filter(r => r.status === 'failed').length.toString().padEnd(67)} ║
║ 📊 Pass Rate: ${((results.filter(r => r.status === 'passed').length / results.length) * 100).toFixed(1)}%${' '.repeat(58)} ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

    // Save to file
    const outputPath = path.join(process.cwd(), 'test-results.txt');
    fs.writeFileSync(outputPath, table);

    // Also log to console
    console.log(table);
    console.log(`\n📄 Test results also saved to: ${outputPath}`);

    return table;
}

export function logTestResult(suite, testName, status, duration, errorMessage = '') {
    const result = {
        suite,
        name: testName,
        status,
        duration,
        error: errorMessage
    };

    console.log(`${status === 'passed' ? '✅' : '❌'} ${suite} › ${testName} (${duration}ms)`);

    if (errorMessage) {
        console.log(`   └─ Error: ${errorMessage}`);
    }

    return result;
} 
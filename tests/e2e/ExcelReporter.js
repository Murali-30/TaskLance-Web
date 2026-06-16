import * as xlsx from 'xlsx';
import path from 'path';

export default class ExcelReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunComplete(contexts, results) {
    const rows = [];
    results.testResults.forEach(testSuite => {
      testSuite.testResults.forEach(testCase => {
        // We replace any null bytes to prevent XML invalid char errors
        const cleanErrors = (testCase.failureMessages.join('\n') || '').replace(/\0/g, '');
        
        rows.push({
          Suite: path.basename(testSuite.testFilePath),
          TestName: testCase.fullName,
          Status: testCase.status,
          DurationMs: testCase.duration || 0,
          Errors: cleanErrors
        });
      });
    });

    if (rows.length === 0) {
      console.log('No test results to write to Excel.');
      return;
    }

    const worksheet = xlsx.utils.json_to_sheet(rows);
    
    // Auto-size columns slightly
    worksheet['!cols'] = [
      { wch: 30 }, // Suite
      { wch: 50 }, // TestName
      { wch: 10 }, // Status
      { wch: 15 }, // DurationMs
      { wch: 80 }  // Errors
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Test Results");

    const outputPath = path.resolve(process.cwd(), 'tests/e2e/artifacts/test-report.xlsx');
    
    // Ensure the artifacts directory exists
    const fs = await import('fs');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    xlsx.writeFile(workbook, outputPath);
    console.log(`\n📊 Excel Test Report generated at: ${outputPath}\n`);
  }
}

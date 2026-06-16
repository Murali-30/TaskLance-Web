import * as xlsx from 'xlsx';
import path from 'path';

export default class ExcelReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  getCategory(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    if (filePath.includes('unit') || filePath.includes('components')) return 'Unit Test';
    if (filename.includes('uiux')) return 'UI/UX Test';
    if (filename.includes('validation')) return 'Validation Test';
    return 'Functional Test';
  }

  async onRunComplete(contexts, results) {
    const detailRows = [];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const stats = {
      'Unit Test': { total: 0, passed: 0, failed: 0 },
      'UI/UX Test': { total: 0, passed: 0, failed: 0 },
      'Validation Test': { total: 0, passed: 0, failed: 0 },
      'Functional Test': { total: 0, passed: 0, failed: 0 }
    };

    results.testResults.forEach(testSuite => {
      const category = this.getCategory(testSuite.testFilePath);
      
      testSuite.testResults.forEach(testCase => {
        const cleanErrors = (testCase.failureMessages.join('\n') || '').replace(/\0/g, '');
        
        // Skip skipped/pending tests if you only want to count ran tests, or count them.
        // We will count passed and failed.
        if (testCase.status === 'passed' || testCase.status === 'failed') {
          totalTests++;
          stats[category].total++;
          
          if (testCase.status === 'passed') {
            passedTests++;
            stats[category].passed++;
          } else {
            failedTests++;
            stats[category].failed++;
          }
        }
        
        detailRows.push({
          Category: category,
          Suite: path.basename(testSuite.testFilePath),
          TestName: testCase.fullName,
          Status: testCase.status,
          DurationMs: testCase.duration || 0,
          Errors: cleanErrors
        });
      });
    });

    if (detailRows.length === 0) {
      console.log('No test results to write to Excel.');
      return;
    }

    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const isDeployable = failedTests === 0 && totalTests > 0 ? "READY FOR DEPLOYMENT ✅" : "REQUIRES FIXES ❌";

    // Summary Sheet Data
    const summaryRows = [
      { Metric: "Total Tests Run", Value: totalTests },
      { Metric: "Passed Tests", Value: passedTests },
      { Metric: "Failed Tests", Value: failedTests },
      { Metric: "Pass Rate", Value: `${passRate}%` },
      { Metric: "Deployable Status", Value: isDeployable },
      {},
      { Metric: "--- BREAKDOWN BY CATEGORY ---", Value: "" },
      { Metric: "Unit Tests", Value: `${stats['Unit Test'].passed}/${stats['Unit Test'].total} Passed` },
      { Metric: "UI/UX Tests", Value: `${stats['UI/UX Test'].passed}/${stats['UI/UX Test'].total} Passed` },
      { Metric: "Validation Tests", Value: `${stats['Validation Test'].passed}/${stats['Validation Test'].total} Passed` },
      { Metric: "Functional Tests", Value: `${stats['Functional Test'].passed}/${stats['Functional Test'].total} Passed` }
    ];

    const summarySheet = xlsx.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];

    const detailSheet = xlsx.utils.json_to_sheet(detailRows);
    detailSheet['!cols'] = [
      { wch: 20 }, // Category
      { wch: 30 }, // Suite
      { wch: 50 }, // TestName
      { wch: 10 }, // Status
      { wch: 15 }, // DurationMs
      { wch: 80 }  // Errors
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, summarySheet, "Summary Report");
    xlsx.utils.book_append_sheet(workbook, detailSheet, "Detailed Results");

    const outputPath = path.resolve(process.cwd(), 'tests/e2e/artifacts/TaskLance_Final_Test_Report.xlsx');
    
    // Ensure the artifacts directory exists
    const fs = await import('fs');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    xlsx.writeFile(workbook, outputPath);
    console.log(`\n📊 Excel Test Report generated at: ${outputPath}\n`);
    console.log(`Deployable Status: ${isDeployable}\n`);
  }
}

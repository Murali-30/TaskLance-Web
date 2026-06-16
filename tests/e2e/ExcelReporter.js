import * as xlsx from 'xlsx';
import path from 'path';

export default class ExcelReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  getCategory(filePath) {
    const filename = path.basename(filePath).toLowerCase();
    if (filePath.includes('unit') || filePath.includes('components') || filename.includes('uiux')) return 'UI-UX & Unit Tests';
    if (filename.includes('validation')) return 'Validation Tests';
    return 'Functional Tests';
  }

  async onRunComplete(contexts, results) {
    const detailRowsByCategory = {
      'UI-UX & Unit Tests': [],
      'Validation Tests': [],
      'Functional Tests': []
    };
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    const stats = {
      'UI-UX & Unit Tests': { total: 0, passed: 0, failed: 0 },
      'Validation Tests': { total: 0, passed: 0, failed: 0 },
      'Functional Tests': { total: 0, passed: 0, failed: 0 }
    };

    results.testResults.forEach(testSuite => {
      const category = this.getCategory(testSuite.testFilePath);
      if (!stats[category]) {
        stats[category] = { total: 0, passed: 0, failed: 0 };
        detailRowsByCategory[category] = [];
      }
      
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
        
        detailRowsByCategory[category].push({
          'Test Case Name': testCase.fullName,
          'Status': testCase.status.toUpperCase(),
          'Duration': `${testCase.duration || 0} ms`
        });
      });
    });

    const hasAnyTest = Object.values(detailRowsByCategory).some(rows => rows.length > 0);
    if (!hasAnyTest) {
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
      { Metric: "UI-UX & Unit Tests", Value: `${stats['UI-UX & Unit Tests'].passed}/${stats['UI-UX & Unit Tests'].total} Passed` },
      { Metric: "Validation Tests", Value: `${stats['Validation Tests'].passed}/${stats['Validation Tests'].total} Passed` },
      { Metric: "Functional Tests", Value: `${stats['Functional Tests'].passed}/${stats['Functional Tests'].total} Passed` }
    ];

    const summarySheet = xlsx.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, summarySheet, "Summary Report");

    // Create a sheet for each category
    for (const [catName, rows] of Object.entries(detailRowsByCategory)) {
      if (rows.length > 0) {
        const sheet = xlsx.utils.json_to_sheet(rows);
        sheet['!cols'] = [
          { wch: 80 }, // Test Case Name
          { wch: 15 }, // Status
          { wch: 15 }  // Duration
        ];
        xlsx.utils.book_append_sheet(workbook, sheet, catName);
      }
    }

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

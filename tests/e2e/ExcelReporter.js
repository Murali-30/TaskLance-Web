import ExcelJS from 'exceljs';
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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TaskLance Tests';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary Report');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    summarySheet.addRows([
      { metric: "Total Tests Run", value: totalTests },
      { metric: "Passed Tests", value: passedTests },
      { metric: "Failed Tests", value: failedTests },
      { metric: "Pass Rate", value: `${passRate}%` },
      { metric: "Deployable Status", value: isDeployable },
      {},
      { metric: "--- BREAKDOWN BY CATEGORY ---", value: "" },
      { metric: "UI-UX & Unit Tests", value: `${stats['UI-UX & Unit Tests'].passed}/${stats['UI-UX & Unit Tests'].total} Passed` },
      { metric: "Validation Tests", value: `${stats['Validation Tests'].passed}/${stats['Validation Tests'].total} Passed` },
      { metric: "Functional Tests", value: `${stats['Functional Tests'].passed}/${stats['Functional Tests'].total} Passed` }
    ]);

    // Create a sheet for each category
    for (const [catName, rows] of Object.entries(detailRowsByCategory)) {
      if (rows.length > 0) {
        const sheet = workbook.addWorksheet(catName);
        sheet.columns = [
          { header: 'Test Case Name', key: 'Test Case Name', width: 80 },
          { header: 'Status', key: 'Status', width: 15 },
          { header: 'Duration', key: 'Duration', width: 15 }
        ];
        sheet.addRows(rows);
      }
    }

    const outputPath = path.resolve(process.cwd(), 'tests/e2e/artifacts/TaskLance_Final_Test_Report.xlsx');
    
    // Ensure the artifacts directory exists
    const fs = await import('fs');
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n📊 Excel Test Report generated at: ${outputPath}\n`);
    console.log(`Deployable Status: ${isDeployable}\n`);
  }
}

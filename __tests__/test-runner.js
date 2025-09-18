/**
 * Comprehensive Test Runner
 * Runs all tests and generates coverage reports
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testFile: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive test suite...\n');
    this.startTime = Date.now();

    const testFiles = [
      'ai-integration.test.ts',
      'llamaindex-integration.test.ts',
      'pydantic-ai-agents.test.ts',
      'langgraph-workflows.test.ts',
      'api-routes.test.ts',
      'db-utils.test.ts',
      'supabase-types.test.ts'
    ];

    for (const testFile of testFiles) {
      await this.runTestFile(testFile);
    }

    this.generateReport();
  }

  private async runTestFile(testFile: string): Promise<void> {
    console.log(`📋 Running ${testFile}...`);
    
    try {
      const startTime = Date.now();
      
      // Run the test file
      const output = execSync(`npx jest __tests__/${testFile} --coverage --verbose`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });

      const duration = Date.now() - startTime;
      
      this.results.push({
        testFile,
        status: 'passed',
        duration,
        coverage: this.extractCoverage(output)
      });

      console.log(`✅ ${testFile} passed (${duration}ms)\n`);
    } catch (error) {
      const duration = Date.now() - Date.now();
      
      this.results.push({
        testFile,
        status: 'failed',
        duration
      });

      console.log(`❌ ${testFile} failed\n`);
      console.error(error);
    }
  }

  private extractCoverage(output: string): any {
    const coverageMatch = output.match(/All files\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)/);
    
    if (coverageMatch) {
      return {
        lines: parseFloat(coverageMatch[1]),
        functions: parseFloat(coverageMatch[2]),
        branches: parseFloat(coverageMatch[3]),
        statements: parseFloat(coverageMatch[4])
      };
    }
    
    return undefined;
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    const totalTests = this.results.length;

    console.log('📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('');

    // Generate detailed report
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        duration: totalDuration
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };

    // Save report to file
    if (!existsSync('test-reports')) {
      mkdirSync('test-reports');
    }

    writeFileSync(
      join('test-reports', 'test-results.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📄 Detailed report saved to test-reports/test-results.json');

    // Generate HTML report
    this.generateHTMLReport(report);
  }

  private generateHTMLReport(report: any): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Results Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0; color: #1976d2; }
        .metric p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; }
        .results { margin-top: 30px; }
        .test-result { 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px; 
            border-left: 5px solid;
        }
        .passed { background: #e8f5e8; border-color: #4caf50; }
        .failed { background: #ffebee; border-color: #f44336; }
        .coverage { margin-top: 20px; }
        .coverage-bar { 
            background: #e0e0e0; 
            height: 20px; 
            border-radius: 10px; 
            overflow: hidden; 
            margin: 5px 0;
        }
        .coverage-fill { 
            height: 100%; 
            background: #4caf50; 
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Results Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p>${report.summary.total}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p style="color: #4caf50;">${report.summary.passed}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p style="color: #f44336;">${report.summary.failed}</p>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <p>${report.summary.duration}ms</p>
        </div>
    </div>

    <div class="results">
        <h2>Test Results</h2>
        ${report.results.map((result: any) => `
            <div class="test-result ${result.status}">
                <h3>${result.testFile}</h3>
                <p>Status: ${result.status.toUpperCase()}</p>
                <p>Duration: ${result.duration}ms</p>
                ${result.coverage ? `
                    <div class="coverage">
                        <h4>Coverage</h4>
                        <div>
                            <label>Lines: ${result.coverage.lines}%</label>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${result.coverage.lines}%"></div>
                            </div>
                        </div>
                        <div>
                            <label>Functions: ${result.coverage.functions}%</label>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${result.coverage.functions}%"></div>
                            </div>
                        </div>
                        <div>
                            <label>Branches: ${result.coverage.branches}%</label>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${result.coverage.branches}%"></div>
                            </div>
                        </div>
                        <div>
                            <label>Statements: ${result.coverage.statements}%</label>
                            <div class="coverage-bar">
                                <div class="coverage-fill" style="width: ${result.coverage.statements}%"></div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    writeFileSync(join('test-reports', 'test-results.html'), html);
    console.log('🌐 HTML report saved to test-reports/test-results.html');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

export default TestRunner;

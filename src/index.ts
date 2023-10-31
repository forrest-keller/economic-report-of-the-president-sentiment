import {createWriteStream, existsSync} from 'fs';
import downloadReports from './download-reports';
import analyzeSentiment from './analyze-sentiment';
import {readdir} from 'fs/promises';
import path from 'path';
import getReportDate from './get-report-date';
import cleanReport from './clean-report';
import * as csv from 'fast-csv';

const REPORTS_DIR = './reports';
const BASE_URL = 'https://fraser.stlouisfed.org';
const REPORTS_URL = `${BASE_URL}/title/economic-report-president-45`;

const main = async () => {
  // Get reports
  if (!existsSync(REPORTS_DIR)) {
    await downloadReports(REPORTS_DIR, BASE_URL, REPORTS_URL);
  }

  // Analyze sentiment
  const reportFileNames = await readdir(REPORTS_DIR);
  const csvStream = csv.format({headers: true});
  const outputFile = createWriteStream('output.csv');
  csvStream.pipe(outputFile);

  for (const reportFileName of reportFileNames) {
    const reportPath = path.join(REPORTS_DIR, reportFileName);
    cleanReport(reportPath, './cleaned');
    const cleanedPath = path.join('./cleaned', reportFileName);
    const sentiment = await analyzeSentiment(cleanedPath);
    csvStream.write({
      year: getReportDate(reportFileName).getFullYear(),
      sentiment,
    });
  }

  csvStream.end();
};

if (require.main === module) {
  main();
}

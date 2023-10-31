import {createWriteStream, existsSync} from 'fs';
import downloadReports from './download-reports';
import analyzeSentiment from './analyze-sentiment';
import {readdir} from 'fs/promises';
import path from 'path';
import getReportDate from './get-report-date';
import cleanReport from './clean-report';
import * as csv from 'fast-csv';

const REPORTS_DIR = './reports';
const CLEANED_DIR = './cleaned';
const RESULT_DIR = './result';
const BASE_URL = 'https://fraser.stlouisfed.org';
const REPORTS_URL = `${BASE_URL}/title/economic-report-president-45`;
const RESULT_FILE_PATH = path.join(RESULT_DIR, 'result.csv');

const main = async () => {
  // Get reports
  if (!existsSync(REPORTS_DIR)) {
    await downloadReports(REPORTS_DIR, BASE_URL, REPORTS_URL);
  }

  // Analyze sentiment
  const reportFileNames = await readdir(REPORTS_DIR);
  const csvStream = csv.format({headers: true});
  const resultFile = createWriteStream(RESULT_FILE_PATH);
  csvStream.pipe(resultFile);

  console.log('Analyzing sentiment...');

  for (let i = 0; i < reportFileNames.length; i++) {
    console.log(
      `Cleaning and analyzing report ${i + 1} of ${reportFileNames.length}...`
    );
    const reportFileName = reportFileNames[i];
    const reportPath = path.join(REPORTS_DIR, reportFileName);
    await cleanReport(reportPath, CLEANED_DIR);
    const cleanedPath = path.join(CLEANED_DIR, reportFileName);
    const sentiment = await analyzeSentiment(cleanedPath);
    csvStream.write({
      year: getReportDate(reportFileName).getFullYear(),
      sentiment,
    });
  }

  csvStream.end();
  console.log('Done!');
};

if (require.main === module) {
  main();
}

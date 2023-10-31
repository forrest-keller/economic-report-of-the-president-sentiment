import * as cheerio from 'cheerio';
import axios from 'axios';
import {mkdir, writeFile} from 'fs/promises';

const downloadReports = async (
  reportsDir: string,
  baseUrl: string,
  reportsUrl: string
) => {
  console.log(`Downloading reports from ${reportsUrl} into ${reportsDir}`);
  const pageRes = await axios.get(reportsUrl);

  if (pageRes.status !== 200) {
    throw new Error(`Failed to download reports from ${reportsUrl}`);
  }

  const page = cheerio.load(pageRes.data);
  const sectionUrls: string[] = [];
  const reportUrls: string[] = [];

  // Get all the sections
  page('.browse-by-jump-to .nav-link').each((i, el) => {
    sectionUrls.push(`${reportsUrl}${page(el).attr('href')}`);
  });

  // For each section, get it's report urls
  for (const sectionUrl of sectionUrls) {
    const sectionRes = await axios.get(sectionUrl);

    if (sectionRes.status !== 200) {
      throw new Error(`Failed to download section from ${sectionUrl}`);
    }

    const section = cheerio.load(sectionRes.data);

    section('.list-item').each((i, el) => {
      reportUrls.push(`${baseUrl}${section(el).attr('href')}`);
    });
  }

  // Finally, download each report locally
  await mkdir(reportsDir, {recursive: true});

  for (let i = 0; i < reportUrls.length; i++) {
    console.log(`Downloading report ${i + 1} of ${reportUrls.length}`);

    const reportUrl = reportUrls[i];
    const reportRes = await axios.get(`${reportUrl}/fulltext`);

    if (reportRes.status !== 200) {
      throw new Error(`Failed to download report from ${reportUrl}`);
    }

    const report = cheerio.load(reportRes.data);
    const content = report('pre').text();
    const filePath = `${reportsDir}/${reportUrl.split('/').pop()}.txt`;
    await writeFile(filePath, content);
  }

  console.log(`Downloaded ${reportUrls.length} reports`);
};

export default downloadReports;

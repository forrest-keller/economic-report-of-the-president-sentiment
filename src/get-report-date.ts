const getReportDate = (reportFileName: string): Date => {
  const month = reportFileName.startsWith('midyear-report') ? 5 : 0;
  const year = reportFileName.split('-').at(-2);

  if (!year) {
    throw new Error('Failed to parse report date');
  }

  return new Date(parseInt(year), month, 1);
};

export default getReportDate;

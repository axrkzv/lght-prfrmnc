const fs = require('fs');

const { runLighthouse } = require('./runLighthouse');
const { buildBarChart } = require('./buildBarChart');

const auditNamesToCollect = [
  'first-contentful-paint',
  'speed-index',
  'largest-contentful-paint',
  'interactive',
  'total-blocking-time',
  'cumulative-layout-shift'
]

const writeReport = (report, reportsDirectory, index) => { 
  const reportFileName = `${reportsDirectory}/lighthouse-report-${index}.html`;
 
  fs.writeFileSync(reportFileName, report);

  console.log(`Report ${reportFileName} has been saved`);
}

const getDataForCurrentIteration = (lhr) => {
  const { audits } = lhr;

  const currentData = auditNamesToCollect.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      [currentValue]: {
        ...audits[currentValue],
      },
    }
  }, {});

  return {
    ...currentData,
    score: lhr.categories.performance.score * 100,
  };
}

const getValues = (data, auditName) => {
  const values = data.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      currentValue[auditName].numericValue,
    ];
  }, []);

  return values;
}

const calcSum = (arr) => arr.reduce((previousValue, currentValue) => previousValue + currentValue);

const handleData = (data) => {
  const firstElement = data[0];

  const hData = auditNamesToCollect.reduce((previousValue, currentValue) => {
    const values = getValues(data, currentValue);

    return {
      ...previousValue,
      [currentValue]: {
        values,
        max: Math.max(...values),
        min: Math.min(...values),
        average: calcSum(values) / values.length,
        unit: firstElement[currentValue].numericUnit,
        title: firstElement[currentValue].title
      },
    }
  }, {});

  const score = data.map(x => x.score);

  return {
    ...hData,
    score,
    scoreAverage: calcSum(score) / score.length,
  };
}

const collectData = async (
  url,
  attempts = 3,
  cookie = [],
  shouldWriteLighthouseReport = false,
  shouldWriteResult = false,
  shouldBuildChart = false) => {

  const dateStr = new Date().toISOString().replace(/:/g, '-');
  const reportsDirectory = `./reports-${dateStr}`;

  if (shouldWriteLighthouseReport || shouldWriteResult || shouldBuildChart) {
    fs.mkdirSync(reportsDirectory);
  }

  const data = [];

  for (let i = 0; i < attempts; i++) {
    const result = await runLighthouse(url, cookie);

    const { lhr } = result;

    console.log('Data is collected for', lhr.finalUrl);
    console.log('Performance score was', lhr.categories.performance.score * 100);

    const currentData = getDataForCurrentIteration(lhr);

    data.push(currentData);

    if (shouldWriteLighthouseReport) {
      const { report } = result;

      writeReport(report, reportsDirectory, i);
    }

    console.log(`Attempt ${i+1} passed`);
  }

  const hData = handleData(data);
  console.log('Result: ', hData);

  if (shouldWriteResult) {
    fs.writeFileSync(`${reportsDirectory}/result.json`, JSON.stringify(hData, null, 4));
    console.log(`Results have been saved to ${reportsDirectory}/result.json`);
  }

  if (shouldBuildChart) {
    const chartFileName = `${reportsDirectory}/barChart.png`;
    await buildBarChart(chartFileName, hData.score, hData.scoreAverage, '', `${url}`, 'Performance');
    console.log(`Chart has been saved to ${chartFileName}`);
  }
}

module.exports = {
  collectData,
}

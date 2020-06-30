const fs = require('fs');
const exporter = require('highcharts-export-server');

const getOptions = (data, average, title, subtitle, yAxisTitle) => ({
  chart: {
    type: 'column'
  },
  title: {
    text: title
  },
  subtitle: {
    text: subtitle
  },
  xAxis: {
    type: 'category',
    labels: {
      rotation: 0,
      style: {
        fontSize: '5px',
        fontFamily: 'Verdana, sans-serif'
      }
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: yAxisTitle
    },
    plotLines: [{
      color: 'red',
      value: average,
      width: '2',
      zIndex: 99,
      label: {
        text: `Average ${average}`,
        style: {
          fontSize: '13px',
          fontFamily: 'Verdana, sans-serif'
        }
      },
      dashStyle: 'dash',
    }]
  },
  legend: {
      enabled: false
  },
  series: [{
    name: 'Performance',
    data,
    dataLabels: {
      enabled: true,
      rotation: -90,
      color: '#FFFFFF',
      align: 'right',
      format: '{point.y:.1f}', // one decimal
      y: 10, // 10 pixels down from the top
      style: {
        fontSize: '8px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
  }]
});

const buildBarChart = (filename, data, average, title, subtitle, yAxisTitle) => {
  const options = getOptions(data.map((x, i) => [++i, x]), average, title, subtitle, yAxisTitle);

  const exportSettings = {
    type: 'png',
    options,
    width: 1920,
  };
  
  exporter.initPool();

  return new Promise(function(resolve, reject) {
    exporter.export(exportSettings, function (err, res) {
      //The export result is now in res.
      //If the output is not PDF or SVG, it will be base64 encoded (res.data).
      //If the output is a PDF or SVG, it will contain a filename (res.filename).
  
      const base64Image = res.data.split(';base64,').pop();
      fs.writeFileSync(filename, base64Image, { encoding: 'base64' },);
  
      exporter.killPool();
      resolve();
    });
  });
}

module.exports = {
  buildBarChart,
}


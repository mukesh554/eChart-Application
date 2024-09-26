import * as echarts from 'echarts';
import { data } from './data';

// Importing data from local Storage

const jsonData = JSON.stringify(data);
localStorage.setItem('userData', jsonData);

const retrievedData = localStorage.getItem('userData');

if (retrievedData) {
  const data = JSON.parse(retrievedData);
}
//class to handle chart data and graph
class ChartManager {
  private chart: echarts.ECharts | null = null;
  private chartData: any[] = data;

  constructor() {
    this.setupUI();
    this.initChart();
  }

  //code to have combo box  and we are filtering out DataTime as it will be x-axis
  setupUI() {
    const select = document.getElementById('dataColumns') as HTMLSelectElement;
    const keys = Object.keys(this.chartData[0]).filter(
      (key) => key !== 'DateTime'
    );
    keys.forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.text = key;
      select.appendChild(option);
    });
    //added button for plot,save Image and interpolation
    //Note save image is also available from graph inbuild feature
    document
      .getElementById('plotButton')
      ?.addEventListener('click', () => this.plotChart());
    // document
    //   .getElementById('saveImage')
    //   ?.addEventListener('click', () => this.saveChartAsImage());
    document
      .getElementById('interpolateButton')
      ?.addEventListener('click', () => this.interpolateData());
  }
  //code to initialize graph area in document
  initChart() {
    const container = document.getElementById('chart-container')!;
    this.chart = echarts.init(container);
  }

  plotChart() {
    const selectedValues = Array.from(
      document.getElementById('dataColumns')?.selectedOptions || []
    ).map((option: HTMLOptionElement) => option.value);
    const series = selectedValues.map((value) => ({
      name: value,
      type: 'line',
      data: this.chartData.map((data) => Number(data[value])), // Convert string to number
      smooth: true, // For smoother lines
    }));

    this.chart?.setOption({
      title: { text: 'Stackable Line Chart' },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
          },
          saveAsImage: {},
        },
      },
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        },
        axisPointer: {
          type: 'cross', // Crosshair type
          crossStyle: {
            color: '#999',
          },
        },
      },

      legend: {
        data: series.map((s) => s.name),
      },
      xAxis: {
        type: 'category',
        data: this.chartData.map((data) => data.DateTime),
      },
      yAxis: { type: 'value' },
      series: series,
    });
  }

  //implemented Interpolation for Time data only. Please select Time from combo box to check interpolation.
  interpolateData() {
    const input = (
      document.getElementById('interpolateInput') as HTMLInputElement
    ).value;
    const xValues = input
      .split(',')
      .map((x) => x.trim())
      .map(Number)
      .filter((x) => !isNaN(x));
    const x = xValues[0];
    this.plotInterpolatedData(this.chartData, x);
  }

  plotInterpolatedData(newChartData: any[], x: number) {
    const xAxisData = newChartData.map((data) => data.DateTime);
    const yAxisData = newChartData.map((data) => data.Time * x);

    const series = [
      {
        name: 'Interpolated Data',
        type: 'line',
        data: yAxisData,
        smooth: true,
        itemStyle: { color: 'red' },
      },
    ];

    this.chart?.setOption({
      xAxis: {
        type: 'category',
        data: xAxisData,
      },
      legend: {
        data: series.map((s) => s.name),
      },
      series: series,
    });
  }

  //   saveChartAsImage() {
  //     const url = this.chart?.getDataURL();
  //     const link = document.createElement('a');
  //     link.href = url!;
  //     link.download = 'chart.png';
  //     link.click();
  //   }
}

// Initialize the Chart data/graph Manager
new ChartManager();

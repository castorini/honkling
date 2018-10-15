class PerformanceDataCollector {
  constructor(type, deferred) {
    this.positive = this.initDataSet();
    this.negative = this.initDataSet();
    this.summary = this.initDataSet();
    this.deferred = deferred;
  }

  initDataSet() {
    return {
      'mfccCompTime' : [],
      'inferenceTime' : [],
      'processingTime' : [],
      'successCount' : 0,
      'totalCount' : 0
    }
  }

  updateDataSet(dataSet, data) {
    if (data['result']) {
        dataSet['successCount']++;
    }
    dataSet['totalCount']++;
    dataSet['mfccCompTime'].push(data['mfccCompTime']);
    dataSet['inferenceTime'].push(data['inferenceTime']);
    dataSet['processingTime'].push(data['processingTime']);
  }

  insert(data) {
    if (data['class'] == 'positive') {
      this.updateDataSet(this.positive, data);
    } else {
      this.updateDataSet(this.negative, data);
    }
    this.updateDataSet(this.summary, data);
  }

  generateReport() {
    this.summaryReport = new PerformanceReport(type, 'summary', this.summary);
    this.summary = undefined;
    this.summaryReport.updateTable();
    this.summaryReport = undefined;

    this.positiveReport = new PerformanceReport(type, 'positive', this.positive);
    this.positive = undefined;
    this.positiveReport.updateTable();
    this.positiveReport = undefined;

    this.negativeReport = new PerformanceReport(type, 'negative', this.negative);
    this.negative = undefined;
    this.negativeReport.updateTable();
    this.negativeReport = undefined;
  }
}

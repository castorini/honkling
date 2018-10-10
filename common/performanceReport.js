class PerformanceReport {
  constructor(type, dataSet, data) {
    this.dataSet = dataSet;
    this.type = type;
    this.data = data;
    this.generateReport();
  }

  getEmptyReport() {
    let report = {};

    report['mfccCompTimeSum'] = 0;
    report['mfccCompTimeAvg'] = 0;
    report['mfccCompTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['mfccCompTimeMax'] = 0;

    report['inferenceTimeSum'] = 0;
    report['inferenceTimeAvg'] = 0;
    report['inferenceTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['inferenceTimeMax'] = 0;

    report['processingTimeSum'] = 0;
    report['processingTimeAvg'] = 0;
    report['processingTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['processingTimeMax'] = 0;

    report['successCount'] = 0;
    report['totalCount'] = 0;
    report['accuracy'] = 0;

    return report;
  }

  generateReport() {
    let report = this.getEmptyReport();

    report['successCount'] = this.data['successCount'];
    report['totalCount'] = this.data['totalCount'];
    report['accuracy'] = report['successCount'] / report['totalCount'];

    for (var i = 0; i < this.data['totalCount']; i++) {
      report['mfccCompTimeSum'] += this.data['mfccCompTime'][i];
      if (this.data['mfccCompTime'][i] < report['mfccCompTimeMin']) {
        report['mfccCompTimeMin'] = this.data['mfccCompTime'][i];
      }
      if (this.data['mfccCompTime'][i] > report['mfccCompTimeMax']) {
        report['mfccCompTimeMax'] = this.data['mfccCompTime'][i];
      }

      report['inferenceTimeSum'] += this.data['inferenceTime'][i];
      if (this.data['inferenceTime'][i] < report['inferenceTimeMin']) {
        report['inferenceTimeMin'] = this.data['inferenceTime'][i];
      }
      if (this.data['inferenceTime'][i] > report['inferenceTimeMax']) {
        report['inferenceTimeMax'] = this.data['inferenceTime'][i];
      }

      report['processingTimeSum'] += this.data['processingTime'][i];
      if (this.data['processingTime'][i] < report['processingTimeMin']) {
        report['processingTimeMin'] = this.data['processingTime'][i];
      }
      if (this.data['processingTime'][i] > report['processingTimeMax']) {
        report['processingTimeMax'] = this.data['processingTime'][i];
      }
    }

    report['mfccCompTimeAvg'] = report['mfccCompTimeSum'] / report['totalCount'];
    report['inferenceTimeAvg'] = report['inferenceTimeSum'] / report['totalCount'];
    report['processingTimeAvg'] = report['processingTimeSum'] / report['totalCount'];

    this.report = report;
  }

  printReport() {
    console.log('reports for ' + this.dataSet + ' - ' + this.type);

    console.log('\tmfccCompTimeSum', this.report['mfccCompTimeSum']);
    console.log('\tmfccCompTimeAvg', this.report['mfccCompTimeAvg']);
    console.log('\tmfccCompTimeMin', this.report['mfccCompTimeMin']);
    console.log('\tmfccCompTimeMax', this.report['mfccCompTimeMax']);

    console.log('\tinferenceTimeSum', this.report['inferenceTimeSum']);
    console.log('\tinferenceTimeAvg', this.report['inferenceTimeAvg']);
    console.log('\tinferenceTimeMin', this.report['inferenceTimeMin']);
    console.log('\tinferenceTimeMax', this.report['inferenceTimeMax']);

    console.log('\tprocessingTimeSum', this.report['processingTimeSum']);
    console.log('\tprocessingTimeAvg', this.report['processingTimeAvg']);
    console.log('\tprocessingTimeMin', this.report['processingTimeMin']);
    console.log('\tprocessingTimeMax', this.report['processingTimeMax']);

    console.log('\tsuccessCount', this.report['successCount']);
    console.log('\ttotalCount', this.report['totalCount']);
    console.log('\taccuracy', this.report['accuracy']);
  }

  updateTable() {
    let table = $('.'+this.type+'Evaluation .' + this.dataSet + 'ReportTable');
    let tableGenerator = new TableGenerator(table);
    tableGenerator.generateTable(this.report);
  }
}

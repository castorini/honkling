class PerformanceReport {
  constructor(type, dataSet, data) {
    this.dataSet = dataSet;
    this.type = type;
    this.data = data;
    sortNumberArray(this.data['mfccCompTime']);
    sortNumberArray(this.data['inferenceTime']);
    sortNumberArray(this.data['processingTime']);
    this.generateReport();
  }

  getEmptyReport() {
    let report = {};

    report['mfccCompTimeSum'] = 0;
    report['mfccCompTimeAvg'] = 0;
    report['mfccCompTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['mfccCompTimeMax'] = 0;
    report['mfccCompTimeP50'] = 0;
    report['mfccCompTimeP90'] = 0;
    report['mfccCompTimeP99'] = 0;

    report['inferenceTimeSum'] = 0;
    report['inferenceTimeAvg'] = 0;
    report['inferenceTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['inferenceTimeMax'] = 0;
    report['inferenceTimeP50'] = 0;
    report['inferenceTimeP90'] = 0;
    report['inferenceTimeP99'] = 0;

    report['processingTimeSum'] = 0;
    report['processingTimeAvg'] = 0;
    report['processingTimeMin'] = Number.MAX_SAFE_INTEGER;
    report['processingTimeMax'] = 0;
    report['processingTimeP50'] = 0;
    report['processingTimeP90'] = 0;
    report['processingTimeP99'] = 0;

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

    report['mfccCompTimeP50'] = percentile(this.data['mfccCompTime'], 0.50);
    report['mfccCompTimeP90'] = percentile(this.data['mfccCompTime'], 0.90);
    report['mfccCompTimeP99'] = percentile(this.data['mfccCompTime'], 0.99);

    report['inferenceTimeP50'] = percentile(this.data['inferenceTime'], 0.50);
    report['inferenceTimeP90'] = percentile(this.data['inferenceTime'], 0.90);
    report['inferenceTimeP99'] = percentile(this.data['inferenceTime'], 0.99);

    report['processingTimeP50'] = percentile(this.data['processingTime'], 0.50);
    report['processingTimeP90'] = percentile(this.data['processingTime'], 0.90);
    report['processingTimeP99'] = percentile(this.data['processingTime'], 0.99);

    this.report = report;
  }

  printReport() {
    console.log('reports for ' + this.dataSet + ' - ' + this.type);

    console.log('\tmfcc Comp Time Sum', this.report['mfccCompTimeSum']);
    console.log('\tmfcc Comp Time Avg', this.report['mfccCompTimeAvg']);
    console.log('\tmfcc Comp Time Min', this.report['mfccCompTimeMin']);
    console.log('\tmfcc Comp Time Max', this.report['mfccCompTimeMax']);
    console.log('\tmfcc Comp Time P50', this.report['mfccCompTimeP50']);
    console.log('\tmfcc Comp Time P90', this.report['mfccCompTimeP90']);
    console.log('\tmfcc Comp Time P99', this.report['mfccCompTimeP99']);
    console.log('\n');

    console.log('\tinference Time Sum', this.report['inferenceTimeSum']);
    console.log('\tinference Time Avg', this.report['inferenceTimeAvg']);
    console.log('\tinference Time Min', this.report['inferenceTimeMin']);
    console.log('\tinference Time Max', this.report['inferenceTimeMax']);
    console.log('\tinference Time P50', this.report['inferenceTimeP50']);
    console.log('\tinference Time P90', this.report['inferenceTimeP90']);
    console.log('\tinference Time P99', this.report['inferenceTimeP99']);
    console.log('\n');

    console.log('\tprocessing Time Sum', this.report['processingTimeSum']);
    console.log('\tprocessing Time Avg', this.report['processingTimeAvg']);
    console.log('\tprocessing Time Min', this.report['processingTimeMin']);
    console.log('\tprocessing Time Max', this.report['processingTimeMax']);
    console.log('\tprocessing Time P50', this.report['processingTimeP50']);
    console.log('\tprocessing Time P90', this.report['processingTimeP90']);
    console.log('\tprocessing Time P99', this.report['processingTimeP99']);
    console.log('\n');

    console.log('\tsuccessCount', this.report['successCount']);
    console.log('\ttotalCount', this.report['totalCount']);
    console.log('\taccuracy', this.report['accuracy']);
    console.log('\n');
  }

  updateTable() {
    let table = $('.'+this.type+'Evaluation .' + this.dataSet + 'ReportTable');
    let tableGenerator = new TableGenerator(table);
    tableGenerator.generateTable(this.report);
  }
}

class TableGenerator {
  constructor(table) {
    this.table = table;
    this.subHeadingTemplate = '<th rowspan="rowCount" scope="rowgroup">heading</th>';
    this.trTemplate = "<tr><th>key</th><td>value</td><td>unit</td></tr>";
  }

  addTableEntry(key, value, unit) {
    let trHtml = this.trTemplate.replace("key", key);
    trHtml = trHtml.replace("value", value);
    trHtml = trHtml.replace("unit", unit);
    if (this.table.find('tr:last')[0]) {
      this.table.find('tr:last').after(trHtml);
    } else {
      this.table.find('tbody').append(trHtml);
    }
  }

  addTableEntryWithHeading(key, value, unit, heading, rowCount) {
    this.addTableEntry(key, value, unit);
    let subHeadingHtml = this.subHeadingTemplate.replace("heading", heading);
    subHeadingHtml = subHeadingHtml.replace("rowCount", rowCount);
    this.table.find('tr:last').prepend(subHeadingHtml);
  }

  formatNumber(num) {
    return numberWithCommas(roundTo(num, 2));
  }

  generateTable(report) {
    this.addTableEntryWithHeading("total count", report["totalCount"], "", "ACCURACY", 3);
    this.addTableEntry("success count", report["successCount"], "");
    this.addTableEntry("accuracy", this.formatNumber(report["accuracy"] * 100, 2), "%");

    this.addTableEntryWithHeading("total mfcc compute time", this.formatNumber(report["mfccCompTimeSum"]/60000, 2), "m", "MFCC COMPUTATION", 4);
    this.addTableEntry("avg mfcc compute time", this.formatNumber(report["mfccCompTimeAvg"], 2), "ms");
    this.addTableEntry("min mfcc compute time", this.formatNumber(report["mfccCompTimeMin"], 2), "ms");
    this.addTableEntry("max mfcc compute time", this.formatNumber(report["mfccCompTimeMax"], 2), "ms");

    this.addTableEntryWithHeading("total inference time", this.formatNumber(report["inferenceTimeSum"]/60000, 2), "m", "INFERENCE", 4);
    this.addTableEntry("avg inference time", this.formatNumber(report["inferenceTimeAvg"], 2), "ms");
    this.addTableEntry("min inference time", this.formatNumber(report["inferenceTimeMin"], 2), "ms");
    this.addTableEntry("max inference time", this.formatNumber(report["inferenceTimeMax"], 2), "ms");

    this.addTableEntryWithHeading("total process time", this.formatNumber(report["processingTimeSum"]/60000, 2), "m", "OVERALL", 4);
    this.addTableEntry("avg process time", this.formatNumber(report["processingTimeAvg"], 2), "ms");
    this.addTableEntry("min process time", this.formatNumber(report["processingTimeMin"], 2), "ms");
    this.addTableEntry("max process time", this.formatNumber(report["processingTimeMax"], 2), "ms");
  }
}

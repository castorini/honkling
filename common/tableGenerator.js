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

    this.addTableEntryWithHeading("TOTAL", this.formatNumber(report["mfccCompTimeSum"]/60000, 2), "m", "MFCC COMPUTATION TIME", 7);
    this.addTableEntry("MAXIMUM", this.formatNumber(report["mfccCompTimeMax"], 2), "ms");
    this.addTableEntry("MINIMUM", this.formatNumber(report["mfccCompTimeMin"], 2), "ms");
    this.addTableEntry("AVERAGE", this.formatNumber(report["mfccCompTimeAvg"], 2), "ms");
    this.addTableEntry("P50", this.formatNumber(report["mfccCompTimeP50"], 2), "ms");
    this.addTableEntry("P90", this.formatNumber(report["mfccCompTimeP90"], 2), "ms");
    this.addTableEntry("P99", this.formatNumber(report["mfccCompTimeP99"], 2), "ms");

    this.addTableEntryWithHeading("TOTAL", this.formatNumber(report["inferenceTimeSum"]/60000, 2), "m", "INFERENCE TIME", 7);
    this.addTableEntry("MAXIMUM", this.formatNumber(report["inferenceTimeMax"], 2), "ms");
    this.addTableEntry("MINIMUM", this.formatNumber(report["inferenceTimeMin"], 2), "ms");
    this.addTableEntry("AVERAGE", this.formatNumber(report["inferenceTimeAvg"], 2), "ms");
    this.addTableEntry("P50", this.formatNumber(report["inferenceTimeP50"], 2), "ms");
    this.addTableEntry("P90", this.formatNumber(report["inferenceTimeP90"], 2), "ms");
    this.addTableEntry("P99", this.formatNumber(report["inferenceTimeP99"], 2), "ms");

    this.addTableEntryWithHeading("TOTAL", this.formatNumber(report["processingTimeSum"]/60000, 2), "m", "OVERALL PROCESS TIME", 7);
    this.addTableEntry("MAXIMUM", this.formatNumber(report["processingTimeMax"], 2), "ms");
    this.addTableEntry("MINIMUM", this.formatNumber(report["processingTimeMin"], 2), "ms");
    this.addTableEntry("AVERAGE", this.formatNumber(report["processingTimeAvg"], 2), "ms");
    this.addTableEntry("P50", this.formatNumber(report["processingTimeP50"], 2), "ms");
    this.addTableEntry("P90", this.formatNumber(report["processingTimeP90"], 2), "ms");
    this.addTableEntry("P99", this.formatNumber(report["processingTimeP99"], 2), "ms");
  }
}

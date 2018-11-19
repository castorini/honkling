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

  generateSection(sectionName, report) {
    let entryKeys = Object.keys(report).sort().reverse();
    for (var i in entryKeys) {
      let key = entryKeys[i];
      if (key == "total") {
        this.addTableEntryWithHeading("total", this.formatNumber(report["total"]/60000, 2), "m", sectionName, entryKeys.length);
      } else {
        this.addTableEntry(key, report[key], "ms");
      }
    }
  }

  generateTable(report) {
    this.addTableEntryWithHeading("total count", report["total_count"], "", "ACCURACY", 3);
    this.addTableEntry("success count", report["success_count"], "");
    this.addTableEntry("accuracy", this.formatNumber(report["accuracy"] * 100, 2), "%");

    this.generateSection("MFCC COMPUTATION TIME", report["mfcc"])
    this.generateSection("INFERENCE TIME", report["inference"])
    this.generateSection("OVERALL PROCESS TIME", report["process"])
  }
}

function isAllZero(data) {
  return data.every(function(elem) {return elem == 0})
}

function printData(name, data) {
  if (data.length == 0) {
    console.log('\t', name, ' has length of 0');
  } else if (this.isAllZero(data)) {
    console.log(name, data);
    console.log('\t', name, ' is all zero array with length ', data.length);
  }
  console.log(name, data);

  if (Array.isArray(data[0])) {
    // 2D array
    var temp = data;
    data = [];

    for (var i = 0; i < temp.length; i++) {
      for (var j = 0; j < temp[i].length; j++) {
        data.push(temp[i][j]);
      }
    }
  }
  const arrMin = arr => Math.min(...arr);
  const arrMax = arr => Math.max(...arr);
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

  console.log('\trange : ( ', arrMin(data), ' ~ ', arrMax(data), ' )');
  console.log('\tmean : ', arrAvg(data))

  var i = 0;
  while (data[i] == 0) {
    i++;
  }
  console.log('\tfirst non zero element : ', i, ' - ', data[i]);

  i = data.length - 1;
  while (data[i] == 0) {
    i--;
  }
  console.log('\tlast non zero element : ', i, ' - ', data[i]);
}

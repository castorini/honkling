class FFT {
  constructor() {
		this.memoizedReversal = {};
		this.memoizedZeroBuffers = {};
  }

  toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  constructComplexArray(signal) {
	  var complexSignal = {};

	  complexSignal.real = signal.real === undefined ? signal.slice() : signal.real.slice();

	  var bufferSize = complexSignal.real.length;

	  if (this.memoizedZeroBuffers[bufferSize] === undefined) {
	    this.memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
	  }

	  complexSignal.imag = this.memoizedZeroBuffers[bufferSize].slice();

	  return complexSignal;
	};

	bitReverseArray(N) {
	  if (this.memoizedReversal[N] === undefined) {
	    var maxBinaryLength = (N - 1).toString(2).length; //get the binary length of the largest index.
	    var templateBinary = '0'.repeat(maxBinaryLength); //create a template binary of that length.
	    var reversed = {};
	    for (var n = 0; n < N; n++) {
	      var currBinary = n.toString(2); //get binary value of current index.

	      //prepend zeros from template to current binary. This makes binary values of all indices have the same length.
	      currBinary = templateBinary.substr(currBinary.length) + currBinary;

	      currBinary = [].concat(this.toConsumableArray(currBinary)).reverse().join(''); //reverse
	      reversed[n] = parseInt(currBinary, 2); //convert to decimal
	    }
	    this.memoizedReversal[N] = reversed; //save
	  }
	  return this.memoizedReversal[N];
	};

	// complex multiplication
	multiply(a, b) {
	  return {
	    'real': a.real * b.real - a.imag * b.imag,
	    'imag': a.real * b.imag + a.imag * b.real
	  };
	};

	// complex addition
	add(a, b) {
	  return {
	    'real': a.real + b.real,
	    'imag': a.imag + b.imag
	  };
	};

	// complex subtraction
	subtract(a, b) {
	  return {
	    'real': a.real - b.real,
	    'imag': a.imag - b.imag
	  };
	};

	// euler's identity e^x = cos(x) + sin(x)
	euler(kn, N) {
	  var x = -2 * Math.PI * kn / N;
	  return { 'real': Math.cos(x), 'imag': Math.sin(x) };
	};

	// complex conjugate
	conj(a) {
	  a.imag *= -1;
	  return a;
	};

	compute(signal) {

	  var complexSignal = {};

	  if (signal.real === undefined || signal.imag === undefined) {
	    complexSignal = this.constructComplexArray(signal);
	  } else {
	    complexSignal.real = signal.real.slice();
	    complexSignal.imag = signal.imag.slice();
	  }

	  var N = complexSignal.real.length;
	  var logN = Math.log2(N);

	  if (Math.round(logN) != logN) throw new Error('Input size must be a power of 2.');

	  if (complexSignal.real.length != complexSignal.imag.length) {
	    throw new Error('Real and imaginary components must have the same length.');
	  }

	  var bitReversedIndices = this.bitReverseArray(N);

	  // sort array
	  var ordered = {
	    'real': [],
	    'imag': []
	  };

	  for (var i = 0; i < N; i++) {
	    ordered.real[bitReversedIndices[i]] = complexSignal.real[i];
	    ordered.imag[bitReversedIndices[i]] = complexSignal.imag[i];
	  }

	  for (var _i = 0; _i < N; _i++) {
	    complexSignal.real[_i] = ordered.real[_i];
	    complexSignal.imag[_i] = ordered.imag[_i];
	  }
	  // iterate over the number of stages
	  for (var n = 1; n <= logN; n++) {
	    var currN = Math.pow(2, n);

	    // find twiddle factors
	    for (var k = 0; k < currN / 2; k++) {
	      var twiddle = this.euler(k, currN);

	      // on each block of FT, implement the butterfly diagram
	      for (var m = 0; m < N / currN; m++) {
	        var currEvenIndex = currN * m + k;
	        var currOddIndex = currN * m + k + currN / 2;

	        var currEvenIndexSample = {
	          'real': complexSignal.real[currEvenIndex],
	          'imag': complexSignal.imag[currEvenIndex]
	        };
	        var currOddIndexSample = {
	          'real': complexSignal.real[currOddIndex],
	          'imag': complexSignal.imag[currOddIndex]
	        };

	        var odd = this.multiply(twiddle, currOddIndexSample);

	        var subtractionResult = this.subtract(currEvenIndexSample, odd);
	        complexSignal.real[currOddIndex] = subtractionResult.real;
	        complexSignal.imag[currOddIndex] = subtractionResult.imag;

	        var additionResult = this.add(odd, currEvenIndexSample);
	        complexSignal.real[currEvenIndex] = additionResult.real;
	        complexSignal.imag[currEvenIndex] = additionResult.imag;
	      }
	    }
	  }

		this.memoizedReversal = {};
		this.memoizedZeroBuffers = {};

	  return complexSignal;
	};

}

if (typeof module !== 'undefined') {
  module.exports = FFT;
}

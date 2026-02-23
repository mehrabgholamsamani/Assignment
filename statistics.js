function getMean(arr) {
  var sum = 0

  for (var i = 0; i < arr.length; i++) {
    sum = sum + arr[i]
  }
  return sum / arr.length
}






function getMedian(arr) {
  var copy = arr.slice().sort(function (a, b) {
    return a - b
  })
  var middle = Math.floor(copy.length / 2)

  if (copy.length % 2 === 0) {
    return (copy[middle - 1] + copy[middle]) / 2
  } else {
    return copy[middle]
  }
}





function getMode(arr) {
  var counts = {}
  var maxCount = 0
  var mode = arr[0]

  for (var i = 0; i < arr.length; i++) {
    var value = arr[i].toFixed(1)
    if (!counts[value]) {
      counts[value] = 0
    }
    counts[value] = counts[value] + 1
    if (counts[value] > maxCount) {
      maxCount = counts[value]
      mode = Number(value)
    }
  }
  return mode
}





function getRange(arr) {
  return getMax(arr) - getMin(arr)
}

function getMin(arr) {
  var min = arr[0]
  for (var i = 1; i < arr.length; i++) {
    if (arr[i]  < min) {
      min = arr[i]
    }
  }
  return min
}

function getMax(arr) {
  var max = arr[0]
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i]
    }
  }
  return max
}

function getStandardDeviation(arr) {
  var mean = getMean(arr)
  var total = 0

  for (var i = 0; i < arr.length; i++) {
    total = total + Math.pow(arr[i] - mean, 2)
  }
  return Math.sqrt(total / arr.length)
}



function getVariance(arr) {
  var mean = getMean(arr)
  var total = 0
  for (var i = 0; i < arr.length; i++) {
    total = total + Math.pow(arr[i] - mean, 2)
  }
  return total / arr.length
}

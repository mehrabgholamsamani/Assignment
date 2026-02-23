var latitude  = 61.4991
var longitude = 23.7871
var timezone = "Europe/Helsinki"

var charts = {
  view1: null,
  view2: null,
  view3: null
}

var labelsMap = {
  temperature_2m: "Temperature",
  rain: "Rain",
  wind_speed_10m: "Wind Speed",
  relative_humidity_2m: "Humidity"
}

var unitsMap = {
  temperature_2m: "°C",
  rain: "mm",
  wind_speed_10m: "km/h",
  relative_humidity_2m: "%"
}

document.addEventListener("DOMContentLoaded", function () {
  setupNavigation()
  setupDefaultDates()
  document.getElementById("view1Load").addEventListener("click", loadView1)
  document.getElementById("view2Timespan").addEventListener("change", function () {
    loadMetricView("view2", "rain", this.value)
  })
  document.getElementById("view3Timespan").addEventListener("change", function () {
    loadMetricView("view3", "wind_speed_10m", this.value)
  })
  loadView1()
  loadMetricView("view2", "rain", "20")
  loadMetricView("view3", "wind_speed_10m", "20")
})

function setupNavigation() {
  var buttons = document.querySelectorAll(".nav-link")
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove("active")
      }
      this.classList.add("active")
      var sections = document.querySelectorAll(".view-section")
      for (var k = 0; k < sections.length; k++) {
        sections[k].classList.remove("active")
      }
      document.getElementById(this.dataset.view).classList.add("active")
    })
  }
}







function setupDefaultDates() {
  var end = new Date()
  var start = new Date()
  start.setDate(end.getDate() - 2)
  document.getElementById("view1Start").value = makeInputDate(start)
  document.getElementById("view1End").value = makeInputDate(end)
}

function makeInputDate(date) {
  var year = date.getFullYear()
  var month = String(date.getMonth() + 1).padStart(2, "0")
  var day = String(date.getDate()).padStart(2, "0")
  return year + "-" + month + "-" + day
}

function formatTimeLabel(value) {
  var date = new Date(value)
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function getApiUrl(metric, startDate, endDate) {
  return "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&hourly=" + metric + "&start_date=" + startDate + "&end_date=" + endDate + "&timezone=" + encodeURIComponent(timezone)
}


async function fetchHourlyData(metric, startDate, endDate) {
  var url = getApiUrl(metric, startDate, endDate)
  var response = await fetch(url)
  var data = await response.json()
  var times = data.hourly.time
  var values = data.hourly[metric]
  var items = []
  for (var i = 0; i < times.length; i++) {
    items.push({
      time: times[i],
      value: values[i]
    })
  }
  return items
}

function getStartDateFromHours(hours) {
  var date = new Date()
  var minusDays  = Math.ceil(hours / 24)
  date.setDate(date.getDate() - minusDays)
  return makeInputDate(date)
}

function getEndDateToday() {
  return makeInputDate(new Date())
}

function getLastItems(items, count) {
  if (items.length <= count) {
    return items
  }
  return items.slice(items.length - count)
}

function getHourlyAverageItems(items, hours) {
  if (hours === 20) {
    return getLastItems(items, 20)
  }
  var selected = getLastItems(items, hours)
  var result = []
  for (var i = 0; i < selected.length; i++) {
    result.push(selected[i])
  }
  return result
}

function buildTable(tableId, items, unit) {
  var body = document.getElementById(tableId)
  body.innerHTML = ""
  for (var i = items.length - 1; i >= 0; i--) {
    var row = document.createElement("tr")
    var timeCell = document.createElement("td")
    var valueCell = document.createElement("td")
    timeCell.textContent = formatTimeLabel(items[i].time)
    valueCell.textContent = Number(items[i].value).toFixed(2) + " " + unit
    row.appendChild(timeCell)
    row.appendChild(valueCell)
    body.appendChild(row)
  }
}

function buildChart(viewKey, canvasId, items, metric) {
  var labels = []
  var values = []
  for (var i = 0; i < items.length; i++) {
    labels.push(formatTimeLabel(items[i].time))
    values.push(items[i].value)
  }
  if (charts[viewKey]) {
    charts[viewKey].destroy()
  }
  charts[viewKey] = new Chart(document.getElementById(canvasId),  {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: labelsMap[metric],
          data: values,
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

function buildStats(elementId, values, unit) {
  var statsBox = document.getElementById(elementId)
  statsBox.innerHTML = ""
  var list = [
    { name: "Mean", value: getMean(values) },
    { name: "Median", value: getMedian(values) },
    { name: "Mode", value: getMode(values) },
    { name: "Range", value: getRange(values) },
    { name: "Std Dev", value: getStandardDeviation(values) },
    { name: "Min", value: getMin(values) },
    { name: "Max", value: getMax(values) },
    { name: "Variance", value: getVariance(values) }
  ]
  for (var i = 0; i < list.length; i++) {
    var card = document.createElement("div")
    card.className = "stat-card"
    var title = document.createElement("h4")
    var value = document.createElement("p")
    title.textContent = list[i].name
    value.textContent = Number(list[i].value).toFixed(2) + " " + unit
    card.appendChild(title)
    card.appendChild(value)
    statsBox.appendChild(card)
  }
}

async function loadView1() {
  var metric = document.getElementById("view1Measurement").value
  var start = document.getElementById("view1Start").value
  var end = document.getElementById("view1End").value

  if (!start || !end) {
    return
  }
  var items = await fetchHourlyData(metric, start, end)
  buildTable("view1Table", items, unitsMap[metric])
  buildChart("view1", "view1Chart", items, metric)
}

async function loadMetricView(viewName, metric, hoursValue) {
  var hours  = Number(hoursValue)
  var start = getStartDateFromHours(hours)
  var end = getEndDateToday()
  var items = await fetchHourlyData(metric, start, end)
  var selected = getHourlyAverageItems(items, hours)
  if (viewName === "view2") {
    buildTable("view2Table", selected, unitsMap[metric])
    buildChart("view2", "view2Chart", selected, metric)
  } else {
    buildTable("view3Table", selected, unitsMap[metric])
    buildChart("view3", "view3Chart", selected, metric)
  }
  var statsItems = await fetchHourlyData(metric, getStartDateFromHours(168), end)
  var statValues = []
  for (var i = 0; i < statsItems.length; i++) {
    statValues.push(statsItems[i].value)
  }
  if (viewName === "view2") {
    buildStats("view2Stats", statValues, unitsMap[metric])
  } else {
    buildStats("view3Stats", statValues, unitsMap[metric])
  }
}

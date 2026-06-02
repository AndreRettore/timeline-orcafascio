const firebaseConfig = {
  apiKey: "AIzaSyBlVrNME8fD1W7a5NhtggQT30Cm1v6mE4U",
  authDomain: "exxata-timeline.firebaseapp.com",
  databaseURL: "https://exxata-timeline-default-rtdb.firebaseio.com",
  projectId: "exxata-timeline",
  storageBucket: "exxata-timeline.appspot.com",
  messagingSenderId: "442283240555",
  appId: "1:442283240555:web:f585d2675d831b3d39552e"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var historyRefs = [
  {
    key: "timeline",
    system: "Timeline",
    ref: database.ref("timeline_historico"),
    tableBodyId: "timelineTableBody",
    countId: "timelineCount"
  },
  {
    key: "orcafasio",
    system: "OrçaFascio",
    ref: database.ref("orcafasio_historico"),
    tableBodyId: "orcafasioTableBody",
    countId: "orcafasioCount"
  }
];
var historyBySystem = {};

function normalizeRecord(system, key, data) {
  return {
    key: key,
    system: system,
    name: data.name || data.name2 || "",
    entryTimestamp: data.entryTimestamp || data.timestamp || data.timestamp2 || "",
    entryTimestampMs: data.entryTimestampMs || 0,
    exitTimestamp: data.exitTimestamp || "",
    status: data.status || (data.exitTimestamp ? "offline" : "online")
  };
}

function getSortValue(record) {
  return record.entryTimestampMs || 0;
}

function formatCount(count) {
  return count === 1 ? "1 registro" : count + " registros";
}

function createEmptyRow(message) {
  var emptyRow = document.createElement("tr");
  var emptyCell = document.createElement("td");
  emptyCell.colSpan = 4;
  emptyCell.className = "empty";
  emptyCell.textContent = message;
  emptyRow.appendChild(emptyCell);

  return emptyRow;
}

function createRecordRow(record) {
  var row = document.createElement("tr");
  var nameCell = document.createElement("td");
  var entryCell = document.createElement("td");
  var exitCell = document.createElement("td");
  var statusCell = document.createElement("td");
  var statusBadge = document.createElement("span");

  nameCell.textContent = record.name || "-";
  entryCell.textContent = record.entryTimestamp || "-";
  exitCell.textContent = record.exitTimestamp || "-";
  statusBadge.textContent = record.status === "online" ? "Online" : "Offline";
  statusBadge.className = "status " + (record.status === "online" ? "status-online" : "status-offline");

  statusCell.appendChild(statusBadge);
  row.appendChild(nameCell);
  row.appendChild(entryCell);
  row.appendChild(exitCell);
  row.appendChild(statusCell);

  return row;
}

function renderTable(historyRef, records) {
  var tableBody = document.getElementById(historyRef.tableBodyId);
  var count = document.getElementById(historyRef.countId);

  tableBody.innerHTML = "";
  count.textContent = formatCount(records.length);

  if (!records.length) {
    tableBody.appendChild(createEmptyRow("Nenhum registro encontrado."));
    return;
  }

  records.forEach(function(record) {
    tableBody.appendChild(createRecordRow(record));
  });
}

function renderHistory() {
  var totalRecords = document.getElementById("totalRecords");
  var onlineRecords = document.getElementById("onlineRecords");
  var lastUpdate = document.getElementById("lastUpdate");
  var records = Object.keys(historyBySystem).reduce(function(allRecords, system) {
    return allRecords.concat(historyBySystem[system]);
  }, []);

  records.sort(function(a, b) {
    return getSortValue(b) - getSortValue(a);
  });

  totalRecords.textContent = records.length;
  onlineRecords.textContent = records.filter(function(record) {
    return record.status === "online";
  }).length;
  lastUpdate.textContent = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  historyRefs.forEach(function(historyRef) {
    var systemRecords = historyBySystem[historyRef.key] || [];
    systemRecords.sort(function(a, b) {
      return getSortValue(b) - getSortValue(a);
    });
    renderTable(historyRef, systemRecords);
  });
}

historyRefs.forEach(function(historyRef) {
  historyRef.ref.on("value", function(snapshot) {
    var records = [];

    snapshot.forEach(function(childSnapshot) {
      records.push(normalizeRecord(historyRef.system, childSnapshot.key, childSnapshot.val() || {}));
    });

    historyBySystem[historyRef.key] = records;
    renderHistory();
  });
});

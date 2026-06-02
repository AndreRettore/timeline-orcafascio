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
var statusPassword = "1234";
var statusAuthStorageKey = "statusOnlineUnlocked";
var historyCacheStorageKey = "statusOnlineHistoryCache";
var historyRefs = [
  {
    key: "timeline",
    system: "Timeline",
    activeRef: database.ref("timeline"),
    ref: database.ref("timeline_historico"),
    tableBodyId: "timelineTableBody",
    countId: "timelineCount"
  },
  {
    key: "orcafasio",
    system: "OrçaFascio",
    activeRef: database.ref("orcafasio"),
    ref: database.ref("orcafasio_historico"),
    tableBodyId: "orcafasioTableBody",
    countId: "orcafasioCount"
  }
];
var historyBySystem = {};
var activeBySystem = {};
var isUnlocked = localStorage.getItem(statusAuthStorageKey) === "true";
var isShowingCachedHistory = false;

function loadHistoryCache() {
  try {
    var cachedHistory = JSON.parse(localStorage.getItem(historyCacheStorageKey));

    if (cachedHistory && cachedHistory.historyBySystem) {
      historyBySystem = cachedHistory.historyBySystem;
      isShowingCachedHistory = true;
    }
  } catch (error) {
    localStorage.removeItem(historyCacheStorageKey);
  }
}

function saveHistoryCache() {
  localStorage.setItem(historyCacheStorageKey, JSON.stringify({
    cachedAt: Date.now(),
    historyBySystem: historyBySystem
  }));
}

loadHistoryCache();

function showStatusPage() {
  isUnlocked = true;
  localStorage.setItem(statusAuthStorageKey, "true");
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("statusPage").classList.remove("hidden");
  renderHistory();
}

function showLoginPage() {
  isUnlocked = false;
  localStorage.removeItem(statusAuthStorageKey);
  document.getElementById("statusPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("passwordInput").value = "";
  document.getElementById("passwordInput").focus();
}

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

function normalizeOnlineRecords(records, activeHistoryId) {
  records.sort(function(a, b) {
    return getSortValue(b) - getSortValue(a);
  });

  return records.map(function(record, index) {
    var normalizedRecord = Object.assign({}, record);
    var newerRecord = index > 0 ? records[index - 1] : null;
    var isOpenRecord = !normalizedRecord.exitTimestamp && normalizedRecord.status === "online";
    var wasReplaced = normalizedRecord.status === "replaced" ||
      (newerRecord && normalizedRecord.exitTimestamp && normalizedRecord.exitTimestamp === newerRecord.entryTimestamp);

    if (isOpenRecord && normalizedRecord.key !== activeHistoryId) {
      normalizedRecord.exitTimestamp = "Substituído";
      wasReplaced = true;
    }

    if (wasReplaced) {
      normalizedRecord.status = "replaced";
      normalizedRecord.wasReplaced = true;
    }

    return normalizedRecord;
  });
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
  if (record.wasReplaced) {
    statusBadge.textContent = "Offline/Substituído";
    statusBadge.className = "status status-replaced";
  } else {
    statusBadge.textContent = record.status === "online" ? "Online" : "Offline";
    statusBadge.className = "status " + (record.status === "online" ? "status-online" : "status-offline");
  }

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
  if (!isUnlocked) {
    return;
  }

  var totalRecords = document.getElementById("totalRecords");
  var onlineRecords = document.getElementById("onlineRecords");
  var lastUpdate = document.getElementById("lastUpdate");
  var records = Object.keys(historyBySystem).reduce(function(allRecords, system) {
    return allRecords.concat(historyBySystem[system]);
  }, []);

  records.sort(function(a, b) {
    return getSortValue(b) - getSortValue(a);
  });

  var recordsBySystem = records.reduce(function(normalizedRecords, record) {
    var systemRecords = normalizedRecords[record.system] || [];
    systemRecords.push(record);
    normalizedRecords[record.system] = systemRecords;
    return normalizedRecords;
  }, {});
  records = historyRefs.reduce(function(allRecords, historyRef) {
    return allRecords.concat(normalizeOnlineRecords(recordsBySystem[historyRef.system] || [], activeBySystem[historyRef.key]));
  }, []);

  totalRecords.textContent = records.length;
  onlineRecords.textContent = records.filter(function(record) {
    return record.status === "online";
  }).length;
  lastUpdate.textContent = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }) + (isShowingCachedHistory ? " (cache)" : "");

  historyRefs.forEach(function(historyRef) {
    var systemRecords = historyBySystem[historyRef.key] || [];
    systemRecords = normalizeOnlineRecords(systemRecords, activeBySystem[historyRef.key]);
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
    isShowingCachedHistory = false;
    saveHistoryCache();
    renderHistory();
  });

  historyRef.activeRef.on("value", function(snapshot) {
    var activeData = snapshot.val();
    activeBySystem[historyRef.key] = activeData && activeData.historyId ? activeData.historyId : null;
    renderHistory();
  });
});

document.getElementById("passwordForm").addEventListener("submit", function(event) {
  event.preventDefault();

  var passwordInput = document.getElementById("passwordInput");
  var loginError = document.getElementById("loginError");

  if (passwordInput.value === statusPassword) {
    loginError.textContent = "";
    showStatusPage();
    return;
  }

  loginError.textContent = "Senha incorreta.";
  passwordInput.value = "";
  passwordInput.focus();
});

document.getElementById("logoutButton").addEventListener("click", function() {
  showLoginPage();
});

if (isUnlocked) {
  showStatusPage();
}

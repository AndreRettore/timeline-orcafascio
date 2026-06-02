// Configurar a conexão com o Firebase 1 (CHAMONE)
const firebaseConfig = {
  apiKey: "AIzaSyBlVrNME8fD1W7a5NhtggQT30Cm1v6mE4U",
  authDomain: "exxata-timeline.firebaseapp.com",
  databaseURL: "https://exxata-timeline-default-rtdb.firebaseio.com",
  projectId: "exxata-timeline",
  storageBucket: "exxata-timeline.appspot.com",
  messagingSenderId: "442283240555",
  appId: "1:442283240555:web:f585d2675d831b3d39552e"
};

// Iniciando o App do firebase

firebase.initializeApp(firebaseConfig, 'app1');
var database = firebase.app('app1').database();

// Referenciar o nó "timeline" no banco de dados
var timelineRef = database.ref("timeline");
var timelineHistoryRef = database.ref("timeline_historico");
var timelineSessionStorageKey = "timelineSessionId";

// Função para registrar a entrada do usuário
function registerEntry(name) {
  var timestamp = new Date().toLocaleString();
  var historyEntry = timelineHistoryRef.push();

  timelineRef.set({
    name: name,
    timestamp: timestamp,
    historyId: historyEntry.key
  });

  historyEntry.set({
    name: name,
    entryTimestamp: timestamp,
    entryTimestampMs: firebase.database.ServerValue.TIMESTAMP,
    exitTimestamp: "",
    exitTimestampMs: null,
    status: "online"
  });

  localStorage.setItem(timelineSessionStorageKey, historyEntry.key);
}

// Função para registrar a saída do usuário
function exitTimeline() {
  timelineRef.once("value", function(snapshot) {
    var data = snapshot.val();
    var timestamp = new Date().toLocaleString();
    var historyId = data && data.historyId ? data.historyId : localStorage.getItem(timelineSessionStorageKey);

    if (historyId) {
      timelineHistoryRef.child(historyId).update({
        exitTimestamp: timestamp,
        exitTimestampMs: firebase.database.ServerValue.TIMESTAMP,
        status: "offline"
      });
    } else if (data) {
      timelineHistoryRef.push({
        name: data.name || "",
        entryTimestamp: data.timestamp || "",
        entryTimestampMs: null,
        exitTimestamp: timestamp,
        exitTimestampMs: firebase.database.ServerValue.TIMESTAMP,
        status: "offline"
      });
    }

    localStorage.removeItem(timelineSessionStorageKey);
    timelineRef.remove();
  });
}

// Função para verificar o status do Timeline
function checkTimelineStatus() {
  timelineRef.on("value", function(snapshot) {
    var data = snapshot.val();
    if (data) {
      displayStatus("Alguém está usando o Timeline.");
      displayLastAccess(data.name, data.timestamp);
    } else {
      displayStatus("Ninguém está usando o Timeline.");
      displayLastAccess("", "");
    }
  });
}

// Função para exibir o status
function displayStatus(status) {
  var statusDiv = document.getElementById("status");
  statusDiv.textContent = status;
}

// Função para exibir o último acesso
function displayLastAccess(name, timestamp) {
  var lastAccessDiv = document.getElementById("lastAccess");
  if (name && timestamp) {
    lastAccessDiv.textContent = "Último acesso: " + timestamp + " por " + name;
  } else {
    lastAccessDiv.textContent = "";
  }
}

// Manipulador de evento para envio do formulário
document.getElementById("entryForm").addEventListener("submit", function(event) {
  event.preventDefault();
  var nameInput = document.getElementById("name");
  var name = nameInput.value;

  registerEntry(name);
  nameInput.value = "";
});



// CONFIGURANDO PARA O ORCAFASCIO




// Configurar a conexão com o Firebase 2

const firebaseConfig2 = {
  apiKey: "AIzaSyBlVrNME8fD1W7a5NhtggQT30Cm1v6mE4U",
  authDomain: "exxata-timeline.firebaseapp.com",
  databaseURL: "https://exxata-timeline-default-rtdb.firebaseio.com",
  projectId: "exxata-timeline",
  storageBucket: "exxata-timeline.appspot.com",
  messagingSenderId: "442283240555",
  appId: "1:442283240555:web:f585d2675d831b3d39552e"
};

// Iniciar o Firebase "App 2" (orçafascio)

firebase.initializeApp(firebaseConfig2, 'app2');
var database2 = firebase.app('app2').database();

// Referenciar o nó "timeline" no banco de dados
var timelineRef2 = database2.ref("orcafasio");
var timelineHistoryRef2 = database2.ref("orcafasio_historico");
var timelineSessionStorageKey2 = "orcafasioSessionId";

// Função para registrar a entrada do usuário
function registerEntry2(name2) {
  var timestamp2 = new Date().toLocaleString();
  var historyEntry2 = timelineHistoryRef2.push();

  timelineRef2.set({
    name2: name2,
    timestamp2: timestamp2,
    historyId: historyEntry2.key
  });

  historyEntry2.set({
    name: name2,
    entryTimestamp: timestamp2,
    entryTimestampMs: firebase.database.ServerValue.TIMESTAMP,
    exitTimestamp: "",
    exitTimestampMs: null,
    status: "online"
  });

  localStorage.setItem(timelineSessionStorageKey2, historyEntry2.key);
}

// Função para registrar a saída do usuário
function exitTimeline2() {
  timelineRef2.once("value", function(snapshot2) {
    var data2 = snapshot2.val();
    var timestamp2 = new Date().toLocaleString();
    var historyId2 = data2 && data2.historyId ? data2.historyId : localStorage.getItem(timelineSessionStorageKey2);

    if (historyId2) {
      timelineHistoryRef2.child(historyId2).update({
        exitTimestamp: timestamp2,
        exitTimestampMs: firebase.database.ServerValue.TIMESTAMP,
        status: "offline"
      });
    } else if (data2) {
      timelineHistoryRef2.push({
        name: data2.name2 || "",
        entryTimestamp: data2.timestamp2 || "",
        entryTimestampMs: null,
        exitTimestamp: timestamp2,
        exitTimestampMs: firebase.database.ServerValue.TIMESTAMP,
        status: "offline"
      });
    }

    localStorage.removeItem(timelineSessionStorageKey2);
    timelineRef2.remove();
  });
}

// Função para verificar o status do Timeline 2
function checkTimelineStatus2() {
  timelineRef2.on("value", function(snapshot2) {
    var data2 = snapshot2.val();
    if (data2) {
      displayStatus2("Alguém está usando o OrçaFascio.");
      displayLastAccess2(data2.name2, data2.timestamp2);
    } else {
      displayStatus2("Ninguém está usando o OrçaFascio.");
      displayLastAccess2("", "");
    }
  });
}

// Função para exibir o status 2
function displayStatus2(status2) {
  var statusDiv2 = document.getElementById("status2");
  statusDiv2.textContent = status2;
}

// Função para exibir o último acesso 2
function displayLastAccess2(name2, timestamp2) {
  var lastAccessDiv2 = document.getElementById("lastAccess2");
  if (name2 && timestamp2) {
    lastAccessDiv2.textContent = "Último acesso: " + timestamp2 + " por " + name2;
  } else {
    lastAccessDiv2.textContent = "";
  }
}

// Manipulador de evento para envio do formulário 2
// consertar essa parte mudar para name2, etc


document.getElementById("entryForm2").addEventListener("submit", function(event) {
  event.preventDefault();
  var nameInput = document.getElementById("name2");
  var name2 = nameInput.value;

  registerEntry2(name2);
  nameInput.value = "";
});

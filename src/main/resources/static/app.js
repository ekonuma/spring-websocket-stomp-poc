const stompClient = new StompJs.Client({
  brokerURL: "ws://localhost:8080/chat",
});

const showGreeting = (message) => {
  $("#messages").append("<tr><td>" + message + "</td></tr>");
};

const changeRoomName = (message) => {
  $("#room").text(`Room: ${message}`);
};

stompClient.onConnect = (frame) => {
  setConnected(true);
  console.log("Connected: " + frame);
  stompClient.subscribe("/topic/messages", (chatMessage) => {
    showGreeting(JSON.parse(chatMessage.body).content);
  });
  stompClient.subscribe("/topic/room", (roomMessage) => {
    changeRoomName(JSON.parse(roomMessage.body).roomName);
  });
};

stompClient.onWebSocketError = (error) => {
  console.error("Error with websocket", error);
};

stompClient.onStompError = (frame) => {
  console.error("Broker reported error: " + frame.headers["message"]);
  console.error("Additional details: " + frame.body);
};

function setConnected(connected) {
  $("#connect").prop("disabled", connected);
  $("#disconnect").prop("disabled", !connected);
  if (connected) {
    $("#conversation").show();
  } else {
    $("#conversation").hide();
  }
  $("#messages").html("");
}

function connect() {
  stompClient.activate();
}

function disconnect() {
  stompClient.deactivate();
  setConnected(false);
  console.log("Disconnected");
}

function sendName() {
  stompClient.publish({
    destination: "/app/send-message",
    body: JSON.stringify({ name: $("#message").val() }),
  });
}

$(function () {
  $("form").on("submit", (e) => e.preventDefault());
  $("#connect").click(() => connect());
  $("#disconnect").click(() => disconnect());
  $("#send").click(() => sendName());
});

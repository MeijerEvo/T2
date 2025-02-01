// T1 Gateway
// Ver 4.0

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var validConnection = 0; //Connection counter
var varning = new Boolean(false);

setInterval(checkConnection, 3000);

function checkConnection()
{
    //Increase connection counter
    validConnection++;

    if (validConnection > 2) {
        //Turn background red
        document.body.style.background = 'red';

        //Send PING
        //websocket.send(0xA);
    }


}


function onload(event) {
    initWebSocket();


}



function initWebSocket() {

    console.log('Trying to open a WebSocket connection…');

    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');

    //Kontrollera om varningen redan visats


}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 500);
}

function onMessage(event) {
    console.log(event.data);

    //Reset connection counter
    validConnection = 0;
    //Turn background white
    document.body.style.background = 'white';

    var myObj = JSON.parse(event.data);
    var keys = Object.keys(myObj);

    for (var i = 0; i < keys.length; i++){
        var key = keys[i];

        //Network
        if (key == "leader") {

            console.log(key);

            //Network. 0 > leader, 0 = Member
            if (myObj[key] > 0)  {
                //Leader
                document.getElementById("networkText").innerHTML = "Nätverk: LEADER";
            } else {
                //Member
                document.getElementById("networkText").innerHTML = "Nätverk: MEMBER";
            }
        }

        //Number of connected clients
        if (key == "clients") {
            document.getElementById("clients").innerHTML = "Anslutna enheter: " + myObj[key] + " st";
        }

        if (key == "varning") {
            //Varna första gången

            if (myObj[key] == 0 && varning == false) {

              varning = true;

                alert("Anslutningen till T2-Gateway lyckades!");

                if (confirm("Tillse att ingen person befinner sig i en potentiell farlig situation när du använder denna applikation. Genom att välja OK godkänner du att du har ett personligt ansvar.")) {
                //OK start program

                } else {
                  //Close websocket
                  websocket.close();

                  //Close window
                  window.close();
                }
          }
        }
   }


}

// T1 Gateway
// Ver 3.0

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var pump = new Boolean(false);
var compressor = new Boolean(false);
var timer = new Boolean(false);
var competition = new Boolean(false); //False = MEMBER, true = COMPETITION
var version = new String();

//Program running flags
var program = new Boolean(false);
var preProgram = new Boolean(false);

var pumpMaxTimer = new Boolean(false);

var progressValue = 0;
var validConnection = 0; //Connection counter

setInterval(checkConnection, 3000);

function checkConnection()
{
    //Increase connection counter
    validConnection++;

    if (validConnection > 2) {
        //Turn background red
        document.body.style.background = 'red';

        //Send PING
        websocket.send(0xA);
    }


}


function onload(event) {
    initWebSocket();
   // fillSelect();

    //Lane checkboxes
    if (localStorage.getItem("lane1") == "true") { document.getElementById('lane1').checked = true;  } else { document.getElementById('lane1').checked = false; }

    if (localStorage.getItem("lane2") == "true") { document.getElementById('lane2').checked = true; } else { document.getElementById('lane2').checked = false; }
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

        //document.getElementById(key).innerHTML = myObj[key];
        //document.getElementById("slider"+ (i+1).toString()).value = myObj[key];

        //Pump upstart counter
        if (key == "pumpUpstart") {
            //Pump button
            if (myObj[key] > 0)  {
                //Pump upstart is ongoing
                pumpUpstart = true;

                //Disable program, front and back button to prevent pump stall
                document.getElementById("frontButton").disabled = true;
                document.getElementById("rearButton").disabled = true;

            } else  {
                pumpUpstart = false;

                //Enable program, front and back button
                document.getElementById("frontButton").disabled = false;
                document.getElementById("rearButton").disabled = false;

             }
        }

        //Pump
        if (key == "pump") {
            //Pump button
            if (myObj[key] > 0)  {
                //Pump is on

                if (pumpMaxTimer == false) {
                    //Set max
                    progressValue = myObj[key];
                    const progress = document.getElementById("pumpRuntime");
                    progress.max = progressValue;//100;

                    pumpMaxTimer = true;
                }

                //Update progress bar
                const progress = document.getElementById("pumpRuntime");
                progress.value = myObj[key];

                pump = true;

                //Upstart in progress?
                if (pumpUpstart == true) {
                    document.getElementById("pumpStartStopButton").value = "UPPSTART PÅGÅR";
                    document.getElementById("pumpStartStopButton").style.backgroundColor = 'Blue';
                } else {
                    document.getElementById("pumpStartStopButton").value = "STOPPA";
                    document.getElementById("pumpStartStopButton").style.backgroundColor = 'Red';
                 }

            } else {
                //Pump is off
                pump = false;
                document.getElementById("pumpStartStopButton").value = "STARTA";
                document.getElementById("pumpStartStopButton").style.backgroundColor = '#32612D';

                pumpMaxTimer = false;

                //Reset progress
                const progress = document.getElementById("pumpRuntime");
                progress.value = 0;

            }
        }





        //Network
        if (key == "competition") {
            //Network. 0 = COMPETITION, > 0 = MEMBER
            if (myObj[key] > 0)  {
                //COMPETITION
                competition = true;
                document.getElementById("network").value = "Aktivera MEMBER";
                document.getElementById("network").style.backgroundColor = 'red';
            } else {
                //MEMBER
                competition = false;
                document.getElementById("network").value = "Aktivera COMPETITION";
                document.getElementById("network").style.backgroundColor = '#32612D';
            }
        }





        //Version
        if (key == "version") {
            //Version
             document.getElementById("versionText").innerHTML = myObj[key];
        }

        //Total turns
        if (key == "totalTurns") {
            //Version
             document.getElementById("totalTurns").innerHTML = "Totalt antal vridningar: " + myObj[key];
        }

    }
}



function pumpStartStop() {
    //Pump
    if (pump == true) { websocket.send("pumpStop"); }
    if (pump == false) { websocket.send("pumpStart"); }
}




function lane1Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false) {
        document.getElementById('lane2').checked = true;
    }

    //Save
    if (document.getElementById('lane1').checked == true) { localStorage.setItem("lane1", "true");} else { localStorage.setItem("lane1", "false");}
    if (document.getElementById('lane2').checked == true) { localStorage.setItem("lane2", "true");} else { localStorage.setItem("lane2", "false");}

}

function lane2Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane2').checked == false && document.getElementById('lane1').checked == false) {
        document.getElementById('lane1').checked = true;
    }

    //Save
    if (document.getElementById('lane1').checked == true) { localStorage.setItem("lane1", "true");} else { localStorage.setItem("lane1", "false");}
    if (document.getElementById('lane2').checked == true) { localStorage.setItem("lane2", "true");} else { localStorage.setItem("lane2", "false");}

}

function front() {
    //Front

     //Check lane boxes
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false)  {
        alert("Du måste välja minst en bana");
    } else {

        //Check if pump is active
        if (pump == false) {
            alert("Starta hydraulpumpen innan vridning av vändställ");
        } else {

            //Check what lanes are activated
            if (document.getElementById('lane1').checked) {
                var lane1 = "1";
            } else {
                var lane1 = "0";
            }

            if (document.getElementById('lane2').checked) {
                var lane2 = "1";
            } else {
                var lane2 = "0";
            }

            websocket.send("front" + lane1 + lane2);
        }
    }
}

function rear() {
    //Rear

     //Check lane boxes
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false)  {
        alert("Du måste välja minst en bana");
    } else {

        //Check if pump is active
        if (pump == false) {
            alert("Starta hydraulpumpen innan vridning av vändställ");
        } else {

            //Check what lanes are activated
            if (document.getElementById('lane1').checked) {
                var lane1 = "1";
            } else {
                var lane1 = "0";
            }

            if (document.getElementById('lane2').checked) {
                var lane2 = "1";
            } else {
                var lane2 = "0";
            }

            websocket.send("rear" + lane1 + lane2);
        }
    }
}

function reset() {
    //Reset
    websocket.send("reset");
}

function network() {
    //Network
    if (competition == false) {
        //Activate COMPETITION
        if (confirm("Vill du aktivera nätverket COMPETITION? Nätverket MEMBER återaktiveras automatiskt efter 24 timmar")) {
            //Activate Leader

            websocket.send("competition");

        } else {
            //User chooses NO
        }

    } else   {
        //Activate MEMBER
         if (confirm("Vill du aktivera nätverket MEMBER?")) {
            //Activate Member

            websocket.send("member");

        } else {
            //User chooses NO
        }

    }

}

function reboot() {
  //Reboot

  if (confirm("Vill du starta om T1-Gateway?")) {

    //Reboot
    websocket.send("reboot");

  } else {
    //User chooses NO
  }

}

function SWUpdate() {
    //SW update

    //Ask user
    if (confirm("Vill du uppdatera mjukvaran i T2 Gateway? Det måste finnas en WIFI-anslutningspunkt med internetanslutning i närheten av T2 Gateway. Efter att ha valt 'OK' kommer T2 Gateway bekräfta genom att tända statusdiod med blått sken. Detta gränssnitt kommer att sluta att svara. Gå sedan till webläsaren och ange '192.168.4.1:100' för att nå uppdateringssidan. Tid för uppdateringen är under 5 minuter.")) {

        //Update
        websocket.send("SWUpdate");

    } else {
        //User chooses NO
    }

}

function intro() {


if (confirm("Vill du spela upp klubbintroduktion?")) {

    //Send sound command
    websocket.send("intro");

    } else {
        //Do nothing
    }
}

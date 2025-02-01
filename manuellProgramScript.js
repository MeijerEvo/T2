// T1 Gateway
// Ver 3.0

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var illum = new Boolean(false);
var pump = new Boolean(false);
var compressor = new Boolean(false);
var timer = new Boolean(false);
var leader = new Boolean(false); //False = Member, true = Leader
var version = new String();

//Program running flags
var program = new Boolean(false);
var preProgram = new Boolean(false);

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
    //fillSelect();
    
    //Check localstorage
    if (localStorage.getItem("numRepeats") == 0) {
        
        //First time
    
        //Update
        document.getElementById("delaySec").value = 0;
        document.getElementById("awaySec").value = 0;
        document.getElementById("frontSec").value = 0;
        document.getElementById("numRepeats").value = 1;

        //Update text
        document.getElementById("delaySecValue").innerHTML = 0;
        document.getElementById("awaySecValue").innerHTML = 0;
        document.getElementById("frontSecValue").innerHTML = 0;
        document.getElementById("numRepeatsValue").innerHTML = 1;
    
    } else { 
        
        //Get from memory
        
        //Update
        document.getElementById("delaySec").value = localStorage.getItem("delaySec");
        document.getElementById("awaySec").value = localStorage.getItem("awaySec");
        document.getElementById("frontSec").value = localStorage.getItem("frontSec");
        document.getElementById("numRepeats").value = localStorage.getItem("numRepeats");

        //Update text
        document.getElementById("delaySecValue").innerHTML = localStorage.getItem("delaySec");
        document.getElementById("awaySecValue").innerHTML = localStorage.getItem("awaySec");
        document.getElementById("frontSecValue").innerHTML = localStorage.getItem("frontSec");
        document.getElementById("numRepeatsValue").innerHTML = localStorage.getItem("numRepeats");
        
    }    
    
    //Lock sliders
    document.getElementById("delaySec").disabled = true;
    document.getElementById("awaySec").disabled = true;
    document.getElementById("frontSec").disabled = true;
    document.getElementById("numRepeats").disabled = true;
    
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



function updateSliderDelaySec(value) {
    var sliderValue = document.getElementById(delaySec.id).value;
    document.getElementById("delaySecValue").innerHTML = sliderValue;
    console.log(sliderValue);
    localStorage.setItem("delaySec", sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderAwaySec(value) {
    var sliderValue = document.getElementById(awaySec.id).value;
    document.getElementById("awaySecValue").innerHTML = sliderValue;
    console.log(sliderValue);
    localStorage.setItem("awaySec", sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderFrontSec(value) {
    var sliderValue = document.getElementById(frontSec.id).value;
    document.getElementById("frontSecValue").innerHTML = sliderValue;
    console.log(sliderValue);
    localStorage.setItem("frontSec", sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderNumRepeats(value) {
    var sliderValue = document.getElementById(numRepeats.id).value;
    document.getElementById("numRepeatsValue").innerHTML = sliderValue;
    console.log(sliderValue);
    localStorage.setItem("numRepeats", sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateTimer(value) {
    var sliderValue = document.getElementById(timerValues.id).value;
    document.getElementById("timerTime").innerHTML = sliderValue;
    console.log(sliderValue);
    
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}
//updateTimer

function updateSlider(element) {
    var sliderNumber = element.id.charAt(element.id.length-1);
    var sliderValue = document.getElementById(element.id).value;
    document.getElementById("sliderValue"+sliderNumber).innerHTML = sliderValue;
    console.log(sliderValue);
    websocket.send(sliderNumber+"s"+sliderValue.toString());
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

        //Program length
        if (key == "programLength") {
            //Sätt max
            progressValue = myObj[key];
            const progress = document.getElementById("programProgress");
            progress.max = progressValue;
        }
        
        
        //Program
        if (key == "programPos") {
            //Program
            if (myObj[key] > 0)  {
                //Program running

                //Increase slider
                const progress = document.getElementById("programProgress");
                progress.value = myObj[key];
        
                
                document.getElementById("programTimerTime").innerHTML = myObj[key];
                
                

                
                
                
                
            
                
                program = true;
                
                document.getElementById("programStartStopButton").value = "STOPPA PROGRAM";
                document.getElementById("programStartStopButton").style.backgroundColor = 'red'; 
                                
                //Disable reset button
                document.getElementById("resetSliders").disabled = true;
                
                //Disable sliders
                document.getElementById(delaySec.id).disabled = true;
                document.getElementById(awaySec.id).disabled = true;
                document.getElementById(frontSec.id).disabled = true;
                document.getElementById(numRepeats.id).disabled = true;
                

                                                 
            } else {
                //Not running
                    
                program = false;
                
                document.getElementById("programTimerTime").innerHTML = 0;
                
                document.getElementById("programStartStopButton").value = "STARTA PROGRAM";
                document.getElementById("programStartStopButton").style.backgroundColor = '#32612D';
                
                //Reset progress bar
                const progress = document.getElementById("programProgress");
                progress.value = 0;
                
                //Enable reset button
                document.getElementById("resetSliders").disabled = false;
                
                //Enable sliders
                if (document.getElementById('sliderLock').checked == false) {
                    document.getElementById(delaySec.id).disabled = false;
                    document.getElementById(awaySec.id).disabled = false;
                    document.getElementById(frontSec.id).disabled = false;
                    document.getElementById(numRepeats.id).disabled = false;
                 }
            }
        } 
        
        //Start program via remote
        if (key == "remote") {
           
            if (myObj[key] == 1) {
                //Activate START/STOP button
                //Only start, not stop
                if (program == false) {  programStartStop() }
            }   
        }
        
        //Pump
        if (key == "pump") {
            //Pump button
            if (myObj[key] > 0)  {
                //Pump is on
                pump = true;
            } else {
                //Pump is off
                pump = false;
            }   
        }
        
 

        
        
        
    }
}

function programStartStop() {
    //Start/Stop program
    
    //Check lane boxes
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false)  { 
        alert("Du måste välja minst en bana");
    } else {
    
        //Check that front and rear value != 0
        if (document.getElementById(awaySec.id).value == 0 || document.getElementById(frontSec.id).value == 0) {
            alert("Värde för BORT och FRAM sekunder får inte vara 0");

         } else {



                if (program == false) {
                  //  if (confirm("Vill du starta programmet? Tillse att ingen person befinner sig i närheten av vändställen. Programmet startar utan fördröjning")) {
                    //OK start program

                    //Add values for "bort", "fram" and "upprepningar"
                    var delaySecValue = document.getElementById(delaySec.id).value;
                    var awaySecValue = document.getElementById(awaySec.id).value;
                    var frontSecValue = document.getElementById(frontSec.id).value;
                    var numRepeatsValue = document.getElementById(numRepeats.id).value;

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

                    //Send message
                     websocket.send("programStart" + lane1 + lane2 + "," + delaySecValue.toString() + "," + awaySecValue.toString() + "," + frontSecValue.toString() + "," + numRepeatsValue.toString());

                  //  } else {
                        //User chooses NO
                  //  }
               } else {
                   //Send message
                     websocket.send("programStop");

               } 
        }
    }
}



function resetSliders() {
    //Update
    document.getElementById("delaySec").value = 0;
    document.getElementById("awaySec").value = 0;
    document.getElementById("frontSec").value = 0;
    document.getElementById("numRepeats").value = 1;
            
    //Update text
    document.getElementById("delaySecValue").innerHTML = 0;
    document.getElementById("awaySecValue").innerHTML = 0;
    document.getElementById("frontSecValue").innerHTML = 0;
    document.getElementById("numRepeatsValue").innerHTML = 1;
    
    //Reset timer value
    document.getElementById("programTimerTime").innerHTML = 0;
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




function sliderLockChecked() {
    
    //Slider lock
     if (document.getElementById('sliderLock').checked == true) {
        //Lock sliders
        document.getElementById("delaySec").disabled = true;
        document.getElementById("awaySec").disabled = true;
        document.getElementById("frontSec").disabled = true;
        document.getElementById("numRepeats").disabled = true;
    } else {
        //Unlock sliders
        document.getElementById("delaySec").disabled = false;
        document.getElementById("awaySec").disabled = false;
        document.getElementById("frontSec").disabled = false;
        document.getElementById("numRepeats").disabled = false;
    }
         
}





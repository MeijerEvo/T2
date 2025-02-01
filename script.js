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
    fillSelect();
    
    //Update
    document.getElementById("delaySec").value = 5;
    document.getElementById("awaySec").value = 0;
    document.getElementById("frontSec").value = 0;
    document.getElementById("numRepeats").value = 1;
            
    //Update text
    document.getElementById("delaySecValue").innerHTML = 5;
    document.getElementById("awaySecValue").innerHTML = 0;
    document.getElementById("frontSecValue").innerHTML = 0;
    document.getElementById("numRepeatsValue").innerHTML = 1;
    
    //Lock sliders
    document.getElementById("delaySec").disabled = true;
    document.getElementById("awaySec").disabled = true;
    document.getElementById("frontSec").disabled = true;
    document.getElementById("numRepeats").disabled = true;
    

    
    //Timer
    document.getElementById("timerTime").innerHTML = 00;
    


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
    
   /* alert("Anslutningen till T1-Gateway lyckades!");
    
     if (confirm("Med denna applikation kommer du att kunna manövrera skjutbanans vändställ. För att undvika skador på annan person har du ett personligt ansvar att tillse att ingen person befinner sig i en potentiell farlig situation när du använder denna applikation. Genom att välja OK godkänner du att du har ett personligt ansvar.")) {
    //OK start program

      
    
  } else {
    //Close websocket
     websocket.close();
      
    //Close window
    window.close();
  }*/
  
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 500);
}



function updateSliderDelaySec(value) {
    var sliderValue = document.getElementById(delaySec.id).value;
    document.getElementById("delaySecValue").innerHTML = sliderValue;
    console.log(sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderAwaySec(value) {
    var sliderValue = document.getElementById(awaySec.id).value;
    document.getElementById("awaySecValue").innerHTML = sliderValue;
    console.log(sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderFrontSec(value) {
    var sliderValue = document.getElementById(frontSec.id).value;
    document.getElementById("frontSecValue").innerHTML = sliderValue;
    console.log(sliderValue);
  //  websocket.send(sliderNumber+"s"+sliderValue.toString());
}

function updateSliderNumRepeats(value) {
    var sliderValue = document.getElementById(numRepeats.id).value;
    document.getElementById("numRepeatsValue").innerHTML = sliderValue;
    console.log(sliderValue);
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
                document.getElementById("programStartStopButton").disabled = true;
            } else  {
                pumpUpstart = false;
                
                //Enable program, front and back button
                document.getElementById("frontButton").disabled = false;
                document.getElementById("rearButton").disabled = false;
                document.getElementById("programStartStopButton").disabled = false;
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
                document.getElementById("pumpStartStopButton").style.backgroundColor = '#F78702'; 
                
                pumpMaxTimer = false;
                
                //Reset progress
                const progress = document.getElementById("pumpRuntime");   
                progress.value = 0;
     
            }
        }  
        
        //Compressor
        /*
        if (key == "compressor") {
            //Compressor button
            if (myObj[key] > 0)  {
                //Compressor is on
                compressor = true;
                document.getElementById("compressorStartStopButton").value = "Stoppa";
                document.getElementById("compressorStartStopButton").style.backgroundColor = 'Red';  
            } else {
                //Compressor is off
                compressor = false;
                document.getElementById("compressorStartStopButton").value = "Starta";
                document.getElementById("compressorStartStopButton").style.backgroundColor = '#4CAF50'; 
            }
        }  */
        
        //Illuminaton
        if (key == "illum") {
            //Illumination button
            if (myObj[key] > 0)  {
                //Illumination is on
                illum = true;
                document.getElementById("illuminationStartStopButton").value = "STOPPA";
                document.getElementById("illuminationStartStopButton").style.backgroundColor = 'Red';  
            } else {
                //Illumination is off
                illum = false;
                document.getElementById("illuminationStartStopButton").value = "STARTA";
                document.getElementById("illuminationStartStopButton").style.backgroundColor = '#F78702'; 
            }
        }  
        
        //Timer
        if (key == "timer") {
            //timer button
            if (myObj[key] > 0)  {
                //Timer is on
                timer = true;
                
                //Set value
                document.getElementById("timerTime").innerHTML = myObj[key];
                
                document.getElementById("timerStartStopButton").value = "STOPPA";
                document.getElementById("timerStartStopButton").style.backgroundColor = 'Red';  
                
                //Disable reset button
                document.getElementById("timerResetButton").disabled = true;
                
            } else {
                if (timer == true) {
                    //Set value
                    document.getElementById("timerTime").innerHTML = 0;
                    
                 
                }   
                
                //Timer is off
                timer = false;
                           
                document.getElementById("timerStartStopButton").value = "STARTA";
                document.getElementById("timerStartStopButton").style.backgroundColor = '#F78702'; 
                
                //Enable reset button
                document.getElementById("timerResetButton").disabled = false;
            }
        }  
        
        //Network
        if (key == "leader") {
            //Network. 0 = leader, > 0 = Member
            if (myObj[key] > 0)  {
                //Leader
                leader = true;
                document.getElementById("network").value = "Aktivera MEMBER";
                document.getElementById("network").style.backgroundColor = 'red'; 
            } else {
                //Member
                leader = false;
                document.getElementById("network").value = "Aktivera LEADER";
                document.getElementById("network").style.backgroundColor = '#F78702';
            }
        }  
        
        //Program
        if (key == "program") {
            //Program
            if (myObj[key] > 0)  {
                //Program running
                
                //Set value to progress bar just first time
                if (program == false) { 
                    progressValue = myObj[key];
                    const progress = document.getElementById("programProgress");
                    progress.max = progressValue;//100;
                    
                  
                   
                }

                //Increase slider
                const progress = document.getElementById("programProgress");
                progress.value = (progressValue - myObj[key]+1);
                
                
                document.getElementById("programTimerTime").innerHTML = (progressValue - myObj[key]+1);
                
                

                
                
                
                
            
                
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
                
               
                
                document.getElementById("programStartStopButton").value = "STARTA PROGRAM";
                document.getElementById("programStartStopButton").style.backgroundColor = '#F78702';
                
                document.getElementById("preProgramExtra").value = "EXTRA";
                document.getElementById("preProgramExtra").style.backgroundColor = '#F78702';
                
                //Reset timer value
                document.getElementById("programTimerTime").innerHTML = 0;
                
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
        
        //Preprogrammed program
        if (key == "preProgram") {
            //Program
            if (myObj[key] > 0)  {
                //Preprogrammed program running
                
                //Set value to progress bar just first time
                if (preProgram == false) { 
                    preProgressValue = myObj[key];
                    const preProgress = document.getElementById("preProgramProgress");
                    preProgress.max = preProgressValue;//100;
                   
                }

                //Increase slider
                const preProgress = document.getElementById("preProgramProgress");
                preProgress.value = (preProgressValue - myObj[key]+1);
                

                
               
                
                //document.getElementById("preProgramTimerTime").innerHTML = (preProgressValue - myObj[key]+1);
            
                
                preProgram = true;
                
                document.getElementById("preProgramStartStopButton").value = "STOPPA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = 'red'; 
                                
                //Disable reset button
               // document.getElementById("preProgramResetSliders").disabled = true;
                
                                                 
            } else {
                //Not running
                    
                preProgram = false;
                
                document.getElementById("preProgramStartStopButton").value = "STARTA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = '#F78702';
                
                document.getElementById("preProgramExtra").value = "EXTRA";
                document.getElementById("preProgramExtra").style.backgroundColor = '#F78702';
                
                //Reset timer value
                document.getElementById("preProgramTimerTime").innerHTML = 0;
                
                
                //Reset progress bar
                const preProgress = document.getElementById("preProgramProgress");
                preProgress.value = 0;
                
               
                
                //Enable reset button
               // document.getElementById("preProgramResetSliders").disabled = false;
                

            }
        }  
        
        //Version
        if (key == "version") {
            //Version       
             document.getElementById("versionText").innerHTML = myObj[key] + ", HTML:3.0, JS:3.0, ST:3.0";
        }  
        
        //Extra button
        if (key == "extraButton") {
        
            if (myObj[key] == 0) {
                //No extra function enabled
                document.getElementById("preProgramExtra").value = "EXTRA";
                
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = '#F78702';
                
                //Reset flag
                fieldFlag = false;
            }
            
            if (myObj[key] == 1) {
                //Fast forward Precsion
                document.getElementById("preProgramExtra").value = "GÅ TILL ELD UPPHÖR";
                           
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = 'Blue';
            }
            
            if (myObj[key] == 2) {
                //Pause Milsnabb
                document.getElementById("preProgramExtra").value = "GÅ TILL PATRON UR OSV";
                           
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = 'Blue';
            }
            
            if (myObj[key] == 3 && fieldFlag == false) {
                //Pause Fält
                if (confirm("Om alla skyttar är klara väljer du OK. Väljer du avbryt så kommer ytterliggare ett skjutkommando 'ALLA KLARA?' att aktiveras")) {
                    //OK continue program
                    websocket.send("playPreProgram");
                    
                    fieldFlag = true;
                   
                  } else {
                    //Play another sound commando "ALLA KLARA?"
                    websocket.send("fieldBackPreProgram");
                      
                    fieldFlag = true;
                }
            }
            
            
        }  
        
        //Timer block
        if (key == "timerBlock") {
            document.getElementById("preProgramTimerTime").innerHTML = myObj[key];
        }
        
        
        
    }
}

function programStartStop() {
    //Start/Stop program
    
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
       // }
    }
}

function preProgramStartStop() {
    //Start/Stop preprogrammed program
    
    choosenProgram = document.getElementById("programs").value;
    
    //Check that a preprogrammed program is choosed
    if (choosenProgram == "Välj program") {
        alert("Du måste välja ett program");
        
     } else {
         

    
            if (preProgram == false) {
             
                //OK start program
                //Check what program
                
                for (var i = 0; i < programsId.length; ++i) {
         
                    //Filter out the program ID 
                    if (programsId[i].name == choosenProgram) {
                        preProgramId = programsId[i].id;
                    }
                }
                

               

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
                 websocket.send("preProgramStart" + lane1 + lane2 + preProgramId);

             
              //  }
           } else {
               //Send message
                 websocket.send("preProgramStop");
           } 
       
    }
}

function resetSliders() {
    //Update
    document.getElementById("delaySec").value = 5;
    document.getElementById("awaySec").value = 0;
    document.getElementById("frontSec").value = 0;
    document.getElementById("numRepeats").value = 1;
            
    //Update text
    document.getElementById("delaySecValue").innerHTML = 5;
    document.getElementById("awaySecValue").innerHTML = 0;
    document.getElementById("frontSecValue").innerHTML = 0;
    document.getElementById("numRepeatsValue").innerHTML = 1;
    
    //Reset timer value
    document.getElementById("programTimerTime").innerHTML = 0;
}

function pumpStartStop() {
    //Pump
    if (pump == true) { websocket.send("pumpStop"); }
    if (pump == false) { websocket.send("pumpStart"); }
}

/*
function compressorStartStop() {
    //Compressor
    if (compressor == true) { websocket.send("compressorStop"); }
    if (compressor == false) { websocket.send("compressorStart"); }
}*/

function illumStartStop() {
    //Illumination
    if (illum == true) { websocket.send("illumStop"); }
    if (illum == false) { websocket.send("illumStart"); }
}

function lane1Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false) {
        document.getElementById('lane2').checked = true;
    }
}

function lane2Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane2').checked == false && document.getElementById('lane1').checked == false) {
        document.getElementById('lane1').checked = true;
    }
}

function front() {
    //Front
    
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

function rear() {
    //Rear
    
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

function reset() {
    //Reset
    websocket.send("reset"); 
}

function network() {
    //Network
    if (leader == false) {
        //Activate LEADER
        if (confirm("Vill du aktivera nätverket LEADER? Nätverket MEMBER återaktiveras automatiskt efter 10 timmar")) {
            //Activate Leader

            websocket.send("leader");
    
        } else {
            //User chooses NO
        }
        
    } else   {
        //Activate Member
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
    
    //Activate LEADER
    if (confirm("Vill du starta om T1-Gateway?")) {
        //Reboot

        websocket.send("reboot");
    
    } else {
            //User chooses NO
    }

}

function timerStartStop() {
    //Timer
    //Check value
     var timerValue = document.getElementById(timerTime.id).textContent;
   
    if (timerValue != 0) {
        //Valid value
        if (timer == false) { websocket.send("timerStart" + timerValue.toString()); }
    }
    
    if (timer == true) { 
        websocket.send("timerStop"); 
        
        //Set value
        document.getElementById("timerTime").innerHTML = 0;
    
    }
}

function timerReset() {
    //Reset
    document.getElementById("timerTime").innerHTML = 0;
}

function readPrograms() {
    

  let reader = new FileReader();
          let fileReader = new FileReader(); 
        fileReader.readAsText(file); 

  reader.readAsText('programs.txt');

  reader.onload = function() {
    console.log(reader.result);
  };

}

function updateProgramList(selectValue) {
    
    let table1 = document.getElementById('programsTable');
   // let table2 = document.getElementById('programsLog');
    
    table1.innerHTML = "";
    //table2.innerHTML = "";
    
    //Update program list
    for (var i = 0; i < programs.length; ++i) {
         
        //Filter out the program items 
        if (programs[i].name == selectValue.value) {
            //Add

            let tr = document.createElement('tr');
            
            //Checkbox
            let td1 = document.createElement('td');
            
            const chk = td1.appendChild(document.createElement('progress'));
             
            chk.type = 'input';
           
            tr.appendChild(td1);

            let td2 = document.createElement('td');
            td2.textContent = programs[i].action;
            tr.appendChild(td2);
            
            

            table1.appendChild(tr);

        } 
    }
    
    //Update program log
    for (var i = 0; i < programLog.length; ++i) {
         
        //Filter out the program items 
        if (programLog[i].name == selectValue.value) {
            //Add

            let tr = document.createElement('tr');

            //Checkbox
            let td1 = document.createElement('td');
            const chk = td1.appendChild(document.createElement('input'));
            chk.type = 'checkbox';
         //   td2.textContent = chec
            tr.appendChild(td1);
            
            let td2 = document.createElement('td');
            td2.textContent = programLog[i].action;
            tr.appendChild(td2);
            
           

            table2.appendChild(tr);

        } 
        
    
    }
    

    
    
    
    //Update sliders
    for (var i = 0; i < programsValues.length; ++i) {
        //Check if program is already present i programList array
        
        if (programsValues[i].name == selectValue.value) {
            //Update
            document.getElementById("delaySec").value = programsValues[i].delay;
            document.getElementById("awaySec").value = programsValues[i].away;
            document.getElementById("frontSec").value = programsValues[i].front;
            document.getElementById("numRepeats").value = programsValues[i].repeats;
            
            //Update text
            document.getElementById("delaySecValue").innerHTML = programsValues[i].delay;
            document.getElementById("awaySecValue").innerHTML = programsValues[i].away;
            document.getElementById("frontSecValue").innerHTML = programsValues[i].front;
            document.getElementById("numRepeatsValue").innerHTML = programsValues[i].repeats;
        }
        
        
    }
   
    
}   

function fillSelect() {
    // Get dropdown element from DOM
    var dropdown = document.getElementById("programs");
    var timer = document.getElementById("timerValues");
    
    //Create program list array
    var programList = []; 
    
    //Add first
    programList.push('Välj program');

    // Loop through the programs array, add if there is no duplicate
    for (var i = 0; i < programs.length; ++i) {
        //Check if program is already present i programList array
        
        if (programList.includes(programs[i].name) != true) {
            //Add
            programList.push(programs[i].name);
        }
        
        
    }
    
    //Add to program list
    
    for (var i = 0; i < programList.length; ++i) {
        dropdown[dropdown.length] = new Option(programList[i]);
    }   
    
    //Add to timer list
    timer[timer.length] = new Option('Välj timertid');
    timer[timer.length] = new Option('57');
    timer[timer.length] = new Option('60');
    timer[timer.length] = new Option('180');
    timer[timer.length] = new Option('257');
    timer[timer.length] = new Option('300');
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

function preProgramExtra() {
    
    //Check function
    if (document.getElementById("preProgramExtra").value == "GÅ TILL ELD UPPHÖR") {
        //Send fast forward command for Precision
        websocket.send("fastForwardPrecison");
    }
    
    if (document.getElementById("preProgramExtra").value == "GÅ TILL PATRON UR OSV") {
        //Send start program again
        websocket.send("playPreProgram");
    }  
}

function markera() {
    
    //Check that no program is runnning
    if (program == 0 && preProgram == 0) {
        if (confirm("Genom att välja OK kommer skjutkommandot MARKERA att aktiveras utan fördröjning")) {
        
            //Send sound command
            websocket.send("markera");
            
        } else {
            //Do nothing    
        }
    } 
    
}

const programs = [
    
    //25 METER PRECISION
    { name: 'Precision Förberedelsetid', action: 'BANAN ÄR ÖPPEN'},
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID START'},
    { name: 'Precision Förberedelsetid', action: 'Fördröjning 300 sekunder'},
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID STOPP'},
    
    { name: 'Precision Provserie', action: 'PROVSERIE LADDA'},
    { name: 'Precision Provserie', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Provserie', action: 'FÄRDIGA'},
    { name: 'Precision Provserie', action: 'ELD'},
    { name: 'Precision Provserie', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Provserie', action: 'ELD UPPHÖR'},
    { name: 'Precision Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Provserie', action: 'VISITATION'},
    
    { name: 'Precision Serie 1', action: 'SERIE 1 LADDA'},
    { name: 'Precision Serie 1', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 1', action: 'FÄRDIGA'},
    { name: 'Precision Serie 1', action: 'ELD'},
    { name: 'Precision Serie 1', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 1', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 1', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 1', action: 'VISITATION'},
    
    { name: 'Precision Serie 2', action: 'SERIE 2 LADDA'},
    { name: 'Precision Serie 2', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 2', action: 'FÄRDIGA'},
    { name: 'Precision Serie 2', action: 'ELD'},
    { name: 'Precision Serie 2', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 2', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 2', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 2', action: 'VISITATION'},
    
    { name: 'Precision Serie 3', action: 'SERIE 3 LADDA'},
    { name: 'Precision Serie 3', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 3', action: 'FÄRDIGA'},
    { name: 'Precision Serie 3', action: 'ELD'},
    { name: 'Precision Serie 3', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 3', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 3', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 3', action: 'VISITATION'},
    
    { name: 'Precision Serie 4', action: 'SERIE 4 LADDA'},
    { name: 'Precision Serie 4', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 4', action: 'FÄRDIGA'},
    { name: 'Precision Serie 4', action: 'ELD'},
    { name: 'Precision Serie 4', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 4', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 4', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 4', action: 'VISITATION'},
    
    { name: 'Precision Serie 5', action: 'SERIE 5 LADDA'},
    { name: 'Precision Serie 5', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 5', action: 'FÄRDIGA'},
    { name: 'Precision Serie 5', action: 'ELD'},
    { name: 'Precision Serie 5', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 5', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 5', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 5', action: 'VISITATION'},
    
    { name: 'Precision Serie 6', action: 'SERIE 6 LADDA'},
    { name: 'Precision Serie 6', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 6', action: 'FÄRDIGA'},
    { name: 'Precision Serie 6', action: 'ELD'},
    { name: 'Precision Serie 6', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 6', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 6', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 6', action: 'VISITATION'},
    
    { name: 'Precision Serie 7', action: 'SERIE 7 LADDA'},
    { name: 'Precision Serie 7', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 7', action: 'FÄRDIGA'},
    { name: 'Precision Serie 7', action: 'ELD'},
    { name: 'Precision Serie 7', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 7', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 7', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 7', action: 'VISITATION'},
    
    { name: 'Precision Serie 8', action: 'SERIE 8 LADDA'},
    { name: 'Precision Serie 8', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 8', action: 'FÄRDIGA'},
    { name: 'Precision Serie 8', action: 'ELD'},
    { name: 'Precision Serie 8', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 8', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 8', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 8', action: 'VISITATION'},
    
    { name: 'Precision Serie 9', action: 'SERIE 9 LADDA'},
    { name: 'Precision Serie 9', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 9', action: 'FÄRDIGA'},
    { name: 'Precision Serie 9', action: 'ELD'},
    { name: 'Precision Serie 9', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 9', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 9', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 9', action: 'VISITATION'},
    
    { name: 'Precision Serie 10', action: 'SERIE 10 LADDA'},
    { name: 'Precision Serie 10', action: 'Fördröjning 57 sekunder'},
    { name: 'Precision Serie 10', action: 'FÄRDIGA'},
    { name: 'Precision Serie 10', action: 'ELD'},
    { name: 'Precision Serie 10', action: 'Fördröjning 297 sekunder'},
    { name: 'Precision Serie 10', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 10', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 10', action: 'VISITATION'},
    
    //25 METER MILSNABB 10 SEK
    { name: 'Militär Snabbmatch Provserie', action: 'PROVSERIE 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch Provserie', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch Provserie', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch Provserie', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch Provserie', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'SERIE 1 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'SERIE 2 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'SERIE 3 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'SERIE 4 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'VISITATION'},
        
    //25 METER MILSNABB 8 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'SERIE 3 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'SERIE 4 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'VISITATION'},
    
    //25 METER MILSNABB 6 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'SERIE 3 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'VISITATION'},
    
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'SERIE 4 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'VISITATION'},
    
    
    //25 METER SNABBPISTOL
   // { name: 'Snabbpistol Förberedelsetid', action: 'FÖRBEREDELSETID START'},
    //{ name: 'Snabbpistol Förberedelsetid', action: 'Fördröjning 300 sekunder'},
    //{ name: 'Snabbpistol Förberedelsetid', action: 'FÖRBEREDELSETID STOPP'},
    
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'PROVSERIE 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'VISITATION'},
    
    //25 METER SNABBPISTOL 8 SEK
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'VISITATION'},
    
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'VISITATION'},
    
    //25 METER SNABBPISTOL 6 SEK
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'VISITATION'},
    
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'VISITATION'},
    
    //25 METER SNABBPISTOL 4 SEK
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'SERIE 1 - 4 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla fram 4 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'VISITATION'},
    
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'SERIE 2 - 4 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla fram 4 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'VISITATION'},
    
    //25 METER SPORT/GROVPISTOL PRECISION
    { name: 'Sport/Grovpistol Förberedelsetid', action: 'FÖRBEREDELSETID STARTAR NU'},
    { name: 'Sport/Grovpistol Förberedelsetid', action: 'Fördröjning 180 sekunder'},
    
    { name: 'Sport/Grovpistol Provserie', action: 'FÖR PROVSERIE LADDA'},
    { name: 'Sport/Grovpistol Provserie', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Provserie', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Provserie', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Provserie', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Provserie', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 1', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 1', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 1', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 1', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 2', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 2', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 2', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 2', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 3', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 3', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 3', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 3', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 4', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 4', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 4', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 4', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 5', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 5', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 5', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 5', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Serie 6', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Fördröjning 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 6', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Serie 6', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Serie 6', action: 'VISITATION'},
    
    //25 METER SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'FÖR PROVSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Provserie', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'VISITATION'},
    
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Fördröjning 60 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'ELD UPPHÖR'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'VISITATION'},
    
    //25 METER STANDARDPISTOL
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'PROVSERIE LADDA'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla fram 150 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'VISITATION'},
    
    { name: 'Standardpistol 150 sek', action: 'SERIE 150 SEKUNDER LADDA'},
    { name: 'Standardpistol 150 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol 150 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 150 sek', action: 'Tavla fram 150 sekunder'},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 150 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 150 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 150 sek', action: 'VISITATION'},
        
    { name: 'Standardpistol 20 sek', action: 'SERIE 20 SEKUNDER LADDA'},
    { name: 'Standardpistol 20 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'Tavla fram 20 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 20 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 20 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 20 sek', action: 'VISITATION'},
    
    { name: 'Standardpistol 10 sek', action: 'SERIE 10 SEKUNDER LADDA'},
    { name: 'Standardpistol 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 10 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 10 sek', action: 'VISITATION'},
    
    //FÄLT RÖRLIGA MÅL
    { name: 'Fält Rörlig - 16 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 16 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 16 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 16 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla fram 16 sekunder'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 16 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 16 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 16 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig - 14 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 14 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 14 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 14 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla fram 14 sekunder'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 14 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 14 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 14 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig - 12 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 12 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 12 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 12 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla fram 12 sekunder'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 12 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 12 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 12 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig - 10 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 10 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 10 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 10 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 10 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 10 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig - 8 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 8 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 8 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 8 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 8 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 8 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig - 6 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 6 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 6 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 6 sek', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 6 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 6 sek', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 2x8/8', action: 'LADDA'},
    { name: 'Fält Rörlig 2x8/8', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x8/8', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x8/8', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x8/8', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x8/8', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x8/8', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 2x6/6', action: 'LADDA'},
    { name: 'Fält Rörlig 2x6/6', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x6/6', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x6/6', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x6/6', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x6/6', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x6/6', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 2x5/5', action: 'LADDA'},
    { name: 'Fält Rörlig 2x5/5', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x5/5', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x5/5', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x5/5', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x5/5', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x5/5', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 2x4/4', action: 'LADDA'},
    { name: 'Fält Rörlig 2x4/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x4/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x4/4', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x4/4', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x4/4', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x4/4', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 2x3/3', action: 'LADDA'},
    { name: 'Fält Rörlig 2x3/3', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x3/3', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x3/3', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x3/3', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x3/3', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x3/3', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 3x6/4', action: 'LADDA'},
    { name: 'Fält Rörlig 3x6/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x6/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x6/4', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x6/4', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 3x6/4', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 3x6/4', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 3x4/4', action: 'LADDA'},
    { name: 'Fält Rörlig 3x4/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x4/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x4/4', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x4/4', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 3x4/4', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 3x4/4', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 3x3/3', action: 'LADDA'},
    { name: 'Fält Rörlig 3x3/3', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x3/3', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/3', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort 3 sekunder'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort 3 sekunder'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/3', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 3x3/3', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 3x3/3', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 3x3/2', action: 'LADDA'},
    { name: 'Fält Rörlig 3x3/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x3/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 3x3/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 3x3/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 3x2/2', action: 'LADDA'},
    { name: 'Fält Rörlig 3x2/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x2/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x2/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x2/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 3x2/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 3x2/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 6x4/2', action: 'LADDA'},
    { name: 'Fält Rörlig 6x4/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x4/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x4/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x4/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x4/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x4/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 6x3/2', action: 'LADDA'},
    { name: 'Fält Rörlig 6x3/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x3/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x3/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x3/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x3/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x3/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 6x2/2', action: 'LADDA'},
    { name: 'Fält Rörlig 6x2/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x2/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x2/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x2/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x2/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x2/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 6x1/2', action: 'LADDA'},
    { name: 'Fält Rörlig 6x1/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x1/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/2', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x1/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x1/2', action: 'VISITATION'},
    
    { name: 'Fält Rörlig 6x1/1', action: 'LADDA'},
    { name: 'Fält Rörlig 6x1/1', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x1/1', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/1', action: 'FÄRDIGA (3 sekunder innan tavla vänds fram)'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/1', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x1/1', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x1/1', action: 'VISITATION'},
    
    //FÄLT FASTA MÅL
    { name: 'Fält Fast - 16 sek', action: 'LADDA'},
    { name: 'Fält Fast - 16 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 16 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 16 sek', action: 'FÄRDIGA (3 sekunder innan ELD)'},
    { name: 'Fält Fast - 16 sek', action: 'ELD'},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning 16 sekunder'},
    { name: 'Fält Fast - 16 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 16 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 16 sek', action: 'VISITATION'},
    
    { name: 'Fält Fast - 14 sek', action: 'LADDA'},
    { name: 'Fält Fast - 14 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 14 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 14 sek', action: 'FÄRDIGA (3 sekunder innan ELD)'},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning 14 sekunder'},
    { name: 'Fält Fast - 14 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 14 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 14 sek', action: 'VISITATION'},
    
    { name: 'Fält Fast - 12 sek', action: 'LADDA'},
    { name: 'Fält Fast - 12 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 12 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 12 sek', action: 'FÄRDIGA (3 sekunder innan ELD)'},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning 12 sekunder'},
    { name: 'Fält Fast - 12 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 12 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 12 sek', action: 'VISITATION'},
    
    { name: 'Fält Fast - 10 sek', action: 'LADDA'},
    { name: 'Fält Fast - 10 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 10 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 10 sek', action: 'FÄRDIGA (3 sekunder innan ELD)'},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning 10 sekunder'},
    { name: 'Fält Fast - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 10 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 10 sek', action: 'VISITATION'},
    
    { name: 'Fält Fast - 8 sek', action: 'LADDA'},
    { name: 'Fält Fast - 8 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 8 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 8 sek', action: 'FÄRDIGA (3 sekunder innan ELD'},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning 8 sekunder'},
    { name: 'Fält Fast - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 8 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 8 sek', action: 'VISITATION'},
    
    { name: 'Fält Fast - 6 sek', action: 'LADDA'},
    { name: 'Fält Fast - 6 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 6 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 6 sek', action: 'FÄRDIGA (3 sekunder innan ELD)'},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning 6 sekunder'},
    { name: 'Fält Fast - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Fast - 6 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 6 sek', action: 'VISITATION'},
    
];

const programsId = [
    
    //PRECISION SERIE PROVSERIE OCH 1-5
    { name: 'Precision Förberedelsetid', id: 0},
    { name: 'Precision Provserie', id: 1},
    { name: 'Precision Serie 1', id: 2},
    { name: 'Precision Serie 2', id: 3},
    { name: 'Precision Serie 3', id: 4},
    { name: 'Precision Serie 4', id: 5},
    { name: 'Precision Serie 5', id: 6},
    { name: 'Precision Serie 6', id: 7},
    { name: 'Precision Serie 7', id: 8},
    { name: 'Precision Serie 8', id: 9},
    { name: 'Precision Serie 9', id: 10},
    { name: 'Precision Serie 10', id: 11},
    
    //MILITÄR SNABBMATCH
    { name: 'Militär Snabbmatch Provserie', id: 20},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', id: 21},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', id: 22},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', id: 23},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', id: 24},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', id: 25},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', id: 26},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', id: 27},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', id: 28},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', id: 29},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', id: 30},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', id: 31},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', id: 32},
    
    //SNABBPISTOL
    //{ name: 'Snabbpistol Förberedelsetid', id: 40},
    //{ name: 'Snabbpistol Provserie', id: 41},
    { name: 'Snabbpistol Förberedelsetid + Provserie', id: 40},  
    { name: 'Snabbpistol - Serie 1 - 8 sek', id: 42},
    { name: 'Snabbpistol - Serie 2 - 8 sek', id: 43},
    { name: 'Snabbpistol - Serie 1 - 6 sek', id: 44},
    { name: 'Snabbpistol - Serie 2 - 6 sek', id: 45},
    { name: 'Snabbpistol - Serie 1 - 4 sek', id: 46},
    { name: 'Snabbpistol - Serie 2 - 4 sek', id: 47},
    
    //SPORT/GROVPISTOL PRECISION
    { name: 'Sport/Grovpistol Förberedelsetid', id: 50},
    { name: 'Sport/Grovpistol Provserie', id: 51},
    { name: 'Sport/Grovpistol Serie 1', id: 52},
    { name: 'Sport/Grovpistol Serie 2', id: 53},
    { name: 'Sport/Grovpistol Serie 3', id: 54},
    { name: 'Sport/Grovpistol Serie 4', id: 55},
    { name: 'Sport/Grovpistol Serie 5', id: 56},
    { name: 'Sport/Grovpistol Serie 6', id: 57},
    
    //SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Provserie', id: 60},
    { name: 'Sport/Grovpistol Snabb Serie 1', id: 61},
    { name: 'Sport/Grovpistol Snabb Serie 2', id: 62},
    { name: 'Sport/Grovpistol Snabb Serie 3', id: 63},
    { name: 'Sport/Grovpistol Snabb Serie 4', id: 64},
    { name: 'Sport/Grovpistol Snabb Serie 5', id: 65},
    { name: 'Sport/Grovpistol Snabb Serie 6', id: 66},
    
    //STANDARDPISTOL
    { name: 'Standardpistol Förberedelsetid + Provserie', id: 70},
    //{ name: 'Standardpistol Provserie', id: 71},
    { name: 'Standardpistol 150 sek', id: 72},
    { name: 'Standardpistol 20 sek', id: 73},
    { name: 'Standardpistol 10 sek', id: 74},
    
    //FÄLT RÖRLIGA MÅL
    { name: 'Fält Rörlig - 16 sek', id: 80},
    { name: 'Fält Rörlig - 14 sek', id: 81},
    { name: 'Fält Rörlig - 12 sek', id: 82},
    { name: 'Fält Rörlig - 10 sek', id: 83},
    { name: 'Fält Rörlig - 8 sek', id: 84},
    { name: 'Fält Rörlig - 6 sek', id: 85},
    
    { name: 'Fält Rörlig 2x8/8', id: 86},
    { name: 'Fält Rörlig 2x6/6', id: 87},
    { name: 'Fält Rörlig 2x5/5', id: 88},
    { name: 'Fält Rörlig 2x4/4', id: 89},
    { name: 'Fält Rörlig 2x3/3', id: 90},
    { name: 'Fält Rörlig 3x6/4', id: 91},
    { name: 'Fält Rörlig 3x4/4', id: 92},
    { name: 'Fält Rörlig 3x3/3', id: 93},
    { name: 'Fält Rörlig 3x3/2', id: 94},
    { name: 'Fält Rörlig 3x2/2', id: 95},
    { name: 'Fält Rörlig 6x4/2', id: 96},
    { name: 'Fält Rörlig 6x3/2', id: 97},
    { name: 'Fält Rörlig 6x2/2', id: 98},
    { name: 'Fält Rörlig 6x1/2', id: 99},
    { name: 'Fält Rörlig 6x1/1', id: 100},
    
    //FÄLT FASTA MÅL
    { name: 'Fält Fast - 16 sek', id: 101},
    { name: 'Fält Fast - 14 sek', id: 102},
    { name: 'Fält Fast - 12 sek', id: 103},
    { name: 'Fält Fast - 10 sek', id: 104},
    { name: 'Fält Fast - 8 sek', id: 105},
    { name: 'Fält Fast - 6 sek', id: 106},

    
];


const programsValues = [
    
    { name: 'Militär Snabbmatch - 10 sek', delay:60, away: 7, front: 10, repeats: 1},
    { name: 'Militär Snabbmatch - 8 sek', delay:60, away: 7, front: 8, repeats: 1},
    { name: 'Militär Snabbmatch - 6 sek', delay:60, away: 7, front: 6, repeats: 1},
    { name: 'Militär Snabbmatch Provserie - 10 sek', delay:60, away: 7, front: 10, repeats: 1},
   
    { name: 'Snabbpistol 8 sek Provserie',  delay:60, away: 7, front: 8, repeats: 1},
    { name: 'Snabbpistol 8 sek Provserie',  delay:60, away: 7, front: 8, repeats: 1},
    { name: 'Snabbpistol 8 sek',  delay:60, away: 7, front: 8, repeats: 1},
    { name: 'Snabbpistol 6 sek',  delay:60, away: 7, front: 6, repeats: 1},
    { name: 'Snabbpistol 4 sek',  delay:60, away: 7, front: 4, repeats: 1},
   
    { name: 'Sport/Grovpistol Snabb',  delay:60, away: 7, front: 3, repeats: 5},
    
    { name: 'Standardpistol 10 sek',  delay:60, away: 7, front: 10, repeats: 1},
    { name: 'Standardpistol 20 sek',  delay:60, away: 7, front: 20, repeats: 1},
    { name: 'Standardpistol 150 sek',  delay:60, away: 7, front: 150, repeats: 1},
    
    { name: 'Fält 16',  delay:10, away: 10, front: 16, repeats: 1},
    { name: 'Fält 14',  delay:10, away: 10, front: 14, repeats: 1},
    { name: 'Fält 12',  delay:10, away: 10, front: 12, repeats: 1},
    { name: 'Fält 10',  delay:10, away: 10, front: 10, repeats: 1},
    { name: 'Fält 8',  delay:10, away: 10, front: 8, repeats: 1},
    { name: 'Fält 6',  delay:10, away: 10, front: 6, repeats: 1},
    
];


const programLog = [
    
    { name: 'Precision', action: 'Förberedelsetid'},
    { name: 'Precision', action: 'Provserie'},
    { name: 'Precision', action: 'Serie 1'},
    { name: 'Precision', action: 'Serie 2'},
    { name: 'Precision', action: 'Serie 3'},
    { name: 'Precision', action: 'Serie 4'},
    { name: 'Precision', action: 'Serie 5'},
    
    { name: 'Militär Snabbmatch - 10 sek', action: 'Serie 1 - 10 sek'},
    { name: 'Militär Snabbmatch - 10 sek', action: 'Serie 2 - 10 sek'},
    { name: 'Militär Snabbmatch - 10 sek', action: 'Serie 3 - 10 sek'},
    { name: 'Militär Snabbmatch - 10 sek', action: 'Serie 4 - 10 sek'},
    
    { name: 'Militär Snabbmatch - 8 sek', action: 'Serie 1 - 8 sek'},
    { name: 'Militär Snabbmatch - 8 sek', action: 'Serie 2 - 8 sek'},
    { name: 'Militär Snabbmatch - 8 sek', action: 'Serie 3 - 8 sek'},
    { name: 'Militär Snabbmatch - 8 sek', action: 'Serie 4 - 8 sek'},
    
    { name: 'Militär Snabbmatch - 6 sek', action: 'Serie 1 - 6 sek'},
    { name: 'Militär Snabbmatch - 6 sek', action: 'Serie 2 - 6 sek'},
    { name: 'Militär Snabbmatch - 6 sek', action: 'Serie 3 - 6 sek'},
    { name: 'Militär Snabbmatch - 6 sek', action: 'Serie 4 - 6 sek'},
    
    { name: 'Sport/Grovpistol Precision', action: 'Provserie - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 1 - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 2 - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 3 - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 4 - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 5 - 300 sek'},
    { name: 'Sport/Grovpistol Precision', action: 'Serie 6 - 300 sek'},
    
    { name: 'Sport/Grovpistol Snabb', action: 'Provserie - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 1 - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 2 - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 3 - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 4 - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 5 - 3 sek'},
    { name: 'Sport/Grovpistol Snabb', action: 'Serie 6 - 3 sek'},
];



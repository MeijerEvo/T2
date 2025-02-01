// T1 Gateway


var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var illum = new Boolean(false);
var pump = new Boolean(false);
var compressor = new Boolean(false);
var timer = new Boolean(false);
var leader = new Boolean(false); //False = Member, true = Leader
var version = new String();
var choosenProgram = new String();
var programIndex;

var tableRow = 0;
var preProgramRow = 0;

//Program running flags
var program = new Boolean(false);
var preProgram = new Boolean(false);
var preProgramManuell = new Boolean(false);

var progressValue = 0;
var programPos = 0;
var preProgramPos = 0;
var preProgramInsideArrayPos = 0;

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

    //Show program text
    document.getElementById("text").value = "GÖM TEXT";
    document.getElementsByClassName('programsTable')[0].style.display = 'inline';



}

function startProgramLoad() {

    //Get URL
    var URL = new String;

    URL = window.location.href;
    programIndex = parseInt(URL.substr(URL.length-3, 3));

    //console.log(programIndex);

    //Set program title
    for (var i = 0; i < programsId.length; ++i) {
        if (programsId[i].id == programIndex) {
            //Match
            document.getElementById("programTitle").innerHTML = programsId[i].name;
            choosenProgram = programsId[i].name;
            //Fill table



            updateProgramList(programsId[i].name);
        }
    }

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

    //console.log(keys.length);

    //Update table
    updateProgramList(choosenProgram);

    for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        //console.log(key);

        //Sätt maxvärde på progress bar
        if (key == "preProgramLength") {
            const preProgress = document.getElementById("preProgramProgress");
            preProgress.max = myObj[key]+1;
        }


        //Preprogrammed program
        if (key == "preProgramPos") {
            //Program
            if (myObj[key] > 0)  {
                //Preprogrammed program running

                //Set value to progress bar just first time
             /*   if (preProgram == false) {
                    preProgressValue = myObj[key]+1;
                    const preProgress = document.getElementById("preProgramProgress");
                    preProgress.max = preProgressValue;//100;

                }*/

                preProgramPos = myObj[key]+1;

                //Increase slider
                const preProgress = document.getElementById("preProgramProgress");
               // preProgress.value = (preProgressValue - myObj[key]+1);
                preProgress.value = myObj[key]+1;

               // programPos = (preProgressValue - myObj[key]+1);

               //  document.getElementById("programPos").innerHTML = "POS:" + programPos;

                preProgram = true;

                document.getElementById("preProgramStartStopButton").value = "STOPPA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = 'red';

                //Disable reset button
               // document.getElementById("preProgramResetSliders").disabled = true;




            } else {
                //Not running

                preProgram = false;
                preProgramPos = 0;

                document.getElementById("preProgramStartStopButton").value = "STARTA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = '#32612D';

                document.getElementById("preProgramExtra").value = "EXTRA";
                document.getElementById("preProgramExtra").style.backgroundColor = '#32612D';

                //Reset timer value
                //document.getElementById("preProgramTimerTime").innerHTML = 0;

                //Reset progress bar
                const preProgress = document.getElementById("preProgramProgress");
                preProgress.value = 0;

                //Reset big counter
                document.getElementById("preProgramTimerTime").innerHTML = "0";

                //Reset table
                updateProgramList(choosenProgram);





            }
        }



        //Extra button
        if (key == "extraButton") {

            if (myObj[key] == 0) {
                //No extra function enabled
                document.getElementById("preProgramExtra").value = "EXTRA";

                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = '#32612D';

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
                document.getElementById("preProgramExtra").value = "GÅ TILL PATRON UR";

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





        //Latest program
        if (key == "latestProgram") {
            //Check what program
            for (var j = 0; j < programsId.length; ++j) {
                if (programsId[j].id == myObj[key]) {
                    //Match
                    document.getElementById("latestProgram").innerHTML = "Senast körda program: " + programsId[j].name;
                }
            }

        }

        //Start program via remote
        if (key == "remote") {

            if (myObj[key] == 1) {
                //Activate START/STOP button
                //Only start, not stop
                if (preProgram == false) {  preProgramStartStop() }
            }
        }


        //Radposition i program
        if (key == "preProgramRow") {

            preProgramRow = myObj[key];

        }

        //Position i program
        if (key == "preProgramPos") {

            preProgramPos = myObj[key];

        }

        //Position i array
        if (key == "preProgramInsideArrayPos") {

            preProgramInsideArrayPos = myObj[key];

        }





    }
}



function preProgramStartStop() {
    //Start/Stop preprogrammed program

    console.log("Program Start");

    //Check lane boxes
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false) {
        alert("Du måste välja minst en bana");
    } else {


        //choosenProgram = document.getElementById("programs").value;

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

                    //Flag
                    preProgramManuell = true;

                    //Change button
                    document.getElementById("preProgramStartStopButton").value = "STOPPA PROGRAM";
                    document.getElementById("preProgramStartStopButton").style.backgroundColor = 'red';



                    //Update list
                    updateProgramList(choosenProgram);


                  //  }
               } else {
                   //Send message
                     websocket.send("preProgramStop");

                    //Clear table
                    // let table1 = document.getElementById('programsTable');
                    let table1 = document.querySelector("#programsTable tbody");

                    table1.innerHTML = "";
                    programPos = 0;

                    //Flag
                    preProgramManuell = false;

                    //Button
                    document.getElementById("preProgramStartStopButton").value = "STARTA PROGRAM";
                    document.getElementById("preProgramStartStopButton").style.backgroundColor = '#32612D';

                    preProgramPos = 0;

                    //Update list
                    updateProgramList(choosenProgram);

                    //Reset big counter
                    document.getElementById("preProgramTimerTime").innerHTML = "0";


               }
         }
    }
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






function updateProgramList(selectValue) {


   // let table1 = document.getElementById('programsTable');
    let table1 = document.querySelector("#programsTable tbody");



    table1.innerHTML = "";
    tableRow = 0;

    //Update program list
    for (var i = 0; i < programs.length; ++i) {

        //Filter out the program items
        if (programs[i].name == selectValue) {

            //Öka räknare
            tableRow++;

            //Create row
            let tr = document.createElement('tr');

            //Columns
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');

            //Which image?
            //td1.innerHTML = "";

            //Target
            if (programs[i].action.substring(0, 10) == "Tavla fram") {
                td1.innerHTML = '<img src="target.png" alt="" height="24" width="24"</img>';
            }


            //Away
            if (programs[i].action.substring(0, 10) == "Tavla bort") {
                td1.innerHTML = '<img src="away.png" alt="" height="24" width="24"</img>';
            }

            //Timer
            if (programs[i].action.substring(0, 11) == "Fördröjning") {
                td1.innerHTML = '<img src="timer.png" alt="" height="24" width="24"</img>';
            }

            //Speaker (Second character is uppercase)
            if (programs[i].action.substring(1, 2) == programs[i].action.substring(1, 2).toUpperCase()) {
                td1.innerHTML = '<img src="sound.png" alt="" height="24" width="24"</img>';
            }


            //  console.log(tableRow);
            //    console.log(preProgramRow);


           // if (programPos >= programs[i].start && programPos <= programs[i].stop) {
            if (tableRow == preProgramRow + 1 && preProgramPos > 0) {


                preProgramInsideArrayPos++;

                td2.textContent = programs[i].action + " = " + preProgramInsideArrayPos;

                td2.style.border = "solid #0000FF";
                td2.style.borderRadius = "10px";
                td2.style.color = "#000000";

                //Show big counter
                //document.getElementById("preProgramTimerTime").innerHTML = (programs[i].stop - programPos+1);
                document.getElementById("preProgramTimerTime").innerHTML = preProgramInsideArrayPos;


            } else {

                td2.textContent = programs[i].action;
                td2.style.color = "#000000";


            }

            //Add to row
            //tr.appendChild(td1);
            tr.appendChild(td2);

            //Add to table
            table1.appendChild(tr);

        }
    }




}




function preProgramExtra() {

    //Check function
    if (document.getElementById("preProgramExtra").value == "GÅ TILL ELD UPPHÖR") {
        //Send fast forward command for Precision
        websocket.send("fastForwardPrecision");
    }

    if (document.getElementById("preProgramExtra").value == "GÅ TILL PATRON UR") {
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

function showText() {

    if (document.getElementsByClassName('programsTable')[0].style.display == 'none') {

        document.getElementById("text").value = "GÖM TEXT";
        document.getElementsByClassName('programsTable')[0].style.display = 'inline';
     } else {
        document.getElementsByClassName('programsTable')[0].style.display = 'none';
        document.getElementById("text").value = "VISA TEXT";

    }
}

//Next program
function nextProgram() {

    if (preProgram == false) {
        //Program not running

        ++programIndex;

        //Set program title
        for (var i = 0; i < programsId.length; ++i) {
            if (programsId[i].id == programIndex) { // Add 1 to index
                //Match
                document.getElementById("programTitle").innerHTML = programsId[i].name;
                choosenProgram = programsId[i].name;
                //Fill table
                updateProgramList(programsId[i].name);
            }
        }
    }

}

function avbryt() {

  websocket.send("avbryt");

}



const programs = [

    //25 METER PRECISION
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID START'},
    { name: 'Precision Förberedelsetid', action: 'Fördröjning'},
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID STOPP'},

    { name: 'Precision Provserie', action: 'PROVSERIE LADDA'},
    { name: 'Precision Provserie', action: 'Fördröjning'},
    { name: 'Precision Provserie', action: 'FÄRDIGA'},
    { name: 'Precision Provserie', action: 'Fördröjning'},
    { name: 'Precision Provserie', action: 'ELD'},
    { name: 'Precision Provserie', action: 'Fördröjning'},
    { name: 'Precision Provserie', action: 'ELD UPPHÖR'},
    { name: 'Precision Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Provserie', action: 'VISITATION'},

    { name: 'Precision Serie 1', action: 'SERIE 1 LADDA'},
    { name: 'Precision Serie 1', action: 'Fördröjning'},
    { name: 'Precision Serie 1', action: 'FÄRDIGA'},
    { name: 'Precision Serie 1', action: 'Fördröjning'},
    { name: 'Precision Serie 1', action: 'ELD'},
    { name: 'Precision Serie 1', action: 'Fördröjning'},
    { name: 'Precision Serie 1', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 1', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 1', action: 'VISITATION'},

    { name: 'Precision Serie 2', action: 'SERIE 2 LADDA'},
    { name: 'Precision Serie 2', action: 'Fördröjning'},
    { name: 'Precision Serie 2', action: 'FÄRDIGA'},
    { name: 'Precision Serie 2', action: 'Fördröjning'},
    { name: 'Precision Serie 2', action: 'ELD'},
    { name: 'Precision Serie 2', action: 'Fördröjning'},
    { name: 'Precision Serie 2', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 2', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 2', action: 'VISITATION'},

    { name: 'Precision Serie 3', action: 'SERIE 3 LADDA'},
    { name: 'Precision Serie 3', action: 'Fördröjning'},
    { name: 'Precision Serie 3', action: 'FÄRDIGA'},
    { name: 'Precision Serie 3', action: 'Fördröjning'},
    { name: 'Precision Serie 3', action: 'ELD'},
    { name: 'Precision Serie 3', action: 'Fördröjning'},
    { name: 'Precision Serie 3', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 3', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 3', action: 'VISITATION'},

    { name: 'Precision Serie 4', action: 'SERIE 4 LADDA'},
    { name: 'Precision Serie 4', action: 'Fördröjning'},
    { name: 'Precision Serie 4', action: 'FÄRDIGA'},
    { name: 'Precision Serie 4', action: 'Fördröjning'},
    { name: 'Precision Serie 4', action: 'ELD'},
    { name: 'Precision Serie 4', action: 'Fördröjning'},
    { name: 'Precision Serie 4', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 4', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 4', action: 'VISITATION'},

    { name: 'Precision Serie 5', action: 'SERIE 5 LADDA'},
    { name: 'Precision Serie 5', action: 'Fördröjning'},
    { name: 'Precision Serie 5', action: 'FÄRDIGA'},
    { name: 'Precision Serie 5', action: 'Fördröjning'},
    { name: 'Precision Serie 5', action: 'ELD'},
    { name: 'Precision Serie 5', action: 'Fördröjning'},
    { name: 'Precision Serie 5', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 5', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 5', action: 'VISITATION'},

    { name: 'Precision Serie 6', action: 'SERIE 6 LADDA'},
    { name: 'Precision Serie 6', action: 'Fördröjning'},
    { name: 'Precision Serie 6', action: 'FÄRDIGA'},
    { name: 'Precision Serie 6', action: 'Fördröjning'},
    { name: 'Precision Serie 6', action: 'ELD'},
    { name: 'Precision Serie 6', action: 'Fördröjning'},
    { name: 'Precision Serie 6', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 6', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 6', action: 'VISITATION'},

    { name: 'Precision Serie 7', action: 'SERIE 7 LADDA'},
    { name: 'Precision Serie 7', action: 'Fördröjning'},
    { name: 'Precision Serie 7', action: 'FÄRDIGA'},
    { name: 'Precision Serie 7', action: 'Fördröjning'},
    { name: 'Precision Serie 7', action: 'ELD'},
    { name: 'Precision Serie 7', action: 'Fördröjning'},
    { name: 'Precision Serie 7', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 7', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 7', action: 'VISITATION'},

    { name: 'Precision Serie 8', action: 'SERIE 8 LADDA'},
    { name: 'Precision Serie 8', action: 'Fördröjning'},
    { name: 'Precision Serie 8', action: 'FÄRDIGA'},
    { name: 'Precision Serie 8', action: 'Fördröjning'},
    { name: 'Precision Serie 8', action: 'ELD'},
    { name: 'Precision Serie 8', action: 'Fördröjning'},
    { name: 'Precision Serie 8', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 8', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 8', action: 'VISITATION'},

    { name: 'Precision Serie 9', action: 'SERIE 9 LADDA'},
    { name: 'Precision Serie 9', action: 'Fördröjning'},
    { name: 'Precision Serie 9', action: 'FÄRDIGA'},
    { name: 'Precision Serie 9', action: 'Fördröjning'},
    { name: 'Precision Serie 9', action: 'ELD'},
    { name: 'Precision Serie 9', action: 'Fördröjning'},
    { name: 'Precision Serie 9', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 9', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 9', action: 'VISITATION'},

    { name: 'Precision Serie 10', action: 'SERIE 10 LADDA'},
    { name: 'Precision Serie 10', action: 'Fördröjning'},
    { name: 'Precision Serie 10', action: 'FÄRDIGA'},
    { name: 'Precision Serie 10', action: 'Fördröjning'},
    { name: 'Precision Serie 10', action: 'ELD'},
    { name: 'Precision Serie 10', action: 'Fördröjning'},
    { name: 'Precision Serie 10', action: 'ELD UPPHÖR'},
    { name: 'Precision Serie 10', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Precision Serie 10', action: 'VISITATION'},

    //25 METER MILSNABB 10 SEK
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'FÖRBEREDELSETID START'},
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'FÖRBEREDELSETID STOPP'},

    { name: 'Militär Snabbmatch Provserie', action: 'PROVSERIE 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch Provserie', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch Provserie', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch Provserie', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch Provserie', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'SERIE 1 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'SERIE 2 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'SERIE 3 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'SERIE 4 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'VISITATION'},

    //25 METER MILSNABB 8 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'SERIE 3 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'SERIE 4 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'VISITATION'},

    //25 METER MILSNABB 6 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'SERIE 3 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'SERIE 4 - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'SÄRSKJUTNING PROVSERIE - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'SÄRSKJUTNING - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'KOMPLETTERINGSERIE - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'KOMPLETTERINGSERIE - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'KOMPLETTERINGSERIE - 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'SERIE 1 - 10 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'VISITATION'},

    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'SERIE 1- 6 SEKUNDER LADDA'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Fördröjning'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'FÄRDIGA'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla bort'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET'},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'VISITATION'},


    //25 METER SNABBPISTOL
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'PROVSERIE 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'VISITATION'},

    //25 METER SNABBPISTOL 8 SEK
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'VISITATION'},

    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'VISITATION'},

    //25 METER SNABBPISTOL 6 SEK
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'VISITATION'},

    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'VISITATION'},

    //25 METER SNABBPISTOL 4 SEK
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'SERIE 1 - 4 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla fram 4 sekunder'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'VISITATION'},

    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'SERIE 2 - 4 SEKUNDER LADDA'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Fördröjning'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'FÄRDIGA'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla fram 4 sekunder'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'STOPP, PATRON UR'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'VISITATION'},

    //25 METER SPORT/GROVPISTOL PRECISION
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÖR PROVSERIE LADDA'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 1', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 1', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 1', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 2', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 2', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 2', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 3', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 3', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 3', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 4', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 4', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 4', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 5', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 5', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 5', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Serie 6', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla fram 300 sekunder'},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Serie 6', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Serie 6', action: 'VISITATION'},

    //25 METER SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÖR PROVSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Fördröjning'},
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
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'VISITATION'},

    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'FÖR KOMPLETTERINGSSERIE LADDA'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Fördröjning'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'FÄRDIGA'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'STOPP, PATRON UR'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'VISITATION'},

    //25 METER STANDARDPISTOL
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'PROVSERIE 150 SEKUNDER LADDA'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÄRDIGA'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla fram 150 sekunder'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'VISITATION'},

    { name: 'Standardpistol 150 sek', action: '150 SEKUNDERS SERIE LADDA'},
    { name: 'Standardpistol 150 sek', action: 'Fördröjning'},
    { name: 'Standardpistol 150 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 150 sek', action: 'Tavla fram 150 sekunder'},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 150 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 150 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 150 sek', action: 'VISITATION'},

    { name: 'Standardpistol 20 sek', action: '20 SEKUNDERS SERIE LADDA'},
    { name: 'Standardpistol 20 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'Tavla fram 20 sekunder'},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 20 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 20 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 20 sek', action: 'VISITATION'},

    { name: 'Standardpistol 10 sek', action: '10 SEKUNDERS SERIE LADDA'},
    { name: 'Standardpistol 10 sek', action: 'Fördröjning 60 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'FÄRDIGA'},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort 7 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort'},
    { name: 'Standardpistol 10 sek', action: 'STOPP, PATRON UR'},
    { name: 'Standardpistol 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?'},
    { name: 'Standardpistol 10 sek', action: 'VISITATION'},

    //FÄLT RÖRLIGA MÅL
    { name: 'Fält Rörlig - 16 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 16 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 16 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 16 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla fram 16 sekunder'},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 16 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 16 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 16 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig - 14 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 14 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 14 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 14 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla fram 14 sekunder'},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 14 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 14 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 14 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig - 12 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 12 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 12 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 12 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla fram 12 sekunder'},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 12 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 12 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 12 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig - 10 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 10 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 10 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 10 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla fram 10 sekunder'},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 10 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 10 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 10 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig - 8 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 8 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 8 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 8 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 8 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 8 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 8 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig - 6 sek', action: 'LADDA'},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 6 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig - 6 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 6 sek', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla bort'},
    { name: 'Fält Rörlig - 6 sek', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig - 6 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig - 6 sek', action: 'VISITATION'},

    { name: 'Fält Rörlig 2x8/8', action: 'LADDA'},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x8/8', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x8/8', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x8/8', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder'},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x8/8', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x8/8', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x8/8', action: 'VISITATION'},

    { name: 'Fält Rörlig 2x6/6', action: 'LADDA'},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x6/6', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x6/6', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x6/6', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder'},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x6/6', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x6/6', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x6/6', action: 'VISITATION'},

    { name: 'Fält Rörlig 2x5/5', action: 'LADDA'},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x5/5', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x5/5', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x5/5', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder'},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x5/5', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x5/5', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x5/5', action: 'VISITATION'},

    { name: 'Fält Rörlig 2x4/4', action: 'LADDA'},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x4/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x4/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x4/4', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder'},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x4/4', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x4/4', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x4/4', action: 'VISITATION'},

    { name: 'Fält Rörlig 2x3/3', action: 'LADDA'},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x3/3', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 2x3/3', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x3/3', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder'},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 2x3/3', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 2x3/3', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 2x3/3', action: 'VISITATION'},

    { name: 'Fält Rörlig 3x6/4', action: 'LADDA'},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x6/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x6/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x6/4', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x4/4', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x4/4', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x4/4', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x3/3', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x3/3', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x3/3', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x3/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x3/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x3/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x2/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 3x2/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 3x2/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x4/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x4/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x4/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x3/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x3/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x3/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x2/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x2/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x2/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning'},
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
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/2', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x1/2', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/2', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/2', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x1/2', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x1/2', action: 'VISITATION'},

    { name: 'Fält Rörlig 6x1/1', action: 'LADDA'},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/1', action: 'ALLA KLARA?'},
    { name: 'Fält Rörlig 6x1/1', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/1', action: 'FÄRDIGA'},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekund'},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort'},
    { name: 'Fält Rörlig 6x1/1', action: 'ELD UPPHÖR'},
    { name: 'Fält Rörlig 6x1/1', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Rörlig 6x1/1', action: 'VISITATION'},

    //FÄLT FASTA MÅL
    { name: 'Fält Fast - 16 sek', action: 'LADDA'},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 16 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 16 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 16 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 16 sek', action: 'ELD'},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 16 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
    { name: 'Fält Fast - 16 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 16 sek', action: 'VISITATION'},

    { name: 'Fält Fast - 14 sek', action: 'LADDA'},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning'}, 
    { name: 'Fält Fast - 14 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 14 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 14 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 14 sek', action: 'ELD'},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 14 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
    { name: 'Fält Fast - 14 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 14 sek', action: 'VISITATION'},

    { name: 'Fält Fast - 12 sek', action: 'LADDA'},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 12 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 12 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 12 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 12 sek', action: 'ELD'},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 12 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
    { name: 'Fält Fast - 12 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 12 sek', action: 'VISITATION'},

    { name: 'Fält Fast - 10 sek', action: 'LADDA'},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 10 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 10 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 10 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 10 sek', action: 'ELD'},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 10 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
    { name: 'Fält Fast - 10 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 10 sek', action: 'VISITATION'},

    { name: 'Fält Fast - 8 sek', action: 'LADDA'},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 8 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 8 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 8 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 8 sek', action: 'ELD'},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 8 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
    { name: 'Fält Fast - 8 sek', action: 'PATRON UR, PROPPA VAPEN'},
    { name: 'Fält Fast - 8 sek', action: 'VISITATION'},

    { name: 'Fält Fast - 6 sek', action: 'LADDA'},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 6 sek', action: 'ALLA KLARA?'},
    { name: 'Fält Fast - 6 sek', action: '10 SEKUNDER KVAR'},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 6 sek', action: 'FÄRDIGA'},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 6 sek', action: 'ELD'},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning'},
    { name: 'Fält Fast - 6 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)'},
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
    { name: 'Militär Snabbmatch Förberedelsetid', id: 19},
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
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', id: 33},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', id: 34},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', id: 35},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', id: 36},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', id: 37},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', id: 110},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', id: 111},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', id: 112},

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
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', id: 51},
    { name: 'Sport/Grovpistol Serie 1', id: 52},
    { name: 'Sport/Grovpistol Serie 2', id: 53},
    { name: 'Sport/Grovpistol Serie 3', id: 54},
    { name: 'Sport/Grovpistol Serie 4', id: 55},
    { name: 'Sport/Grovpistol Serie 5', id: 56},
    { name: 'Sport/Grovpistol Serie 6', id: 57},

    //SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', id: 60},
    { name: 'Sport/Grovpistol Snabb Serie 1', id: 61},
    { name: 'Sport/Grovpistol Snabb Serie 2', id: 62},
    { name: 'Sport/Grovpistol Snabb Serie 3', id: 63},
    { name: 'Sport/Grovpistol Snabb Serie 4', id: 64},
    { name: 'Sport/Grovpistol Snabb Serie 5', id: 65},
    { name: 'Sport/Grovpistol Snabb Serie 6', id: 66},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', id: 67},

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

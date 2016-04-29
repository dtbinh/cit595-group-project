var lastAttempt = true;
var sensorWork = true;
var standbymode = false;
var celsius = 0;

Pebble.addEventListener("appmessage",
                        function(e) {
                        console.log(JSON.stringify(e));
                        checkPayload(e);
                        
                        }
                        );

// This function decides which function to call based on the payload key
function checkPayload(e){
    for (var key in e.payload) break;
    console.log(JSON.stringify(e));
    
    if(key === '0'){
        checkConnect();
        setTimeout(getCity, 1500);
        setTimeout(sendToServer, 3000);
    } else if(key === '1'){
        checkConnect();
        setTimeout(sendStandBy, 1500);
    } else if (key === '2'){
        checkConnect();
        setTimeout(getFromServer, 1500);
    } else if (key === '3'){
        checkConnect();
        setTimeout(convertTemp, 1500);
    } else if (key === '4'){
        checkConnect();
        setTimeout(changeDisplay, 1500);
    }
}

// This function changes the display of temperature between celsius and fahrenheit
function changeDisplay(){
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.141"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    //     var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var change = 'CHANGEUI';
    
    req.open(sendStuff, url, async);
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    console.log(change);
    req.send(change);
    console.log('status after: ' + req.status);
  
}

// This function gets a JSON from server and displays the info in the watch screen
function getFromServer(){
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.141"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var method = "GET";
    var async = true;
    var gotResponse = false;
    Pebble.sendAppMessage({ "0": 'Getting temperature...' });
    
    req.open(method, url, async);
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    
    req.onload = function(e) {
        console.log('status: ' + req.status);
        // see what came back
        
        var response = JSON.parse(req.responseText);
        console.log("GOT SOMETHING");
        console.log(JSON.stringify(response));
        if (response) {
            gotResponse = !gotResponse;
//           JSON is parsed and all values are saved as variables
            console.log(response.temp);
            var temperature = response.temp;
            console.log(temperature);
            var high = response.high;
            console.log(high);
            var low = response.low;
            console.log(low);
            var average = response.average;
            console.log(average);
            var lastmotion = response.lastmotion;
            console.log(lastmotion);
            var arduino = response.arduino;
            console.log(arduino);
            if(lastAttempt === false){
                   lastAttempt = !lastAttempt;
            }  
            if(arduino === 'no'){
              if(sensorWork === true){
                sensorWork = !sensorWork;
              }
                
            } else{
              if(sensorWork === false){
                sensorWork = !sensorWork;
              }
                
            }
            Pebble.sendAppMessage({ "0": 'Temp: '+ temperature + '\nHi: ' + high + '\nLow: ' + low  + '\nAverage: ' + average + '\nLast Motion: ' + lastmotion + " sec"});
            
        }

    };
    
    setTimeout(function(){
               if(gotResponse === false){
                 if(lastAttempt === true){
                   lastAttempt = !lastAttempt;
                 }              
               Pebble.sendAppMessage({ "0": 'Server Connection Failed!' });
               req.abort();
               }
               }, 3000);
    req.send(null);
    
}

// This function sends a standby message to the ardunino is it's running, a resume if its in standby
function sendStandBy(){
    
    if(standbymode !== true){
        Pebble.sendAppMessage({ "0": 'sending standby!' });
        standbymode = true;
    } else{
        Pebble.sendAppMessage({ "0": 'resuming activity!' });
        standbymode = false;
    }
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.141"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    //     var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var standby = 'STANDBY';
    
    req.open(sendStuff, url, async);
    console.log(standby);
    req.send(standby);
  
    
    
}

// This function sends a convert request to the server, changing between fahrenheit and celsius
function convertTemp(){
    
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.141"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    //     var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var convert = 'CONVERT';
    
    req.open(sendStuff, url, async);
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    console.log(convert);
    req.send(convert);
    console.log('status after: ' + req.status);
    
    
}

// This function checks whether the last connect attempt had any issues
function checkConnect(){
    
    if(lastAttempt === false){
        Pebble.sendAppMessage({ "0": 'What happed to the server?' });
    }
    if(sensorWork === false){
        Pebble.sendAppMessage({ "0": 'Check your sensor!' });
    }
    if(lastAttempt === true && sensorWork === true){
        Pebble.sendAppMessage({ "0": 'All is well!' });
    }
    
    
}

// This function uses the OpenWeather API to get the current weather at Philly
function getCity(){
    var key = '863fad9850866cd53fbf3c264f6d4631';
    var req = new XMLHttpRequest();
    var msg = 'Empty Msg!';
    var temp = 0;
    //   var celsius = 0;
    var sendS = false;
    var gotResponse = false;
    req.open('GET', 'http://api.openweathermap.org/data/2.5/weather?' +
             'lat=' + 39.98 + '&lon=' + -75.19  + '&cnt=1&appid=' + key, true);
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    req.onload = function(e) {
        //      console.log("in onload");
        msg = "failed";
        var response = JSON.parse(req.responseText);
        console.log("returned something!");
        if (response) {
            gotResponse = !gotResponse;
            if(lastAttempt === false){
                   lastAttempt = !lastAttempt;
            }  
            if (response.name) {
                msg = response.name + ": " + response.weather[0].description;
                temp = response.main.temp;
                console.log(temp);
                celsius = parseFloat(temp) - 273.15;
                console.log(celsius);
                //         msg = "Wow very text much long not ok wow"
                //         msg = response.weather[0].description;
                sendS = true;
            } else msg = "nothing";
        }
        console.log(msg);
        console.log('celsius is' + celsius);
        // sends message back to pebble
        Pebble.sendAppMessage({ "0": msg });
    };
    setTimeout(function(){
               if(gotResponse === false){
//                lastAttempt = !lastAttempt;
               Pebble.sendAppMessage({ "0": 'OpenWeather Connection Failed!' });
               req.abort();
               }
               }, 3000);
    req.send(null);
    //   req.close();
    
    
    
}

// This function sends the outside temperature to the server for it to make comparison
function sendToServer() {
    
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.141"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var sendStuff = "POST";
    var async = true;
    var temp = celsius;
    var gotResponse = false;
    console.log('C is '+celsius);
    temp = Math.round(temp * 100) / 100;
    console.log('temperature is ' + temp);
    var strTemp = temp.toString();
    var tempMsg = 'OUTSIDE TEMP '+ strTemp;
    console.log(tempMsg);
    req.open(sendStuff, url, async);
    req.onload = function(e){
      console.log('msg sent!');
      gotResponse = !gotResponse;
    };
    
    req.send(tempMsg);
    setTimeout(function(){
               if(gotResponse === false){
               if(lastAttempt === true){
                   lastAttempt = !lastAttempt;
               }  
               Pebble.sendAppMessage({ "0": 'Server Connection Failed!' });
               req.abort();
               }
               }, 3000);
    
    
}
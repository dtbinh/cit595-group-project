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

function checkPayload(e){
    for (var key in e.payload) break;
    console.log(JSON.stringify(e));
    
    if(key === '0'){
        checkConnect();
        setTimeout(getCity, 1500);
        setTimeout(sendToServer, 3000);
    } else if(key === '1'){
        sendStandBy();
    } else if (key === '2'){
        getFromServer();
    }
}

function getFromServer(){
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.104.68"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var method = "GET";
    var async = true;
    Pebble.sendAppMessage({ "0": 'Getting temperature...' });
    
    //   GET REQUEST BELOW
    //     req.onprogress = function () {
    
    //       console.log('readystate: ' + req.readyState);
    //       console.log('status: ' + req.status);
    // //       var response = JSON.parse(req.responseText);
    // //       console.log(JSON.stringify(response));
    
    //     };
    req.open(method, url, async);
    console.log('here!');
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    
    req.onload = function(e) {
        console.log('in onload!');
        console.log('status: ' + req.status);
        // see what came back
        //       var msg = "no response";
        
        var response = JSON.parse(req.responseText);
        console.log("GOT SOMETHING");
        console.log(JSON.stringify(response));
        if (response) {
            console.log(response.temp);
            //         if (response.temp) {
            var temperature = response.temp;
            var high = response.high;
            var low = response.low;
            var average = response.average;
            var lastmotion = response.lastmotion;
            var arduino = response.arduino;
            lastAttempt = true;
            if(arduino === 'no'){
              sensorWork = false;
            } else{
              sensorWork = true;
            }
          Pebble.sendAppMessage({ "0": 'Temp: '+ temperature + 'Hi: ' + high + 'Low: ' + low + 'Average: ' + average + 'LastMot: ' + lastmotion });
            
            //         }
            // sends message back to pebble
            
        }
        //       else{
        //           Pebble.sendAppMessage({ "0": 'uh-oh...' });
        //           lastAttempt = false;
        //           Pebble.sendAppMessage({ "0": 'phone connection lost!' });
        //         }
        
    };
    
    setTimeout(function(){
               if(req.readyState === 1){
               lastAttempt = false;
               Pebble.sendAppMessage({ "0": 'Server Connection Failed!' });
               req.abort();
               }
               }, 3000);
    req.send(null);
    //     req.close();
    
}

function sendStandBy(){
  
    if(standby !== true){
      Pebble.sendAppMessage({ "0": 'sending standby!' });
      standbymode = true;
    } else{
      Pebble.sendAppMessage({ "0": 'resuming activity!' });
      standbymode = false;
    }
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.104.68"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    //     var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var standby = 'STANDBY';
    
    req.open(sendStuff, url, async);
    console.log('readystate: ' + req.readyState);
    console.log('status: ' + req.status);
    console.log(standby);
    req.send(standby);
    console.log('status after: ' + req.status);

    
}

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

function getCity(){
    var key = '863fad9850866cd53fbf3c264f6d4631';
    var req = new XMLHttpRequest();
    var msg = 'Empty Msg!';
    var temp = 0;
    //   var celsius = 0;
    var sendS = false;
    
    //   req.addEventListener("progress", updateProgress);
    //   req.addEventListener("load", transferComplete);
    //   req.addEventListener("error", transferFailed);
    //   req.addEventListener("abort", transferCanceled);
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
            lastAttempt = true;
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
    req.send(null);
    //   req.close();
    
    
    
}


function sendToServer() {
    
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.104.68"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var sendStuff = "POST";
    var async = true;
    var temp = celsius;
    console.log('C is '+celsius);
    temp = Math.round(temp * 100) / 100;
    console.log('temperature is ' + temp);
    var strTemp = temp.toString();
    var tempMsg = 'OUTSIDE TEMP '+ strTemp;
    console.log(tempMsg);
    req.open(sendStuff, url, async);
    console.log(lastAttempt);
    console.log(req.status);
    
    req.send(tempMsg);
    //     req.close();
    setTimeout(function(){
               if(req.readyState === 1){
               lastAttempt = false;
               Pebble.sendAppMessage({ "0": 'Server Connection Failed!' });
               req.abort();
               }
               }, 4000);
    
    
    //   }
}
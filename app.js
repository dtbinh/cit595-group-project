var lastAttempt = true;
var sensorWork = true;
var celsius = 0;

Pebble.addEventListener("appmessage",
  function(e) {
    console.log(JSON.stringify(e));
    checkPayload(e);
    
 }
);

function checkPayload(e){
    for (var key in e.payload) break;
    if(key === '0'){
      checkConnect();
      setTimeout(getCity, 1500);
//        setTimeout(checkConnect, 2000);
      setTimeout(sendToServer, 3000);
    } else if(key === '1'){
       sendStandBy();
    }
}

function sendStandBy(){
    Pebble.sendAppMessage({ "0": 'sending standby!' });
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.173"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var standby = 'STANDBY';

    req.open(sendStuff, url, async);
    
    console.log(req.status);
    console.log(standby);
    req.send(standby);
//     console.log('current temp is ' + temp);
    req.onload = function(e) {
      // see what came back
      var msg = "no response";
  
      var response = JSON.parse(req.responseText);
      console.log("GOT SOMETHING");
      console.log(JSON.stringify(response));
      if (response) {
        if (response.name) {
          msg = response.name;
          lastAttempt = true;
          if(msg === 'no sensor'){
            sensorWork = false;
          }
        } 
        // sends message back to pebble
        Pebble.sendAppMessage({ "0": msg });
      } else{
          Pebble.sendAppMessage({ "0": 'uh-oh...' });
          lastAttempt = false;       
          Pebble.sendAppMessage({ "0": 'phone connection lost!' });
        }
      req.open(method, url, async);
      req.send(null);
    };

}

function checkConnect(){
  var msg1;
  var msg2;
  if(lastAttempt === false){
    msg1 = 'What happed to your phone?';
      Pebble.sendAppMessage({ "0": msg1 });
  }
  if(sensorWork === false){
    msg2 = 'Check your sensor!';
      Pebble.sendAppMessage({ "0": msg2 });
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

  req.onload = function(e) {
//      console.log("in onload");
    msg = "failed";
    var response = JSON.parse(req.responseText);
    console.log("returned something!");
    if (response) {
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
  req.close();

//   if(sendS === true){
//     setTimeout(sendToServer(celsius), 3000);
//   }
  

}


function sendToServer() {

    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.173"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var method = "GET";
    var sendStuff = "POST";
    var async = true;
    var temp = celsius;
    console.log('C is '+celsius);
//     var temp = getCity();
    temp = Math.round(temp * 100) / 100;
    console.log('temperature is ' + temp);
    var strTemp = temp.toString();
    var tempMsg = 'OUTSIDE TEMP '+ strTemp;
    console.log(tempMsg);
    req.open(sendStuff, url, async);
    console.log(lastAttempt);

    console.log(req.status);

    req.send(tempMsg);
  
    Pebble.sendAppMessage({ "0": 'Now comaparing temperature...' });

  
//   GET REQUEST BELOW
//     console.log('current temp is ' + temp);
//     console.log('readystate: ' + req.readyState);
//     console.log('status: ' + req.status);
    req.onprogress = function () {
      console.log('readystate: ' + req.readyState);
      console.log('status: ' + req.status);
//       var response = JSON.parse(req.responseText);
//       console.log(JSON.stringify(response));

    };
    req.onload = function(e) {
      
//        if (req.readyState==4 && xhr.status==200)
      console.log('status in onload' + req.status);
      if(req.status != 200){
        lastAttempt = false;
      } else{
        lastAttempt = true;
      }
      // see what came back
      var msg = "no response";
  
      var response = JSON.parse(req.responseText);
      console.log("GOT SOMETHING");
      console.log(JSON.stringify(response));
  //     if(JSON.stringify(response) === 'none'){
  //        Pebble.sendAppMessage({ "0": 'no response from server!' });
  //     }
      console.log(req.status);

      if (response) {
        if (response.name) {
          msg = response.name;
          lastAttempt = true;
          if(msg === 'no sensor'){
            sensorWork = false;
          }
        } 
        // sends message back to pebble
        Pebble.sendAppMessage({ "0": msg });
      } else{
          Pebble.sendAppMessage({ "0": 'uh-oh...' });
          lastAttempt = false;
        
          Pebble.sendAppMessage({ "0": 'phone connection lost!' });
        }
      req.open(method, url, async);
//       console.log('readystate: ' + req.readyState);
//       console.log('status: ' + req.status);
      req.send(null);
      req.close();
    };
//   }
}
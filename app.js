var celsius; 
var lastAttempt = true;
var sensorWork = true;

Pebble.addEventListener("appmessage",
  function(e) {
//     console.log(e.payload);
    console.log(JSON.stringify(e));
//     test();
//     getCity();
//     getTemp();
//     setTimeout(checkConnect, 2000);
//     setTimeout(sendToServer, 3000);
    checkPayload(e);
    
 }
);

function checkPayload(e){
    for (var key in e.payload) break;
    if(key === '0'){
       getCity();
       setTimeout(checkConnect, 2000);
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


}

function getCity(e){
  var key = '863fad9850866cd53fbf3c264f6d4631';
  var req = new XMLHttpRequest();
  var msg = 'Empty Msg!';
//   for (var Pkey in e.payload) break;
//   if(Pkey === '0'){
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
//         temp = response.main.temp;
//         msg = "Wow very text much long not ok wow"
//         msg = response.weather[0].description;
      } else msg = "nothing";
    }
    console.log(msg);
    // sends message back to pebble
    Pebble.sendAppMessage({ "0": msg });
  };
  req.send(null);
  return msg;
//   }
}

function getTemp(){
  var key = '863fad9850866cd53fbf3c264f6d4631';
  var req = new XMLHttpRequest();
  var msg = 'No Temp!';
//   var celsius;  
//   for (var Pkey in e.payload) break;
//   if(Pkey === '0'){
  req.open('GET', 'http://api.openweathermap.org/data/2.5/weather?' +
  'lat=' + 39.98 + '&lon=' + -75.19  + '&cnt=1&appid=' + key, true);

  req.onload = function(e) {
    msg = "failed";
    var response = JSON.parse(req.responseText);
    console.log("returned something!");
//     console.log(JSON.stringify(response));
    if (response) {
      if (response.name) {
        msg = response.main.temp;
        celsius = parseFloat(msg) - 273.15;
        console.log(celsius);
        return msg;
      } else msg = "nothing";
    }
    // sends message back to pebble
//     Pebble.sendAppMessage({ "0": msg });
  };
  req.send(null);
  
  return celsius;
//   }
}

function sendToServer() {
//   for (var Pkey in e.payload) break;
//   if(Pkey === '0'){
    var req = new XMLHttpRequest();
    var ipAddress = "158.130.110.173"; // Hard coded IP address
    var port = "3001"; // Same port specified as argument to server
    var url = "http://" + ipAddress + ":" + port + "/";
    var method = "GET";
    var sendStuff = "POST";
    var async = true;
  //   var city = getCity();
    var temp = getTemp();
    temp = Math.round(temp * 100) / 100;
    console.log('temperature is ' + temp);
    var strTemp = temp.toString();
    Pebble.sendAppMessage({ "0": 'Now comaparing temperature...' });
  //   console.log(strTemp);
    req.open(sendStuff, url, async);
    console.log(req.status);
    req.send(strTemp);
    console.log('current temp is ' + temp);
    req.onload = function(e) {
      // see what came back
      var msg = "no response";
  
      var response = JSON.parse(req.responseText);
      console.log("GOT SOMETHING");
      console.log(JSON.stringify(response));
  //     if(JSON.stringify(response) === 'none'){
  //        Pebble.sendAppMessage({ "0": 'no response from server!' });
  //     }
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
//   }
}
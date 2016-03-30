Pebble.addEventListener("appmessage",
  function(e) {
//     console.log("teseteteststes");
    useOpenWeather();
//     sendToServer();
 }
);

function useOpenWeather(){
  var Key = '863fad9850866cd53fbf3c264f6d4631';
  var req = new XMLHttpRequest();
  
  req.open('GET', 'http://api.openweathermap.org/data/2.5/weather?' +
  'lat=' + 39.98 + '&lon=' + -75.19  + '&cnt=1&appid=' + Key, true);
//   req.open('GET', 'http://api.openweathermap.org/data/2.5/forecast/city?id=524901&appid=863fad9850866cd53fbf3c264f6d4631', true);
//   var source = 'http://api.openweathermap.org/data/2.5/forecast/city?id=524901&appid=863fad9850866cd53fbf3c264f6d4631';

  req.onload = function(e) {
//      console.log("in onload");
    var msg = "failed";
    var response = JSON.parse(req.responseText);
    console.log("returned something!");
    if (response) {
      if (response.name) {
        msg = response.name + ": " + response.weather[0].description;
//         msg = "Wow very text much long not ok wow"
//         msg = response.weather[0].description;
      } else msg = "nothing";
    }
    console.log(response.name);
    // sends message back to pebble
    Pebble.sendAppMessage({ "0": msg });
  };
  req.send(null);
}

function sendToServer() {
  var req = new XMLHttpRequest();
  var ipAddress = "158.130.110.173"; // Hard coded IP address
  var port = "3001"; // Same port specified as argument to server
  var url = "http://" + ipAddress + ":" + port + "/";
  var method = "GET";
  var async = true;
  useOpenWeather();

  req.onload = function(e) {
    // see what came back
    var msg = "no response";
    var response = JSON.parse(req.responseText);
    console.log("GOT SOMETHING");
    if (response) {
      if (response.name) {
        msg = response.name;
      } else msg = "noname";
    }
    // sends message back to pebble
    Pebble.sendAppMessage({ "0": msg });
  };
  req.open(method, url, async);
  req.send(null);
}
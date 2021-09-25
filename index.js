
const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const ss = require('socket.io-stream');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

// function onConnection(socket){
//   var filePath = "/public/sample.pdf";
//   socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));



// //   fs.readFile(__dirname + filePath , function (err,data){
// //     res.contentType("application/pdf");
// //     res.send(data);
// // });


// }


app.get('/showpdf', function (req, res) {


  var filePath = "/public/test.pdf";

  fs.readFile(__dirname + filePath, function (err, data) {
    res.contentType("application/pdf");
    res.send(data);
  });

});

var clickCount = 1;
var scale = 1.8;


io.on('connection', function (socket) {

  var ids = socket.id;
  console.log(ids);
  var filePath = "/test.pdf";
  socket.emit("sendfile", { filePath, clickCount});


  socket.on('nextclicked', function (data) {

    // console.log('test'+ui);
    var page_cnt = data;
    if (clickCount >= page_cnt) {
      return false;
    }
    clickCount++;

    // var filePath = "/sample.pdf";
    io.emit('buttonUpdate', { filePath, clickCount, scale });
  });


  socket.on('previousclicked', function (data) {

    if (clickCount <= 1) {
      return;
    }
    clickCount--;

    io.emit('buttonUpdate', { filePath, clickCount, scale });
  });

  // -----------ZOOM IN -----------------
  socket.on('zoominclicked', function (data) {

    scale = scale + 0.25;

    io.emit('buttonUpdate', { filePath, clickCount, scale });
  });


  socket.on('zoomoutclicked', function (data) {

    if (scale <= 0.25) {
      return;
    }
    scale = scale - 0.25;
    io.emit('buttonUpdate', { filePath, clickCount, scale });
  });


  socket.on('scrolled', function (data) {

    // console.log(data);


    io.emit('scrolling', {data,ids});
  });


});


// io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));


const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ss = require('socket.io-stream');
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


  var filePath = "/public/sample.pdf";

  fs.readFile(__dirname + filePath, function (err, data) {
    res.contentType("application/pdf");
    res.send(data);
  });

});

var clickCount = 1;
io.on('connection', function (socket) {

  var filePath = "/sample.pdf";
  socket.emit("sendfile", { filePath, clickCount });

 

  socket.on('nextclicked', function (data) {
    clickCount++;


    var total = document.getElementById('page_count');
    console.log(total);

    io.emit('buttonUpdate', { filePath, clickCount });
  });


  socket.on('previousclicked', function (data) {

    if (clickCount <= 1) {
      return;
    }
    clickCount--;

    io.emit('buttonUpdate', { filePath, clickCount });
  });


});


// app.post('/url/pdf', function(req, res, next) {
//   var stream = fs.readStream('/location/of/pdf');
//   var filename = "WhateverFilenameYouWant.pdf"; 
//   // Be careful of special characters

//   filename = encodeURIComponent(filename);
//   // Ideally this should strip them

//   res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
//   res.setHeader('Content-type', 'application/pdf');

//   stream.pipe(res);
// });





// io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

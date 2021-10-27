
const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const ss = require('socket.io-stream');
const port = process.env.PORT || 3000;

const mysql = require('mysql2');
//const mysql = require('mysql');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var session  = require('express-session');

app.use(express.json());
app.use(cookieParser());

var sess = '';

//const encoder = bodyParser.urlencoded();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

const conn = mysql.createConnection({
    host: "localhost",
    //user: "root",
    //password: "",
    user: "moondap",
    password: "v8YCj~R/8gL$cU",
    database: "moondap",
    socketPath: "/var/run/mysqld/mysqld.sock",
    insecureAuth : true
});


const oneDay = 1000 * 60 * 60 * 24;
  app.use(session({
    secret: 'U_DF@J/CP+dv5Q(^',
    resave: false,
    saveUninitialized: true,
    //cookie: { secure: true }
    cookie: { maxAge: oneDay },

  }));

conn.connect(function(error){
  if (error) throw error
  else
  console.log("database connected successfully..");

});

const isAuth = (req,res,next)=>{
  if(req.session.isAuth)
  {
    next();
  }
  else
  {
    res.redirect("/");
  }
}

app.post("/",function(req,res){

  var email = req.body.email;
  var pwd = req.body.pwd;

  conn.query("select * from md_users where email = ? and password = ? ",[email,pwd],function(error,result,fields){

    if(result.length >0)
    {
        var user_data = {
           'user_id':result[0].id,
           'email': result[0].email,
        }

        console.log(user_data);
       
        req.session.isAuth = true;
        req.session.user_id = result[0].id;
        req.session.email = result[0].email;
        res.redirect("/home");
        //res.render('home',{title:'Home'});
    }
    else
    {
       console.log('Wrong credentials..');
       res.redirect("/");
    }

    res.end();

  });

});

app.post("/logout",function(req,res){
   req.session.destroy();
   res.redirect("/");
});


app.get("/home",isAuth,function(req,res){
    //res.redirect('home.html');
    //console.log(req.session);
    res.sendFile(__dirname + '/public/home.html',{title:'Home'});
});

app.post("/create_room",function(req,res){

     var room_name = req.body.room_name;
     var create_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

     var sql = "insert into md_room values (null,'"+room_name+"','active','"+req.session.user_id+"','"+create_date+"')";

     conn.query(sql,function(err,rows,fields){

      if(err)
      {
          throw err;
      }
      else
      {
        //console.log(rows.insertId);
        var last_id = rows.insertId;

        var sql = "insert into md_participants values (null,'"+last_id+"','"+req.session.user_id+"','host')";
        conn.query(sql);
        req.session.role = 'host';
        //console.log(req.session);
        res.redirect("/home");
      }

     })



});




// function onConnection(socket){
//   var filePath = "/public/sample.pdf";
//   socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));



// //   fs.readFile(__dirname + filePath , function (err,data){
// //     res.contentType("application/pdf");
// //     res.send(data);
// // });


// }


/* var clickCount = 1;
var scale = 1.8;

io.on('connection', function (socket) {

  var filePath = "/test.pdf";

  io.to("room_12345").emit("sendfile", { filePath, clickCount});
  socket.on('scrolled', function (data) {
    // console.log(data);
    io.emit('scrolling', {data,ids});
  });
  
}); */





app.get('/showpdf', function (req, res) {


  var filePath = "/public/test.pdf";

  fs.readFile(__dirname + filePath, function (err, data) {
    res.contentType("application/pdf");
    res.send(data);
  });

});

var clickCount = 1;
var scale = 1.8;
var role = '';
var chk_status = '';



io.on('connection', function (socket) {

  //socket.to("some room").emit("some event");

  var ids = socket.id;
  //console.log(ids);
  var filePath = "/test.pdf";

  console.log('No of IDs  =  ' + ids.length);
  
  socket.emit("sendfile", { filePath, clickCount, role});


  socket.on('nextclicked', function (data,role,chk_status) {

    // console.log('test'+ui);
    /* var page_cnt = data;
    if (clickCount >= page_cnt) {
      return false;
    }
    clickCount++; */

    // var filePath = "/sample.pdf";
    console.log("Status is : "+ chk_status);

    if(role == 'host' && chk_status == 1)
    { 
        var page_cnt = data;
        if (clickCount >= page_cnt) {
          return false;
        }
        clickCount++;
        io.emit('buttonUpdate', { filePath, clickCount, scale });
    }
    else
    {
        if (clickCount >= page_cnt) {
          return false;
        }
        clickCount++;
        io.emit('buttonUpdate', { filePath, clickCount, scale });
    }
    //io.emit('buttonUpdate', { filePath, clickCount, scale });
  });


  socket.on('previousclicked', function (data) {

    /* if (clickCount <= 1) {
      return;
    }
    clickCount--; */

    if(data == 'host' && chk_status == 1)
    { 
      if (clickCount <= 1)
      {
        return;
      }
         clickCount--;
        io.emit('buttonUpdate', { filePath, clickCount, scale });
    }
    else
    {
      if (clickCount <= 1)
      {
        return;
      }
      clickCount--;
      io.emit('buttonUpdate', { filePath, clickCount, scale });
    }

    //io.emit('buttonUpdate', { filePath, clickCount, scale });
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


  socket.on('scrolled', function (data,role) {

       // console.log(data);
       if(role == 'host')
      { 
        io.emit('scrolling', {data,ids});
      }
       //io.emit('scrolling', {data,ids});
  });


  socket.on('mouse_activity',function(data){
    console.log(data);
  })

  socket.on('get_room_id',function(data){

    //console.log(data);

       app.get('/home/'+data,isAuth, function (req, res) {
       //res.redirect('room.html');
       role = req.session.role;
       //console.log(req.session);
       if(role != 'host')
       {
          var sql = "insert into md_participants values (null,'"+data+"','"+req.session.user_id+"','viewer')";
          conn.query(sql);
          req.session.role = 'viewer';
       }
       res.sendFile(__dirname + '/public/room.html');
       var filePath = "/test.pdf";
       io.to(data).emit("sendfile", { filePath, clickCount, role});  
    });

  });


});


// io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));

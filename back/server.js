const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
var path = require('path');
const morgan = require('morgan');
const app = express();
const session = require('express-session');
const https = require('http').Server(app);
const io = require('socket.io')(https);

const mysql = require('mysql2');
//const mysql = require('mysql');

const fileUpload = require('express-fileupload');


app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './app/public/assets/uploads/hwpuploads'
}));

const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

// database
const db = require("./app/models");
// const Role = db.role;

db.sequelize.sync();


app.use(session({
  store: db.sequelizeSessionStore,
  name: 'MyStrange-Cookie',
  secret: 'share-app',
  // resave: false,
  // saveUninitialized: true,
  resave: true,
  saveUninitialized: true,
  rolling: true, // <-- Set `rolling` to `true`
  cookie: {
    maxAge: 1 * 60 * 60 * 1000
  }
}))

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'app/public/assets')));
// app.use(express.static(path.join(__dirname, 'app/public/views')));
app.set('views', path.join(__dirname, 'app/public/views'));

app.use('app/public/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

app.use(morgan('combined'));



app.use(function (req, res, next) {
  res.locals.email = req.session.email;
  next();
});


// routes
require('./app/routes/index')(app);
require('./app/routes/room')(app);
require('./app/routes/docs')(app);
// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);

const conn = mysql.createConnection({
  host: "localhost",
  // user: "root",
  // password: "",
  user: "moondap",
  password: "v8YCj~R/8gL$cU",
  database: "moondap",
  socketPath: "/var/run/mysqld/mysqld.sock",
  // insecureAuth : true

  /* user: "demonodeusr",
  password: "Djxx$qlu61",
  database: "demonodedb",
  socketPath: "/var/run/mysqld/mysqld.sock",
  insecureAuth : true */
});



var role = '';
var roomID = '';
var sharing_user_type = '';
var filePath = '';

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  }
  else {
    res.redirect("/");
  }
}
const users = {};
io.on('connection', function (socket) {

  var clickCount = 1;
  var scale = 1.5;
  var chk_status = '';
  var presenter_user = '';
  var filepath = '';


  //socket.to("some room").emit("some event");

  //filePath = "/uploads/pdf/test.pdf";


  var ids = socket.id;


  socket.on("join", async (data) => {
    room = data.room;
    sharing_user_type = data.share_user_type;
    presenter_user = data.user;
    socket.join(room);

    socket.user_id = data.user;

    socket.user_name = data.user_name;
    socket.image = data.image;


    // users[socket.id] = data.user;

    // if (!users[socket.user_id]) {
    //   users[socket.user_id] = 0;
    // }
    // ++users[socket.user_id];

    // updateUsers();



    // console.log(users);

    const sockets = await io.in(room).fetchSockets();





    var room_users = [];
    var users_data = [];

    var user_ids = [];
    sockets.forEach(function (client) {
      room_users.push(client.id);
      user_ids.push(client.user_id);

      var obj = {
        name: client.user_name,
        image: client.image
      };
      users_data.push(obj)
    });





    const result = users_data.reduce((acc, curr) => {
      const { name, image } = curr;
      const isPresent = acc.find((el) => el.name === name);
      if (!isPresent) acc = [...acc, { name, image }];
      // else ;
      return acc;
    }, []);


    users_data = result;
    var total_users = result.length;

    io.to(room).emit('usersDataUpdate', { room_users, total_users, users_data });

    console.log('room  =  ' + room);
    console.log('clickCount  =  ' + clickCount);
    console.log('role  =  ' + role);
    console.log('scale  =  ' + scale);

    conn.query("select * from participants where sharing_user_type = ? and room_id = ? ", ['presenter', room], function (error, result, fields) {

      if (result.length > 0) {
        presenter_user = result[0].user_id;

        conn.query("select * from attachments where room_id = ? and user_id = ? ", [room, presenter_user], function (error, result1, fields) {

          if (result1.length > 0) {
            filePath = "/uploads/hwpuploads/pdf/" + result1[0].file_name;
            console.log("curr file is : " + filePath);
            console.log("curr user is : " + data.user);
            io.to(room).emit("sendfile", { filePath, clickCount, role, scale, sharing_user_type });
          } else {
            console.log('Please upload document first');
          }

        });

      }


    });



    // io.to(room).emit("sendfile", { filePath, clickCount, role, scale, sharing_user_type });

    socket.on('leave', function (rrid, id) {


      const index = room_users.indexOf(id);
      if (index > -1) {
        room_users.splice(index, 1);
        users_data.splice(index, 1);
        total_users = room_users.length
      }

      try {
        console.log('[socket]', 'leave room :', rrid);
        socket.leave(rrid);
        // socket.to(rrid).emit('userleft', id);
        io.to(rrid).emit('usersDataUpdate', { room_users, total_users, users_data });

      } catch (e) {
        console.log('[error]', 'leave room :', e);
        socket.emit('error', 'couldnt perform requested action');
      }



    });

    socket.on('disconnect', () => {
      index = room_users.indexOf(socket.id);
      if (index > -1) {
        room_users.splice(index, 1);
        users_data.splice(index, 1);
        total_users = room_users.length
      }

      try {
        console.log('[socket]', 'leave room :', room);
        socket.leave(room);
        // socket.to(room).emit('userleft', socket.id);
        io.to(room).emit('usersDataUpdate', { room_users, total_users, users_data });

      } catch (e) {
        console.log('[error]', 'leave room :', e);
        socket.emit('error', 'couldnt perform requested action');
      }

      console.log('Socket disconnected: ')
    })








    //console.log('Share type xx  =  ' + sharing_user_type);

    socket.on('nextclicked', function (data, role, chk_status, share_type, rrid) {

      // console.log("room1 is : " + roomID);
      console.log("count is : " + data);

      //if (role == 'host' && chk_status == 1) {
        console.log(clickCount)
       console.log('--------------'+chk_status)
       console.log('--------------'+share_type)
      if (share_type == 'presenter' && chk_status == 1) {
        var page_cnt = data;
        if (clickCount >= page_cnt) {
          return false;
        }
        clickCount++;
        console.log('--------------'+chk_status)

        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
        // io.sockets.in(roomID).emit('buttonUpdate', { filePath, clickCount, scale });
      }
      else {
        if (clickCount >= page_cnt) {
          return false;
        }
        clickCount++;

        console.log('--------\\\\------'+chk_status)
        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
        //  io.sockets.in(roomID).emit('buttonUpdate', { filePath, clickCount, scale });
      }

    });

    socket.on('previousclicked', function (data, share_type, chk_status, rrid) {

      if (share_type == 'presenter' && chk_status == 1) {
        if (clickCount <= 1) {
          return;
        }
        clickCount--;
        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      }
      else {
        if (clickCount <= 1) {
          return;
        }
        clickCount--;
        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      }

    });

    // -----------ZOOM IN -----------------
    socket.on('zoominclicked', function (role, chk_status, rrid) {


      if (role == 'host' && chk_status == 1) {

        scale = scale + 0.25;

        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      } else {
        scale = scale + 0.25;

        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      }
    });


    socket.on('zoomoutclicked', function (role, chk_status, rrid) {
      if (role == 'host' && chk_status == 1) {
        if (scale <= 0.25) {
          return;
        }
        scale = scale - 0.25;
        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      } else {
        if (scale <= 0.25) {
          return;
        }
        scale = scale - 0.25;
        io.to(rrid).emit('buttonUpdate', { filePath, clickCount, scale });
      }
    });


    socket.on('scrolled', function (scrollPosition, role, sharing_user_type, rrid) {

      if (sharing_user_type == 'presenter') {
        io.to(rrid).emit('scrolling', { scrollPosition, ids });
      }
      
    });


  });


  console.log('No of IDs  =  ' + ids.length);

  socket.on('mouse_activity', function (data) {
    console.log(data);
  })

  //-------------------------share own pdf----------------------------//

  socket.on('get_own_pdf', function (room_id, curr_user_id, role, share_type) {

    console.log("Current user ID : " + curr_user_id);
    console.log("Room ID : " + room_id);

    conn.query("select * from attachments where user_id = ? ", [curr_user_id], function (error, result, fields) {

      if (result.length > 0) {
        filePath = "/uploads/hwpuploads/pdf/" + result[0].file_name;
        fileType = result[0].file_type;
        console.log("User ID : " + curr_user_id);
        console.log("New File : " + filePath);
        console.log("Role : " + role);
        console.log("user type is : " + share_type);

        if (share_type == 'none') {

          conn.query("select * from participants where sharing_user_type = ? and room_id = ?", ['presenter', room_id], function (error, result, fields) {

            sharing_user_type = 'presenter';

            if (result.length > 0) {

              presenter_user_id = result[0].user_id;
              sharing_user_type = result[0].sharing_user_type;

              if (sharing_user_type == 'presenter') {
                console.log("presenter update....");
                var sql = "update participants set sharing_user_type = 'none' where room_id = '" + room_id + "' and user_id = '" + presenter_user_id + "'";
                conn.query(sql, function (err, rows, fields) {

                  if (err) {
                    throw err;
                  }
                  else {
                    //var last_id = rows.insertId;
                    var updatesql = "update participants set sharing_user_type = 'presenter' where room_id = '" + room_id + "' and user_id = '" + curr_user_id + "'";
                    conn.query(updatesql);
                  }

                });
              }
              else {
                console.log("viewer update....");
                var sql = "update participants set sharing_user_type = 'presenter' where room_id = '" + room_id + "' and user_id = '" + curr_user_id + "'";
                conn.query(sql, function (err, rows, fields) {

                  if (err) {
                    throw err;
                  }
                  else {
                    //var last_id = rows.insertId;
                    var updatesql = "update participants set sharing_user_type = 'none' where room_id = '" + room_id + "' and user_id = '" + presenter_user_id + "'";
                    conn.query(updatesql);
                  }

                });
              }

            }


          });

          io.to(room_id).emit("update_share_type", { room_id });
        }
        else {
          sharing_user_type = 'none';
          io.to(room_id).emit("update_share_type", { room_id });
        }


        clickCount = 1;
        io.to(room_id).emit("clear_canvas");
        io.to(room_id).emit("sendfile", { filePath, clickCount, role, scale, sharing_user_type });
      }
      else {
        console.log('Not Exists..');
        //res.redirect("/home");
      }

    });

  });
  //------------------------------End----------------------------------//

  socket.on("chk_reload", function (proom, role, sharing_user_type) {

    io.to(proom).emit("server_side_chk_reload");

  });

});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
https.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

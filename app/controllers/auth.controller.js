const db = require("../models");
const sequelize = require("sequelize");
// const config = require("../config/auth.config");
const User = db.user;
const Participant = db.participant;
const Attachment = db.docs;
const Room = db.room;
const bcrypt = require("bcryptjs");


exports.signup = (req, res) => {
  // Save User to Database
  sampleFile = req.files.profile_image;
  sampleFileName = Date.now() + "_" + sampleFile.name;
  uploadPath = './app/public/assets/uploads/' + sampleFileName;
  sampleFile.mv(uploadPath, function (err) {
    if (err) { throw err; }

  })
  var personInfo = req.body;
  if (!personInfo.phone || !personInfo.name || !personInfo.password || !personInfo.email) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.create({
        phone: req.body.phone,
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        user_type: 'user',
        profile_image: sampleFileName
        // profile_image: req.body.profile_image
      }).then(user => {
        res.send({ message: "You are regestered,You can login now." });
      })
        .catch(err => {
          res.send({ message: err.message });
        });

    } else {
      res.send({ message: "password is not matched" });
    }
  }
};

exports.signin = (req, res) => {
  console.log(req.body.email);
  
  User.findOne({
    where: {
      email: req.body.email
    },
    raw: true,
  }).then(user => {
    if (!user) {
      return res.send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.send({
        message: "Invalid Password!"
      });
    }

    console.log(user);
    req.session.userId = user.id;
    req.session.access = user.user_type;
    req.session.email = user.email;
    //for room data
    req.session.name = user.name;
    req.session.imageUrl = user.profile_image;

    var hour = 3600000
    req.session.cookie.expires = new Date(Date.now() + hour)
    req.session.cookie.maxAge = 100 * hour


    console.log(req.session.cookie);

    res.send({ message: "logged in!" });
    // });
  })
    .catch(err => {
      res.send({ message: err.message });
    });
};
// 
// exports.dashboard = async (req, res) => {
//   if (!req.session.userId) {
//     res.redirect('/');
//   }
//   else {


//     User.findOne({
//       where: {
//         id: req.session.userId
//       },
//       raw: true,
//     }).then(data => {
//       Participant.findAll({
//         where: {
//           user_id: req.session.userId
//         },
//         // include: [
//         //   {
//         //     model: User,
//         //     required: true
//         //   },
//         //   {
//         //     model: Attachment,
//         //     required: false
//         //   }
//         // ],
//         // group: 'Participant.room_id',
//         // attributes: [sequelize.fn('COUNT', sequelize.col('Attachment.room_id')), 'user.name', 'participant.id', 'participant.user_type', 'participant.sharing_user_type', 'participant.createdAt', 'participant.room_id', 'participant.user_id', 'user.profile_image'],
//         attributes: ['participant.room_id'],
//         raw: true,
//       }).then(participant => {
//         const rooms = [];
//         participant.forEach(function (item) {
//           const x = item.room_id;
//           rooms.push(x);
//         });
//         Participant.findAll({
//           where:{
//             room_id: rooms
//           },
//           include: 
//           [
//             {
//               model: User,
//               required: true
//             },
//           ],
//           attributes: ['user.name', 'participant.id', 'participant.user_type', 'participant.sharing_user_type', 'participant.createdAt', 'participant.room_id', 'participant.user_id', 'user.profile_image'],
//           raw: true,
//         }).then(all_participant => {
//           cntArr = [];
//           all_participant.forEach(function(item, index){
//             Attachment.count({
//               where:{
//                 user_id: item.id
//               },
//             }).then(doc_count => {
//               all_participant[index][docs] = doc_count;
//               console.log(all_participant[index][docs]);
//             })
//           })
//           // console.log(all_participant);
//           if (req.session.access === 'user') {
//             pageTitle = 'User Home';
    
//             return res.render('./user/index.ejs', { "name": data.username, "email": data.email, 'title': pageTitle, "participant": all_participant });
//           }
//         });
//       });
      
//       // else {
//       //   pageTitle = 'Admin Home';
//       //   return res.render('./admin/adminstart.ejs', { "name": data.username, "email": data.email, "date": date, 'title': pageTitle });
//       // }

//     });
    

//   }

// };

exports.dashboard = async (req, res) => {
  if (!req.session.userId) {
    res.redirect('/');
  }
  else {
    const rooms = [];
    const roomname = [];
    const attachments = [];
    const cntArr = [];
    const createDates = [];
    const username = [];
    const userimage = [];
    User.findOne({
      where: {
        id: req.session.userId
      },
      raw: true,
    }).then(data => {
      Participant.findAll({
        where: {
          user_id: req.session.userId
        },
        include: 
        [
          {
            model: Room,
            required: true
          }
        ],
        attributes: ['participant.room_id', 'room.room_name'],
        order: sequelize.literal('participant.room_id DESC'),
        raw: true,
      }).then(participant => {
        participant.forEach(function (item) {
          const x = item.room_id;
          const y = item.room_name;
          rooms.push(x);
          roomname.push(y);
        });
        Participant.count({
          where:{
            room_id: rooms
          },
          group: ['room_id'],
          order: sequelize.literal('room_id DESC'),
          raw: true,
        }).then(all_participant => {
          all_participant.forEach(function(item){
            const x = item.count;
            cntArr.push(x);
          });
          Room.findAll({
            where: {
              id: rooms
            },
            include: 
            [
              {
                model: Attachment,
                required: false
              },
              {
                model: User,
                required: true
              }
            ],
            attributes: [[sequelize.fn('COUNT', sequelize.col('attachments.file_name')), 'total'], 'room.id', 'room.createdAt', 'user.profile_image', 'user.name'],
            group: ['attachments.room_id'],
            order: sequelize.literal('room.id DESC'),
            raw: true,
          }).then( docs => {
            docs.forEach(function(det){
              attachments.push(det.total);
              createDates.push(det.createdAt);
              username.push(det.name);
              userimage.push(det.profile_image);
            })
            if (req.session.access === 'user') {
              pageTitle = 'User Home';
      
              return res.render('./user/index.ejs', { "name": data.username, "email": data.email, 'title': pageTitle, 'rooms': rooms, 'roomname': roomname, 'attachments': attachments, 'user_cnt': cntArr, 'createDates': createDates, 'username': username, 'userimage': userimage});
            }
          })
          
          
        });
      });
      
      // else {
      //   pageTitle = 'Admin Home';
      //   return res.render('./admin/adminstart.ejs', { "name": data.username, "email": data.email, "date": date, 'title': pageTitle });
      // }

    });
    

  }

};
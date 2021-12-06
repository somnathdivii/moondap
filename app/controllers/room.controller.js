//const { DATE } = require("sequelize/types");
const db = require("../models");
const User = db.user;
const Room = db.room;
const Participant = db.participant;
const Attachment = db.docs;
const Mydoc = db.mydocs;


exports.create = (req, res) => {
  // Save User to Database
  var roomInfo = req.body;
  var room_no = Math.floor(Math.random() * 5) + 1;


  if (req.body.room_name == '') {
    //res.send();
    res.send({ message: "Please enter the room name." });
  }
  else {
    Room.create({
      room_name: req.body.room_name,
      room_no: room_no,
      status: 'active',
      autosaveall: req.body.autosaveall,
      allowsharing: req.body.allowsharing,
      created_by: req.session.userId

    }).then(room => {

      var last_id = room.id;

      Participant.create({
        room_id: last_id,
        user_id: req.session.userId,
        user_type: 'host',
        sharing_user_type: 'presenter',
      })

      //res.send({ message: "Room has been created." });
      req.session.user_role = 'host';
      req.session.sharing_user_type = 'presenter';
      res.redirect("/discussion?room_id=" + last_id);
    }).catch(err => {
      res.send({ message: err.message });
    });

  }
};

exports.get_room = async (req, res) => {

  room_id = req.query.room_id;
  var role = '';
  var sharing_user_type = '';
  const doc_data = [];


  if (!req.session.userId) {
    res.redirect('/');
  }
  else {
    user_id = req.session.userId;
    var user_name = req.session.name;
    var user_dp = req.session.imageUrl;

    Room.findOne({
      where: {
        id: room_id,
      },
      include: [{
        model: Participant,
        where: { user_type: 'host' }
      }],
      attributes: ['participants.user_id'],
      raw: true,
    }).then(data => {

      if (data) {
        console.log("user is--->>> : " + data.user_id);
        console.log("user2 is--->>> : " + user_id);

        if (data.user_id === user_id) {
          role = req.session.role = 'host';
          sharing_user_type = req.session.sharing_user_type = "presenter";


          Mydoc.findAll({
            where: {
              user_id: user_id,
              active: 1,
            },
            //attributes: ['participants.user_id'],
            raw: true,
          }).then(docs => {

            /* docs.forEach(function(obj){
              doc_data.push(obj.file_name);
           }); */
             //console.log("Doc data : " + JSON.stringify(docs));

             var link = req.protocol + '://' + req.get('host') + req.originalUrl;
             pageTitle = 'Moondap | Sharing Room | No Document Shared';
             return res.render('./user/shareroom.ejs', { 'title': pageTitle, 'link': link, 'user_role': role, 'user_id': user_id , 'sharing_user_type' : sharing_user_type, 'name' : user_name, 'image' : user_dp , 'doc_data' : docs});

          });


          console.log("Role is1--->>> : " + role);

          /* var link = req.protocol + '://' + req.get('host') + req.originalUrl;
          pageTitle = 'Moondap | Sharing Room | No Document Shared';
          return res.render('./user/shareroom.ejs', { 'title': pageTitle, 'link': link, 'user_role': role, 'user_id': user_id , 'sharing_user_type' : sharing_user_type, 'name' : user_name, 'image' : user_dp , 'doc_data' : doc_data}); */

        } else {

          Participant.findOne({
            where: {
              user_id: user_id,
              room_id: room_id,
              user_type: 'viewer'
            }
          }).then(participant => {
            if (!participant) {
              Participant.create({
                room_id: room_id,
                user_id: req.session.userId,
                user_type: 'viewer',
                sharing_user_type : 'none',
              })
            }
            //role = req.session.role = 'viewer';
          });

          role = req.session.role = 'viewer';
          sharing_user_type = req.session.sharing_user_type = "none";

          Mydoc.findAll({
            where: {
              user_id: user_id,
              active: 1,
            },
            //attributes: ['participants.user_id'],
            raw: true,
          }).then(docs => {

             /* docs.forEach(function(obj){
                doc_data.push(obj.file_name);
             }); */

             var link = req.protocol + '://' + req.get('host') + req.originalUrl;
             pageTitle = 'Moondap | Sharing Room | No Document Shared';
             return res.render('./user/shareroom.ejs', { 'title': pageTitle, 'link': link, 'user_role': role, 'user_id': user_id, 'sharing_user_type' : sharing_user_type, 'name' : user_name, 'image' : user_dp , 'doc_data' : docs });

          });

             var link = req.protocol + '://' + req.get('host') + req.originalUrl;
             pageTitle = 'Moondap | Sharing Room | No Document Shared';
             return res.render('./user/shareroom.ejs', { 'title': pageTitle, 'link': link, 'user_role': role, 'user_id': user_id, 'sharing_user_type' : sharing_user_type, 'name' : user_name, 'image' : user_dp , 'doc_data' : docs });

        }

        
        
      }
    });
  }
};


exports.get_current_share_type = async (req, res) => {

  user_id = req.body.user_id;
  room_id = req.body.room_id;
  //sharing_user_type = req.body.share_type;

  Participant.findOne({
    where: {
      room_id: room_id,
      //sharing_user_type: sharing_user_type,
      user_id: user_id
    },
    
    attributes: ['participant.sharing_user_type','participant.user_type'],
    raw: true,
  }).then(data => {

    console.log(data);
    console.log("Data is : " + data.sharing_user_type);
    //res.send(data.sharing_user_type);
    res.send({'sharing_user_type' : data.sharing_user_type , 'user_type' : data.user_type});

  });

};

exports.uploadedDocumentCheck = (req, res) => {
    var id = req.body.id;
    Attachment.findAll({
      where: {
        room_id: id
      },
      attributes: ['attachment.file_name'],
      raw: true
    }).then(data => {
      res.send({'data' : data});
    });
};

exports.update_attachment = async (req, res) => {

  user_id = req.body.user_id;
  room_id = req.body.room_id;
  doc_id = req.body.doc_id;
  //console.log(req.body);

  Mydoc.findAll({
      
    

      include: [{
        model: Attachment,
        where: {  room_id: room_id, user_id : user_id, doc_id : doc_id },
      }],

      attributes: ['mydoc.file_name','mydoc.file_type'],
      
      raw: true
  }).then(data =>{

    //console.log("Length is : ============" + data.length);

     if(data.length == 0 )
     {
          Attachment.create({

              user_id : user_id,
              room_id : room_id,
              doc_id : doc_id
      
              }).then(data =>{
          
              res.send({'success' : true });
            });
     }
     else
     {
         res.send({'success' : true });
     }

  });

  
  
  /* Attachment.update({
    doc_id : doc_id,
  },
  {
    // where clause
    where: { user_id: user_id , room_id: room_id },
  },
  ).then(data => {

    console.log(data);
    res.send({'success' : true });

  }); */

};

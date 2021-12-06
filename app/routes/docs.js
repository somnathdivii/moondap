const controller = require("../controllers/room.controller");
const docController = require("../controllers/doc.controller");
const db = require("../models");


var pageTitle = '';

module.exports = function (app) {

    // app.all('*', function(request, response, next) {
    // 	response.header('Access-Control-Allow-Origin', '*');
    // 	response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-File-Type, X-File-Name, X-File-Size');
    // 	response.header('Access-Control-Allow-Methods', 'POST');
    // 	next();
    // });

    // app.get('/mydocs', async (req, res, next) => {

    //     if (req.session.access === "host" || req.session.access === "user") {
    //         pageTitle = 'Moondap | Create Room';
    //         return res.render('user/mydocs.ejs', { 'title': pageTitle, 'email': req.session.email });
    //         // return await res.redirect('/dashboard');
    //     } else {
    //         pageTitle = 'Moondap | Login';
    //         return res.render('login.ejs', { 'title': pageTitle });
    //     }
    // });
    app.get('/mydocs', docController.getdocs);

	app.post("/create_room", controller.create);
	//app.get("/home/:uid/:room_id", controller.get_room);
	app.get("/home", controller.get_room);
    app.post('/uploadedDocumentCheck', controller.uploadedDocumentCheck);
    app.post('/upload_doc', docController.uploadDocument);
    app.post('/docDelete', docController.docDelete);
    app.post('/allDoc', docController.allDoc);

};
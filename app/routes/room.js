const controller = require("../controllers/room.controller");
const db = require("../models");


var pageTitle = '';

module.exports = function (app) {

    // app.all('*', function(request, response, next) {
    // 	response.header('Access-Control-Allow-Origin', '*');
    // 	response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-File-Type, X-File-Name, X-File-Size');
    // 	response.header('Access-Control-Allow-Methods', 'POST');
    // 	next();
    // });

    app.get('/create', async (req, res, next) => {

        if (req.session.access === "host" || req.session.access === "user") {
            pageTitle = 'Moondap | Create Room';
            return res.render('user/createroom.ejs', { 'title': pageTitle, 'email': req.session.email });
            // return await res.redirect('/dashboard');
        } else {
            pageTitle = 'Moondap | Login';
            return res.render('login.ejs', { 'title': pageTitle });
        }
    });

	app.post("/create_room", controller.create);
	//app.get("/home/:uid/:room_id", controller.get_room);
	app.get("/discussion", controller.get_room);
    app.post("/get_current_share_type",controller.get_current_share_type);
    app.post("/update_attachment",controller.update_attachment);



};
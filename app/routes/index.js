const { verifySignUp } = require("../middleware");
const CloudConvert = require('cloudconvert');
const controller = require("../controllers/auth.controller");
const db = require("../models");
const upload = require("../middleware/uploads");
const fs = require('fs');
const https = require('https');
var pageTitle = '';

module.exports = function (app) {

	app.all('*', function (request, response, next) {
		response.header('Access-Control-Allow-Origin', '*');
		response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-File-Type, X-File-Name, X-File-Size');
		response.header('Access-Control-Allow-Methods', 'POST');
		next();
	});

	app.all('/', async (req, res, next) => {

		if (req.session.access === "host" || req.session.access === "user") {
			console.log("Done Login");
			return await res.redirect('/dashboard');
		} else {
			pageTitle = 'Moondap | Login';
			return res.render('login.ejs', { 'title': pageTitle });
		}
	});

	app.post('/log', controller.signin);

	app.get('/registration', function (req, res, next) {
		pageTitle = 'User Registration';
		return res.render('index.ejs', { 'title': pageTitle });
		// return res.render('index', {page:'Home', menuId:'home'});
	});

	// app.post("/registration", [upload.single("profile_image"), verifySignUp.checkDuplicateUsernameOrEmail], controller.signup);
	app.post("/registration", verifySignUp.checkDuplicateUsernameOrEmail, controller.signup);

	app.get('/dashboard', controller.dashboard);

	app.get('/logout', function (req, res, next) {
		console.log("logout")
		if (req.session) {
			// delete session object
			req.session.destroy(function (err) {
				if (err) {
					return next(err);
				} else {
					return res.redirect('/');
				}
			});
		}
	});


	app.get('/convert', function (req, res, next) {

		// live keys-->	// eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjEzYTEyM2E2MThhMmY2NGRlY2ExMzlmODlkM2EyNjQzZDhhYzExMGJhNTQ4YzJhNTFlNWNmMmQ5ZGY5MzE1NzVhOThlOTA5NTNlZTllNGIiLCJpYXQiOjE2MzY0NTI2MzMuMTI4MzkzLCJuYmYiOjE2MzY0NTI2MzMuMTI4Mzk1LCJleHAiOjQ3OTIxMjYyMzMuMTAyNzUsInN1YiI6IjU0NDMzOTQ4Iiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.n1egHNbh8xQ4uJNR07eURuDBySBMdGenzuGiMWAeBJp55bIB5OtiYWYxGeshOBEhsaWDA-gLKM3vecKsIT2H1mE4Eug93X89Xn4GDbQ4tkwYez31wIbceEL5-EGPqD9jqDX6uh6fLIbl5PWCzq050TEDtkb4lmTYWYudO8B1wusZACYpQnuUbjvtjHMHjWw34mWdICTU7q3uxhX38eWeq4L6rMS0-ggmWlUTno7opXM88FGc-y-xhlTE-Hxh1cMkaERPoVXnFk2dXM11rzz1HbZWbYNFfzbaSuRHuN_Wq76qU4iUJOnQbFjWnckU5dfwLYra-sb8rwu6c9IACfPBtnKA-3Qq4EAyOcCfosEQznXXE5TFL_YgfrDEb1WmdyydjeVg5Mo_g9Z1pE2XXrFSUBVIzqwuB5zOuNK7QFv0zxbpnCEZyhTRSmAqRIhHS7ElaXBPuX4NgyUTxJvieoT3LghnKR59rec8R6LWPlu7tdc8kCg_byTC1YDhgn0KAf3at9k3wv7fXyvKct8CMmKRZyFyt7pw31w_tcbe0OYDMYzAdHmbrnop7TaH3vygTpHM4G8gt9kzB96a-ysOuDdVqRvg5YdfhrzHbbB251vkrCodJ8iJN9JzttKef-0GGy1Gm40Gbg1wgvDk0Fzi3F6jjsANN6e1B0-cuDGi3eHUxbo
		pageTitle = 'Test';
		return res.render('test.ejs', { 'title': pageTitle });
		// return res.render('index', {page:'Home', menuId:'home'});
	});
	app.post('/convert', async function (req, res, next) {


		if (!req.files || Object.keys(req.files).length === 0) {
			res.render('admin', { error: `No files were uploaded!` });
		} else {
			sampleFile = req.files.hwpfile;
			uploadPath = './app/public/assets/uploads/hwpuploads/files/' + sampleFile.name;
			sampleFile.mv(uploadPath, function (err) {
				if (err) { throw err; }
			})

			const cloudConvert = new CloudConvert('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjEzYTEyM2E2MThhMmY2NGRlY2ExMzlmODlkM2EyNjQzZDhhYzExMGJhNTQ4YzJhNTFlNWNmMmQ5ZGY5MzE1NzVhOThlOTA5NTNlZTllNGIiLCJpYXQiOjE2MzY0NTI2MzMuMTI4MzkzLCJuYmYiOjE2MzY0NTI2MzMuMTI4Mzk1LCJleHAiOjQ3OTIxMjYyMzMuMTAyNzUsInN1YiI6IjU0NDMzOTQ4Iiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.n1egHNbh8xQ4uJNR07eURuDBySBMdGenzuGiMWAeBJp55bIB5OtiYWYxGeshOBEhsaWDA-gLKM3vecKsIT2H1mE4Eug93X89Xn4GDbQ4tkwYez31wIbceEL5-EGPqD9jqDX6uh6fLIbl5PWCzq050TEDtkb4lmTYWYudO8B1wusZACYpQnuUbjvtjHMHjWw34mWdICTU7q3uxhX38eWeq4L6rMS0-ggmWlUTno7opXM88FGc-y-xhlTE-Hxh1cMkaERPoVXnFk2dXM11rzz1HbZWbYNFfzbaSuRHuN_Wq76qU4iUJOnQbFjWnckU5dfwLYra-sb8rwu6c9IACfPBtnKA-3Qq4EAyOcCfosEQznXXE5TFL_YgfrDEb1WmdyydjeVg5Mo_g9Z1pE2XXrFSUBVIzqwuB5zOuNK7QFv0zxbpnCEZyhTRSmAqRIhHS7ElaXBPuX4NgyUTxJvieoT3LghnKR59rec8R6LWPlu7tdc8kCg_byTC1YDhgn0KAf3at9k3wv7fXyvKct8CMmKRZyFyt7pw31w_tcbe0OYDMYzAdHmbrnop7TaH3vygTpHM4G8gt9kzB96a-ysOuDdVqRvg5YdfhrzHbbB251vkrCodJ8iJN9JzttKef-0GGy1Gm40Gbg1wgvDk0Fzi3F6jjsANN6e1B0-cuDGi3eHUxbo');

			let job = await cloudConvert.jobs.create({
				// "event": "job.finished",
				tasks: {
					'import-my-file': {
						operation: 'import/url',
						//url: 'https://demo1.dvconsulting.org/react-sample/moondap/example.hwp'
						url: 'https://demo1.dvconsulting.org/react-sample/moondap/test5.pdf'
						
						//url: '/assets/uploads/hwpuploads/files/' + sampleFile.name;
					},
					'convert-my-file': {
						operation: 'convert',
						input: 'import-my-file',
						output_format: 'pdf',
						some_other_option: 'value'
					},
					'export-my-file': {
						operation: 'export/url',
						input: 'convert-my-file'
					}
				}
			});

			job = await cloudConvert.jobs.wait(job.id); // Wait for job completion

			const exportTask = job.tasks.filter(
				task => task.operation === 'export/url' && task.status === 'finished'
			)[0];
			const file = exportTask.result.files[0];


			console.log(file);

			const writeStream = fs.createWriteStream('app/public/assets/uploads/hwpuploads/pdf/' + file.filename);

			https.get(file.url, function (response) {
				response.pipe(writeStream);
			});


			await new Promise((resolve, reject) => {
				writeStream.on('finish', resolve);
				writeStream.on('error', reject);
			});

			// console.log();

			if (exportTask.status == 'finished') {
				pageTitle = 'Test';
				await res.render('test', { 'title': pageTitle });
			}

		}





	});

	app.get('/find-password', function (req, res, next) {
		pageTitle = 'Find Password';
		return res.render('find_password.ejs', { 'title': pageTitle });
	});
	app.get('/set-password', function (req, res, next) {
		pageTitle = 'Set Password';
		return res.render('set_password.ejs', { 'title': pageTitle });
	});
	app.get('/enter-without-login', function (req, res, next) {
		pageTitle = 'Enter Without Login';
		return res.render('without_login.ejs', { 'title': pageTitle });
	});

	app.get('/home-viewer', function (req, res, next) {
		pageTitle = 'Viewer Home';
		return res.render('./user/viewer_dashboard.ejs', { 'title': pageTitle });
	});


	// app.post('/forgetpass', function (req, res, next) {
	// 	//console.log('req.body');
	// 	//console.log(req.body);
	// 	User.findOne({ email: req.body.email }, function (err, data) {
	// 		console.log(data);
	// 		if (!data) {
	// 			res.send({ "Success": "This Email Is not regestered!" });
	// 		} else {
	// 			// res.send({"Success":"Success!"});
	// 			if (req.body.password == req.body.passwordConf) {
	// 				data.password = req.body.password;
	// 				data.passwordConf = req.body.passwordConf;
	// 				data.save(function (err, Person) {
	// 					if (err)
	// 						console.log(err);
	// 					else
	// 						console.log('Success');
	// 					res.send({ "Success": "Password changed!" });
	// 				});
	// 			} else {
	// 				res.send({ "Success": "Password does not matched! Both Password should be same." });
	// 			}
	// 		}
	// 	});
	// });


};
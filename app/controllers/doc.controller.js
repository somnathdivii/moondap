const CloudConvert = require('cloudconvert');
const controller = require("../controllers/auth.controller");
const db = require("../models");
const upload = require("../middleware/uploads");
const fs = require('fs');
const https = require('https');
var pageTitle = '';
const Mydoc = db.mydocs;

exports.getdocs = async (req, res) => {
    if (req.session.access === "host" || req.session.access === "user") {
        pageTitle = 'Moondap | Create Room';
        var user_id = req.session.userId;
        Mydoc.findAll({
            where: {
                user_id: user_id,
            },
            attributes: ['mydoc.id', 'mydoc.user_id', 'mydoc.file_name', 'mydoc.file_type', 'mydoc.user_id', 'mydoc.active', 'mydoc.createdAt'],
            raw: true,
        }).then(data => {
            return res.render('user/mydocs.ejs', { 'title': pageTitle, 'email': req.session.email, 'docs': data });
        });
        // return await res.redirect('/dashboard');
    } else {
        pageTitle = 'Moondap | Login';
        return res.render('login.ejs', { 'title': pageTitle });
    }
    
};
exports.uploadDocument =  async (req, res) => {
    // console.log(req.files.myfile);
    sampleFile = req.files.myfile;
    doc_name =  Date.now() + "_" + sampleFile.name;
    uploadPath = './app/public/assets/uploads/hwpuploads/files/' + doc_name;
    sampleFile.mv(uploadPath, function (err) {
        if (err) { throw err; }
    })

    const cloudConvert = new CloudConvert('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjEzYTEyM2E2MThhMmY2NGRlY2ExMzlmODlkM2EyNjQzZDhhYzExMGJhNTQ4YzJhNTFlNWNmMmQ5ZGY5MzE1NzVhOThlOTA5NTNlZTllNGIiLCJpYXQiOjE2MzY0NTI2MzMuMTI4MzkzLCJuYmYiOjE2MzY0NTI2MzMuMTI4Mzk1LCJleHAiOjQ3OTIxMjYyMzMuMTAyNzUsInN1YiI6IjU0NDMzOTQ4Iiwic2NvcGVzIjpbInVzZXIucmVhZCIsInVzZXIud3JpdGUiLCJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.n1egHNbh8xQ4uJNR07eURuDBySBMdGenzuGiMWAeBJp55bIB5OtiYWYxGeshOBEhsaWDA-gLKM3vecKsIT2H1mE4Eug93X89Xn4GDbQ4tkwYez31wIbceEL5-EGPqD9jqDX6uh6fLIbl5PWCzq050TEDtkb4lmTYWYudO8B1wusZACYpQnuUbjvtjHMHjWw34mWdICTU7q3uxhX38eWeq4L6rMS0-ggmWlUTno7opXM88FGc-y-xhlTE-Hxh1cMkaERPoVXnFk2dXM11rzz1HbZWbYNFfzbaSuRHuN_Wq76qU4iUJOnQbFjWnckU5dfwLYra-sb8rwu6c9IACfPBtnKA-3Qq4EAyOcCfosEQznXXE5TFL_YgfrDEb1WmdyydjeVg5Mo_g9Z1pE2XXrFSUBVIzqwuB5zOuNK7QFv0zxbpnCEZyhTRSmAqRIhHS7ElaXBPuX4NgyUTxJvieoT3LghnKR59rec8R6LWPlu7tdc8kCg_byTC1YDhgn0KAf3at9k3wv7fXyvKct8CMmKRZyFyt7pw31w_tcbe0OYDMYzAdHmbrnop7TaH3vygTpHM4G8gt9kzB96a-ysOuDdVqRvg5YdfhrzHbbB251vkrCodJ8iJN9JzttKef-0GGy1Gm40Gbg1wgvDk0Fzi3F6jjsANN6e1B0-cuDGi3eHUxbo');

    let job = await cloudConvert.jobs.create({
        tasks: {
            'import-my-file': {
                operation: 'import/url',
                //url: 'https://demo1.dvconsulting.org/react-sample/moondap/example.hwp'
                //url: 'https://demo1.dvconsulting.org/react-sample/moondap/test5.pdf'
                
                url: '/assets/uploads/hwpuploads/files/' + doc_name
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

    job = await cloudConvert.jobs.wait(job.id); 

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


    if (exportTask.status == 'finished') {
        // console.log(file.filename);
        Mydoc.create({
            user_id: req.session.userId,
            file_name: file.filename,
            file_type: 'pdf',
            active: 1
          }).then(docs => {
            console.log(docs);
            res.send({ message: 'Uploaded successfully' });
          }).catch(err => {
            res.send({ message: err.message });
          });
    }
};
exports.docDelete = (req, res) => {
    // console.log(req);
    Mydoc.destroy({
        where: {
           id: req.body.id
        }
     }).then(function(rowDeleted){ 
       if(rowDeleted === 1){
        //   console.log('Deleted successfully');
        res.send({ message: 'Deleted successfully' });
        }
     }, function(err){
         console.log(err); 
     });
};
exports.allDoc = (req, res) => {
    var user_id = req.session.userId;
    console.log(req.session.userId);
    Mydoc.findAll({
        where: {
            user_id: user_id,
        },
        attributes: ['mydoc.id', 'mydoc.user_id', 'mydoc.file_name', 'mydoc.file_type', 'mydoc.user_id', 'mydoc.active', 'mydoc.createdAt'],
        raw: true,
    }).then(data => {
        // console.log
        res.send({ 'docs': data });
    });
}
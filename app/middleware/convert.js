const multer = require("multer");

const hwpFilter = (req, file, cb) => {
console.log(file);

    // if (file.mimetype.startsWith("hwp")) {
    //     cb(null, true);
    // } else {
    //     cb("Please upload only HWP.", false);
    // }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "app/public/assets/uploads/hwpuploads");
    },
    filename: (req, file, cb) => {
        let name = `${Date.now()}-profile_-${file.originalname}`
        req.body.hwp_image = name
        cb(null, name);
    },
});

var hwpuploadFile = multer({ storage: storage, fileFilter: hwpFilter });
module.exports = hwpuploadFile;
var express = require('express');
var router = express.Router();
const zipController = require('../controllers/zip.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

//backup store in zip file
router.post('/createZip',zipController.createZip)
router.post('/restore',upload.single('zipFilePath'),zipController.restoreZip)

module.exports = router;

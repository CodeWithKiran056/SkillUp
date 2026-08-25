const express = require("express");

const router = express.Router();


const upload = require("../middleware/uploadMiddleware");

const authMiddleware = require("../middleware/authMiddleware");


const {

    uploadFile,

    getFilesByRoom,

    deleteFile

} = require("../controllers/fileController");




// Upload PDF

router.post(

    "/upload",

    authMiddleware,

    upload.single("file"),

    uploadFile

);




// Get Files By Room

router.get(

    "/:roomId",

    authMiddleware,

    getFilesByRoom

);




// Delete File

router.delete(

    "/:id",

    authMiddleware,

    deleteFile

);



module.exports = router;
//Definicion de constantes
const express = require("express");
const app = express();
const router = express.Router();
const path = __dirname + "/views/";
const port = 8080;
//Requires
//const upload = require('multer')({ dest: "./uploads" });
//const uploadInMemory = require('multer')({ storage: multer.memoryStorage() });
const mongoose = require("mongoose");
const imageTools = require("./lib/imagesharp.js");
const fs = require("fs");
const { Readable } = require("stream");
//Inicializa el stream para pasarlo a mongoDB (hay que configurar la conexion con la DB)
const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
});

//Rutas
router.use(function (req, res, next) {
    console.log("/" + req.method);
    next();
});

module.exports = (app, upload, uploadInMemory) => {
    app.post(
        "/images/optimize",
        uploadInMemory.single("file"),
        async (req, res, next) => {
            // Esto es el buffer de la imagen
            const databuffer = req.file.buffer;
            // Usamos el imageTools importado de la carpeta lib
            let vuelta = await imageTools.optimizarWeb(databuffer);

            //El data de la respuesta donde esta el buffer
            const respuesta = vuelta.data;

            //Instancia de readable para meter ahi la respuesta
            const readableTrackStream = new Readable();
            readableTrackStream.push(respuesta);
            readableTrackStream.push(null);

            //Nombre random y extension que le llega en la llamada
            let namefile = (Math.random() + 1).toString(36).substring(7);
            let extension = ".webp";

            //Se crea un stream para guardar el archivo en la base de datos de mongo
            let uploadStream = gfs.openUploadStream(namefile + extension, {
                contentType: "image/" + extension,
            });
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on("error", () => {
                return res
                    .status(500)
                    .json({ message: "Error uploading file" });
            });
            uploadStream.on("finish", () => {
                return res.status(201).json({
                    message:
                        "File uploaded successfully, stored under Mongo ObjectID: " +
                        id +
                        " with name: " +
                        namefile +
                        extension,
                });
            });
        }
    );

    app.post(
        "/images/blackandwhite",
        uploadInMemory.single("file"),
        async (req, res, next) => {
            const databuffer = req.file.buffer;
            let vuelta = await imageTools.blackandwhite(databuffer);

            const respuesta = vuelta.data;

            const readableTrackStream = new Readable();
            readableTrackStream.push(respuesta);
            readableTrackStream.push(null);

            let namefile = (Math.random() + 1).toString(36).substring(7);
            let extension = ".webp";

            let uploadStream = gfs.openUploadStream(namefile + extension, {
                contentType: "image/" + extension,
            });
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on("error", () => {
                return res
                    .status(500)
                    .json({ message: "Error uploading file" });
            });
            uploadStream.on("finish", () => {
                return res.status(201).json({
                    message:
                        "File uploaded successfully, stored under Mongo ObjectID: " +
                        id +
                        " with name: " +
                        namefile +
                        extension,
                });
            });
        }
    );

    app.post(
        "/images/resize/:height/:width",
        uploadInMemory.single("file"),
        async (req, res, next) => {
            const databuffer = req.file.buffer;
            let width = req.params.width;
            let height = req.params.height;

            let vuelta = await imageTools.resize(databuffer, width, height);
            const respuesta = vuelta.data;

            const readableTrackStream = new Readable();
            readableTrackStream.push(respuesta);
            readableTrackStream.push(null);

            let namefile = (Math.random() + 1).toString(36).substring(7);

            let uploadStream = gfs.openUploadStream(namefile + ".webp", {
                contentType: "image/.webp",
            });
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on("error", () => {
                return res
                    .status(500)
                    .json({ message: "Error uploading file" });
            });

            uploadStream.on("finish", () => {
                return res.status(201).json({
                    message:
                        "File uploaded successfully, stored under Mongo ObjectID: " +
                        id +
                        " with name: " +
                        namefile +
                        ".webp",
                });
            });
        }
    );

    app.post(
        "/images/changeformat/:extension",
        uploadInMemory.single("file"),
        async (req, res, next) => {
            let extension = "." + req.params.extension;
            const databuffer = req.file.buffer;
            let vuelta = await imageTools.changeFormat(
                databuffer,
                req.params.extension
            );

            const respuesta = vuelta.data;

            const readableTrackStream = new Readable();
            readableTrackStream.push(respuesta);
            readableTrackStream.push(null);

            let namefile = (Math.random() + 1).toString(36).substring(7);

            let uploadStream = gfs.openUploadStream(namefile + extension, {
                contentType: "image/" + extension,
            });
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on("error", () => {
                return res
                    .status(500)
                    .json({ message: "Error uploading file" });
            });

            uploadStream.on("finish", () => {
                return res.status(201).json({
                    message:
                        "File uploaded successfully, stored under Mongo ObjectID: " +
                        id +
                        " with name: " +
                        namefile +
                        extension,
                });
            });
        }
    );
};

//Middleware
app.use(express.static(path));
app.use("/", router);

app.listen(port, function () {
    console.log("Api en el puerto 8080");
});

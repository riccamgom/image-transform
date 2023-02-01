const sharp = require("sharp");
const fs = require("fs");

//Creamos funciones para usar con la libreria Sharp que devuelven un buffer
module.exports = {
    async optimizarWeb(imagenEntrada) {
        //Le llega el buffer bien
        //console.log(imagenEntrada);
        //! Esto lo guardaria en la carpeta local, por si queremos usarlo para otra cosa
        /*
        const imagenTuneada = sharp(imagenEntrada)
                                .grayscale()
                                .resize(512,512)
                                .toFile('file.png', (err, info) => {
            // Guarda un file.png en local
        })
        */
        let imagen = await sharp(imagenEntrada)
            .webp({ quality: 90 })
            .resize(400, 300)
            .toBuffer({ resolveWithObject: true });
        return imagen;
    },

    async changeFormat(imagenEntrada, formato) {
        let imagen = await sharp(imagenEntrada)
            .toFormat(formato)
            .toBuffer({ resolveWithObject: true });
        return imagen;
    },

    async blackandwhite(imagenEntrada) {
        let imagen = await sharp(imagenEntrada)
            .webp({ lossless: true })
            .greyscale()
            .toBuffer({ resolveWithObject: true });
        return imagen;
    },

    async resize(imagenEntrada, width, height) {
        let alto = parseInt(height);
        let ancho = parseInt(width);

        let imagen = await sharp(imagenEntrada)
            .resize(alto, ancho, {
                kernel: sharp.kernel.nearest,
                fit: "contain", //contain, fill, fillmax, inside, outside (contain ajusta al tamaño rellenando el resto en negro y manteniendo la imagen)
            })
            .sharpen()
            .webp({ quality: 80 })
            .toBuffer({ resolveWithObject: true });
        return imagen;
    },
};

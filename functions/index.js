const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const admin = require('firebase-admin');

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: 'ionic-angular-course-b4443'
});

admin.initializeApp();

exports.storeImage = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if(req.method !== 'POST'){
            return res.status(500).json({message: 'Not allowd.'});
        }
        const busboy = new Busboy({headers: req.headers});
        let uploadData;
        let oldImagePath;

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filePAth = path.join(os.tmpdir(), filename);
            uploadData = {filePath: filePath, type: mimetype, name: filename};
            file.pipe(fs.createWriteStream(filePath));
        });

        busboy.on('field', (fieldname, value) => {
            oldImagePath = decodeURIComponent(value);
        });

        busboy.on('finish', () => {
            const id = uuid();
            let imagePath = 'images/' + id + '-' + uploadData.name;
            if (oldImagePath) {
                imagePath = oldImagePath;
            }

            console.log(uploadData.type);
            return storage
                .bucket('ionic-angular-course-b4443.appspot.com	')
                .upload(uploadData.filePath, {
                    uploadType: 'media',
                    destination: imagePath,
                    metadata: {
                        metadata: {
                            contentType: uploadData.type,
                            firebaseStorageDownloadTokens: id
                        }
                    }
                })

                .then(() => {
                    return res
                    .header('access-control-allow-headers', 'access-control-allow-methods,access-control-allow-origin')
                    .header('access-control-allow-methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
                    .header('content-type','application/json')
                    .header('access-control-allow-origin', 'http://localhost:8100/places/tabs/offers/new')
                    .status(201).json({
                        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/' +
                        storage.bucket('ionic-angular-course-b4443.appspot.com').name +
                        '/o/' +
                        encodeURIComponent(imagePath) +
                        '?alt=media&token=' +
                        id,
                        imagePath: imagePath
                    });
                })
                .catch(error => {
                    console.log(error);
                    return res.status(401).json({error: 'Unauthorized!'});
                });
            });
            return busboy.end(req.rawBody);
        });
    });
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

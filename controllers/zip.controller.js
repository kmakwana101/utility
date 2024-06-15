//require('dotenv').config()

const mongoose = require('mongoose');
const archiver = require('archiver');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const moment = require('moment');

//all models
const USER_MODEL = require('../models/user.model')
const FORGETPASSWORD_MODEL = require('../models/forgetPass.model')
const SESSION_MODEL = require('../models/session.model')
const TOKEN_MODEL = require('../models/token.model')


const MODELS = [
    USER_MODEL,
    FORGETPASSWORD_MODEL,
    SESSION_MODEL,
    TOKEN_MODEL
]

async function backupMongoData(req, res, next) {
    try {
        const collections = await Promise.all(MODELS.map(async (model, index) => {
            if (!model) {
                console.error(`Error: Model at index ${index} is undefined`);
                return [];
            }

            try {
                const data = await model.find().lean(true); //lean() fast data get and result in olg js document not mongoose document
                //console.log(`Data for ${model.modelName}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching data from ${model.modelName}:`, error.message);
                throw error;
            }
        }));

        return collections;
    } catch (error) {
        console.error('Error backing up MongoDB data:', error.message);
        throw error;
    }
};

exports.createZip = async function (req, res, next) {
    const currentDate = moment().format('DD-MM-YYYY');
    const backupFolderPath = `./backup/${currentDate}`;
    const databaseOutputPath = `${backupFolderPath}/database.zip`;
    const publicOutputPath = `${backupFolderPath}/public.zip`;

    try {
        if (!fs.existsSync(backupFolderPath)) {
            fs.mkdirSync(backupFolderPath, { recursive: true });
        }

        // Database backup
        const databaseData = await backupMongoData();
        const databaseOutput = fs.createWriteStream(databaseOutputPath);
        const databaseArchive = archiver('zip', { zlib: { level: 9 } });

        databaseArchive.pipe(databaseOutput);

        // Add data from each collection to the database archive
        databaseData.forEach((collectionData, index) => {
            const modelName = MODELS[index].modelName || 'unknown';
            databaseArchive.append(JSON.stringify(collectionData), { name: `${modelName}.json` });
        });

        // Finalize the database archive
        await new Promise((resolve, reject) => {
            databaseOutput.on('close', () => resolve(databaseOutputPath));
            databaseArchive.on('error', (err) => reject(err));
            databaseArchive.finalize();
        });

        // Public folder backup
        const publicOutput = fs.createWriteStream(publicOutputPath);
        const publicArchive = archiver('zip', { zlib: { level: 9 } });

        publicArchive.pipe(publicOutput);

        // Add the contents of the "./public" folder to the public archive
        publicArchive.directory('../public', false);
        // Finalize the public archive
        await new Promise((resolve, reject) => {
            publicOutput.on('close', () => resolve(publicOutputPath));
            publicArchive.on('error', (err) => reject(err));
            publicArchive.finalize();
        });

        console.log('complete', databaseOutputPath, publicOutputPath);

        // Send the response with the paths of both zip files
        res.status(200).json({
            databaseZipPath: databaseOutputPath,
            publicZipPath: publicOutputPath
        });
    } catch (error) {
        console.error('Error creating MongoDB backup and public zip:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// restore database in mongodb api
const extractDataFromZip = async (zipFilePath) => {
    const extractedData = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(zipFilePath)
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
                const modelName = entry.path.split('.')[0];
                let jsonData = '';

                entry
                    .pipe(require('stream').Transform({
                        transform: function (chunk, encoding, callback) {
                            jsonData += chunk.toString();
                            callback();
                        }
                    }))
                    .on('finish', () => {
                        extractedData.push({ modelName, data: JSON.parse(jsonData) });
                    });
            })
            .on('error', (err) => reject(err))
            .on('close', () => resolve(extractedData));
    });
};

let globalConnection;

const connectToMongoDB = async (mongodbUrl) => {
    if (!globalConnection) {
        globalConnection = await mongoose.createConnection(mongodbUrl);
    }
    return globalConnection;
};

exports.restoreZip = async function (req, res, next) {
    try {
        const zipFilePath = req.file.path;

        if (!zipFilePath) {
            throw new Error('zipFile is required')
        }

        const mongodbUrl = process.env.MONGO_URL;

        const extractedData = await extractDataFromZip(zipFilePath);
        // Add MongoDB URL to the extracted data
        extractedData.forEach((item) => {
            item.data.mongodbUrl = mongodbUrl;
        });

        await restoreDataToMongoDB(extractedData);

        res.json({ message: 'Data restored successfully' });
    } catch (error) {
        console.error('Error restoring data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const restoreDataToMongoDB = async (extractedData) => {
    try {
        const connection = await connectToMongoDB(extractedData[0].data.mongodbUrl);
        await Promise.all(
            extractedData.map(async ({ modelName, data }) => {
                // Check if the model already exists
                const existingModel = mongoose.connection.models[modelName];
                let Model;

                if (existingModel) {
                    console.log(`Model ${modelName} already exists, skipping creation.`);
                    // Use existing schema
                    Model = existingModel;
                    await Model.deleteMany({});
                } else {
                    // Define new schema
                    const schema = new mongoose.Schema({}, { strict: false, versionKey: false });
                    Model = connection.model(modelName, schema);
                }
                // Remove the __v field during the insertMany operation
                const dataWithoutVersion = data.map((doc) => {
                    delete doc.__v;
                    return doc;
                });
                await Model.insertMany(dataWithoutVersion);
            })
        );
    } catch (error) {
        throw new Error(`MongoDB operation error: ${error.message}`);
    }
};


import mongoose from 'mongoose';

export class DatabaseController {
    constructor () {
        this.mongooseOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        };
    }

    startMongoDb (databaseName, port) {
        const mongoUrl = `mongodb://localhost:${port}/${databaseName}`;
        mongoose.connect(mongoUrl, this.mongooseOptions)
            .then(_ => console.log(`Mongo db listening on port ${port}.`))
            .catch(e => console.log(`Failed to start Mongo db.\n${e}`));
    }
}

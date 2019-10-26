import { databaseController, app } from '../src/server';

const apiPort = 3000;
const mongoPort = 27017;
const databaseName = 'staff-db';

app.listen(apiPort);
console.log(`API listening on port: ${apiPort}`);

databaseController.startMongoDb(databaseName, mongoPort);

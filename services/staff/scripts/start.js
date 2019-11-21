import { app } from '../src/server';

const apiPort = process.env.EXPRESS_PORT || 3000;

app.listen(apiPort);
console.log(`API listening on port: ${apiPort}`);

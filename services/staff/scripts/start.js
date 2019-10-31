import { app } from '../src/server';

const apiPort = 3000;

app.listen(apiPort);
console.log(`API listening on port: ${apiPort}`);

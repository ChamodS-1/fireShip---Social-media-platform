const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let database;

async function connectTo(){
    const connection =  await MongoClient.connect('mongodb://localhost:27017');
    database = connection.db('blog');
}


function DbConn(){
    if(!database){
        throw new Error('not connected');
    }
    return database;
}

module.exports = {
    connectTo : connectTo,
    DbConn: DbConn
}
import { MongoClient } from 'mongodb';
let dbConnection

const connectToDb = (callBack)=>{
    MongoClient.connect('mongodb://localhost:27017', { family: 4})
    .then((client)=>{
        dbConnection = client.db("chatApp")
        callBack()
    })
    .catch(err => {
        console.log(err);
        callBack(err)
    })
}

const getDb = ()=>{
    return dbConnection
}

export {
    connectToDb,
    getDb
}
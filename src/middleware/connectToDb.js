import { connectToDb } from '../db/connection.js';

const startDbConnect = (req, res, next)=>{
    connectToDb(
        (err)=>{
            if(!err){
                next()
            }else {
                res.status(500).send({error: err, message:'Cannot connect to database'})
            }
        }
    )
}

export default startDbConnect;
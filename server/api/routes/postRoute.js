//Node Modules
const express = require("express");
const mongoDb = require("mongodb");

//Models
const Post = require("./../models/postModel");

//Custom Middleware
const checkAuth = require("./../middleware/checkAuth");

//DB Connection
const loadCollection = async (collectionName) => {
    const url = "mongodb+srv://AmadoJunior:"+ process.env.DB_PASSWORD +"@cluster0-s3lnp.mongodb.net/test?retryWrites=true&w=majority";
    const dbName = "TwitterClone";

    try{
        const client = await mongoDb.MongoClient.connect(url, {useUnifiedTopology: true});
        return client.db(dbName).collection(collectionName);
    }catch(err){
        console.log("Database connection problem:\n" + err);
    }
}

//Routing
const router = express.Router();
router.get("/", async (req, res) => {

    const collection = await loadCollection("Posts");
    const postsArray = await collection.find({}).toArray();
    res.send(postsArray);

})

router.post("/", checkAuth, async (req, res) => {
    const collection = await loadCollection("Posts");
    const post = new Post(req.body.userName, req.body.message);
    try{
        collection.insertOne(post);
        res.status(200).json({
            message: "Posted"
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            error: "Could not insert post"
        })
    }
})

module.exports = router;
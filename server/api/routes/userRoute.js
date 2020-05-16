//Node Modules
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const AWS = require("aws-sdk");
const mongoDb = require("mongodb");
const fs = require("fs");

//Custom Middleware
const checkAuth = require("./../middleware/checkAuth");

//Multer setup
const upload = multer({dest: "./server/uploads"});

//AWS setup
AWS.config.update({resgion: process.env.AWS_DEFUALT_REGION});

//Models
const User = require("./../models/userModel")

const router = express.Router();

const loadCollection = async (collectionName) => {
    const url = "mongodb+srv://AmadoJunior:"+ process.env.DB_PASSWORD +"@cluster0-s3lnp.mongodb.net/test?retryWrites=true&w=majority";
    const dbName = "TwitterClone";

    try{
        const client = await mongoDb.MongoClient.connect(url, { useUnifiedTopology: true });
        return client.db(dbName).collection(collectionName);
    } catch(err) {
        console.log("Database connection problem:\n" + err);
    }

}

router.post("/", checkAuth, async (req, res) => {
    try{
        const userCollection = await loadCollection("Users");
        const userData = await userCollection.findOne({userName: req.body.userName});
        res.status(200).json(userData);
    } catch(err){
        console.log(err);
        res.status(404).json({
            error: err
        })
    }
})

router.post("/signup/", async (req, res) => {
    const userCollection = await loadCollection("Users");
    const matchingUsers = await userCollection.find({email: req.body.email}).toArray();
    const emailRegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if(req.body.email.match(emailRegExp)){
        if(matchingUsers.length > 0){
            res.status(400).json({
                error: "Email already associated to an account"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    console.log("Bcrypt error:\n" + err);
                } else {
                    const newUser = new User(req.body.userName, req.body.email, hash);
                    userCollection.insertOne(newUser);
                    res.status(200).json({
                        message: "User Succesfully Added."
                    })
                }
            })
        }
        
    } else {
        res.status(400).json({
            error: "Invalid Email Address"
        })
    }
})

router.post("/login/", async (req, res) => {
    const userCollection = await loadCollection("Users");
    const user = await userCollection.findOne({email: req.body.email, userName: req.body.userName});
    if(user){
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err){
                console.log(err);
                res.status(404).json({
                    error: "Auth Failed"
                })
            } else {
                const token = jwt.sign({
                    userId: user._id,
                    userName: user.userName,
                    email: user.email,
                    profileImg: user.profileImg,
                    backgroundImg: user.backgroundImg
                }, process.env.JWT_KEY, {expiresIn: "1h"})
                const userData = jwt.decode(token, process.env.JWT_KEY);
                res.status(200).json({
                    message: "Auth Successful",
                    userData: userData,
                    token: token
                })
            }
        })
    } else {
        res.status(404).json({
            error: "Auth Failed"
        })
    }
})

router.post("/media/profileImg" , checkAuth, upload.single("profileImg"), async (req, res) => {
    const s3 = new AWS.S3();

    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: req.body.userName + "Profile",
        Body: fs.createReadStream(req.file.path),
        ACL: "public-read"
    }

    s3.upload(uploadParams, async(err, data) => {
        if(err){
            console.log(err);
        } else {
            //User data.Location to link image
            try{
                const userCollection = await loadCollection("Users");
            
                await userCollection.updateOne({userName: req.body.userName}, {
                    $set: {
                        profileImg: data.Location
                    }
                })

                res.status(200).json({
                    message: "Success"
                })
            } catch(err) {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            }    
        }
    })
})

router.post("/media/backgroundImg" , checkAuth, upload.single("backgroundImg"), async (req, res) => {
    const s3 = new AWS.S3();

    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: req.body.userName + "Background",
        Body: fs.createReadStream(req.file.path),
        ACL: "public-read"
    }

    s3.upload(uploadParams, async(err, data) => {
        if(err){
            console.log(err);
        } else {
            //User data.Location to link image
            try{
                const userCollection = await loadCollection("Users");
            
                await userCollection.updateOne({userName: req.body.userName}, {
                    $set: {
                        backgroundImg: data.Location
                    }
                })

                res.status(200).json({
                    message: "Success"
                })
            } catch(err) {
                console.log(err);
                res.status(500).json({
                    error: err
                })
            }
        }
    })
})

module.exports = router;
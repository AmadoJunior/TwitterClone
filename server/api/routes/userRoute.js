//Node Modules
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const mongoDb = require("mongodb");

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
                    userName: user.UserName,
                    email: user.email
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

module.exports = router;
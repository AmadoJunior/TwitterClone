const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config({ path: "../.env" });

//MiddleWare
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
const userRoute = require("./api/routes/userRoute.js");
app.use("/api/user/" , userRoute);

//Uploads Public

//Production
if(process.env.NODE_ENV === "production"){
    app.use(express.static(__dirname + "/public/"));
    app.get(/.*/, (res, req) => {
        res.sendFile(__dirname + "/public/index.html");
    })
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`);
});
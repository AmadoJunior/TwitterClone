const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config({ path: "../.env" });

//MiddleWare
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//Routes

//Uploads Static

//Production


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`);
});
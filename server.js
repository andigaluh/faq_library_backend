const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize.sync();

/* db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
    initial();
}); */

function initial() {
    const Role = db.role;
    Role.create({
        id: 1,
        name: "user"
    });
    
    Role.create({
        id: 2,
        name: "moderator"
    });
    
    Role.create({
        id: 3,
        name: "admin"
    });
}


// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to auth-jwt-mysql application." });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/locationlib.routes')(app);
require('./app/routes/categorylib.routes')(app);
require('./app/routes/faqlib.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
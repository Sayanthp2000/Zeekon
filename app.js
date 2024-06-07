const express = require("express");
const path = require("path")
const bodyParser = require("body-parser")
const session = require("express-session")
const nocache = require("nocache")
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');

const passport = require("passport");


dotenv.config();

const passportStrategy = require("./middlewares/passport");


const PORT = process.env.PORT || 3000

const app = express()

require("./DB/dataBase")









app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 48 * 60 * 60 * 1000,
        httpOnly: true
    }
}))
 


app.use(passport.initialize());
app.use(passport.session());

app.use(nocache())

app.set("view engine", "ejs")
app.set('views', ['./views/admin', './views/user' ]);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());
app.use(express.static('public'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/product',express.static('public'));
app.use('/admin',express.static('public'));

const userRoutes = require("./routes/userRouter")
const adminRoutes = require("./routes/adminRouter");



app.use("/", userRoutes)
app.use('/admin',adminRoutes);

app.get('*', function (req, res) {
    res.status(404).render('page-404.ejs');
});









app.listen(PORT, () => console.log(`Server running on  http://localhost:${PORT}`))
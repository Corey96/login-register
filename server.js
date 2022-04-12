if (process.env.Node_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
passport.initialize(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id))

// saving to local variables and not database - needs changing***
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash());
// broke at this part i think 
app.use(session({
    secret: process.env.SESSION_SECRET,
    reSave: false,
    saveUnitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticate, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticate, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect : '/login',
    failureFlash: true

}))

app.get('/register', checkNotAuthenticate, (req, res) => {
    res.render('register.ejs')
})

// Register user
// creating hashed password with bcrypt / will need changing to database
// if got database will be auto generated ???

app.post('/register', checkNotAuthenticate, async (req, res) => {
   try {
       const hashedPassword = await bcrypt.hash(req.body.password, 10) 
       users.push({
           id: Date.now().toString(),
           name: req.body.name,
           email: req.body.email,
           password: hashedPassword
       })
       res.redirect('/login')
   } catch {
       res.redirect('/register')
   }
   console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

// checks to see if user has account if not return to login page  may need to change 
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)



























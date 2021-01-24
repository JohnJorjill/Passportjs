if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// initializing passport
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user=>user.email === email),
    id => users.find(user=>user.id === id),
)

// list of users
const users = []

// uses ejs
app.set('view-engine','ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// if url no parameters, return index.ejs
app.get('/', checkAuthenticated, (req,res)=>{
    console.log(users);
    res.render('index.ejs',{name: req.user.name})
})

// if /login
app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})

// main working part of passport
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

// if register button pressed
app.post('/register', checkNotAuthenticated,async (req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,  10)
        users.push({
            id: Date.now().toString(),
            name:req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req,res)=>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(3000)
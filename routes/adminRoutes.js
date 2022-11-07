const express = require('express')
const route = express()

const session= require('express-session')
const config = require('../config/config')
route.use(session({
    secret:config.sessionSecret,
    resave:false,
     saveUninitialized:false,
}))


route.use(express.json())
route.use(express.urlencoded({extended:true}))


route.set('view engine', 'ejs')
route.set('views' , './views/admin')

//auth middleware
const auth = require('../middleware/adminAuth')


const controllers = require('../usercontrollers/adminControllers')

route.get('/',auth.isLogout,controllers.loadLogin)
route.post('/',controllers.verifyLogin)
route.get('/home',auth.isLogin,controllers.loadHome)
route.get('/home',auth.isLogin,controllers.loadHome)

route.get('/logout',auth.isLogin,controllers.logout)

route.get('/forget',auth.isLogout,controllers.forgetLoad)
route.post('/forget',controllers.emailVerify)
route.get('/forget-password',auth.isLogout,controllers.forgetPasswordLoad)
route.post('/forget-password',controllers.forgetPass)











route.get('*',function(req,res){
    res.redirect('/admin')
})












module.exports = route;


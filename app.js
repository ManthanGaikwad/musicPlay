require('dotenv').config()
const express = require('express');
const { Cookie } = require('express-session');
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path')

const app = express();

const UserModel = require('./models/user')

//const config = require('./config/config')


 

//database connection
mongoose.connect(process.env.MY_MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then((res)=>{
    console.log('connect database');
})

const store = new MongodbSession({
    uri:process.env.MY_MONGO_URI,
    collection:'mySession'
})

//session
app.use(
    session({
        secret:process.env.MY_SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        store:store,
        cookie:{
            secure:false,
            maxAge:600000
        }
})
);

//authentication

const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}



//view engine
app.set('view engine', 'ejs');
app.set('views', './views/users');

app.use(express.urlencoded({extended:true}));

//
app.use(express.static('images'))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(express.static('public'))
app.use('/public',express.static(path.join(__dirname,'public')))

//multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'./public/userImages'))
    },
    filename:function(req,file,cb){
        const name = Date.now() + '-' + file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage});





const userController = require('./usercontrollers/userControllers')


app.get('/register',userController.loadRegister);

app.post('/register',upload.single('image'),userController.insertUser)

app.get('/verify',userController.verifyEmail)

//app.get('/',userController.loginLoad)
app.get('/login',userController.loginLoad)
app.post('/login',userController.loginVerify);


app.get ('/main',isAuth,userController.loadMain)

app.get('/forget',userController.forgetLoad)
app.post('/forget',userController.forgetVerifyEmail)

app.get('/forget-password',userController.forgetPasswordLoad)
app.post('/forget-password',userController.changePassword)


app.post('/logout',userController.logout)


app.get('/',userController.landingPage)




//app.set('views', './views/admin');


//admin




const controllers = require('./usercontrollers/adminControllers')

app.get('/admin/',controllers.loadLogin)

app.post('/admin/',controllers.verifyLogin)

app.get('/admin/ahome',controllers.loadHome)

app.get('/admin/logout',controllers.logout)

app.get('/admin/aforget',controllers.forgetLoad)

app.post('/admin/aforget',controllers.emailVerify)

app.get('/admin/aforget-password',controllers.forgetPasswordLoad)

app.post('/admin/aforget-password',controllers.forgetPass)






















app.get('*',(req,res)=>{
    res.render('404')
})



app.listen(200,console.log('server running 200'));
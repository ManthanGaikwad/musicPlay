const User = require('../models/user');
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const nodeMailer = require('nodemailer')
const session = require('express-session')

const config = require('../config/config')


//secure password function
const securePassword = async(password)=>{
    try {
        
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message);
    }
}

//send forget email
const sendForgetEmail = async(name,email,token)=>{
    try {
        
        const transporter = nodeMailer.createTransport({
            host:'smtp.server.com',
            //port:2525,
            //secure:false,
            service:'gmail',
            auth:{
                user:config.myEmail,
                pass:config.myPassword
            }
        });
        
        const mailOption={
            from:config.myEmail,
            to:email,
            subject:'Reset your Password',
            html:'<P> Hi '+ name +' , please click here <a href="http://localhost:200/admin/aforget-password?token='+ token +'"> Reset </a> your password </p>'

        }
        transporter.sendMail(mailOption, function(error,info){
            if (error) {
                console.log(error);
            } else {
                console.log('email send:' + info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}


const loadLogin = async(req,res)=>{
    try {
        res.render('alogin')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email})
        if (userData) {
            
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if (passwordMatch) {
                
                if(userData.is_admin=== 0){
                    res.render('alogin',{message:'email and password Incorrect !!!'})

                }else{
                    res.redirect('/admin/ahome')
                }

            } else {
                res.render('alogin',{message:'email and password Incorrect !!!'})

            }

        } else {
            res.render('alogin',{message:'email and password Incorrect !!!'})
        }

    } catch (error) {
       console.log(error.message); 
    }
}


const loadHome = async(req,res)=>{
    try {
        res.render('ahome')
    } catch (error) {
        console.log(error.message);
    }
}

//logout
const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

//forget view

const forgetLoad= async(req,res)=>{
    try {
        res.render('aforget')
    } catch (error) {
        console.log(error.message);
    }
}




//email verify
const emailVerify = async(req,res)=>{
    try {
        
        const email = req.body.email;
        const userData = await User.findOne({email:email})
        if (userData) {
            if(userData.is_admin=== 0){
                res.render('aforget',{message:'Email Invalid'})

            }else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendForgetEmail(userData.name, userData.email, randomString);
                res.render('aforget',{message:'Email send please check your email'})

            }
        } else {
            res.render('aforget',{message:'Email Invalid'})
        }

    } catch (error) {
        console.log(error.message);
    }
}


//forget password view

const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token;
        const userData = await User.findOne({token:token});
        if (userData) {
            res.render('aforget-password',{user_id:userData._id})
        } else {
            res.render('404', {message:'invalid link'})
        }
    } catch (error) {
       console.log(error.message); 
    }
}

//updated forget pass
const forgetPass = async(req,res)=>{
    try {
        
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_Password = await  securePassword(password)
        const updatedData =  await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_Password,token:''}})

        res.redirect('/admin/')

    } catch (error) {
       console.log(error.message); 
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    forgetLoad,
    emailVerify,
    forgetPasswordLoad,
    forgetPass
}
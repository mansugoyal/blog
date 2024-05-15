let express = require('express');
let router = express.Router();
let post = require('../models/post');
let User = require('../models/user');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

let adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



/**
 *  CHECK LOGIN
*/

let authMiddleware = (req, res, next)=>{
    let token = req.cookies.token;
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try{
        let decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

/**
 * GET /
 * ADMIN - LOGIN
*/

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        // const data = await Post.find();
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log("admin page error----" + error);
    }

});

/**
 * POST /
 * ADMIN - CHECK LOGIN
*/

router.post('/admin', async (req, res) => {
    try {
        let { username, password } = req.body;

        let user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
        }

        let isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
        }

        let token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie("token", token, { httpOnly: true });
        res.redirect('/dashboard');
        
    } catch (error) {
        console.log("admin login error----" + error);
    }

});


/**
 * POST /
 * ADMIN DASHBOARD
*/

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        let locals = {
            title: "Admin Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let data = await post.find();
        res.render('admin/dashboard',{
            locals,
            data
        });
    } catch (error) {
        console.log(error);
    }
});


// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         if (req.body.username === "admin" && req.body.password === "password") {
//             res.send("You are logged in.");
//         } else {
//             res.send("Wrong username or password")
//         }
//         res.render('admin/index', { layout: adminLayout });
//     } catch (error) {
//         console.log(error);
//     }
// });



/**
 * POST /
 * ADMIN REGISTER
*/

router.post('/register', async (req, res) => {
    try {
        let { username, password } = req.body;
        let hashedPassword = await bcrypt.hash(password, 10);

        try {
            let user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            } else {
                res.status(500).json({ message: 'Internal server error' })
            }
        }

    } catch (error) {
        console.log("register error---" + error);
    }

});







module.exports = router;
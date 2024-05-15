let express = require('express');
let router = express.Router();
let post = require('../models/post');
let User = require('../models/user');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');


let adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



/**
 *  Login Middleware
*/

let authMiddleware = (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        let decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

/**
 * Get /
 * Admin login page layout
*/

router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
        res.render('admin/index', { locals, layout: adminLayout, token: req.cookies.token });
    } catch (error) {
        console.log("admin page error----" + error);
    }

});

/**
 * Post /
 * Admin authenticating user
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
 * Get /
 * Admin dashboard
*/

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        let locals = {
            title: "Admin Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let data = await post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout,
            token: req.cookies.token
        });
    } catch (error) {
        console.log("dashboard error-----" + error);
    }
});

/**
 * Get /
 * Admin create post layout
*/

router.get('/create-post', authMiddleware, async (req, res) => {
    try {
        let locals = {
            title: "Create Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        res.render('admin/create-post', {
            locals,
            layout: adminLayout,
            token: req.cookies.token
        });

    } catch (error) {
        console.log(error);
    }
});


/**
 * Post /
 * Admin create new post
*/

router.post('/create-post', authMiddleware, async (req, res) => {
    try {
        let { title, body } = req.body;
        let postCreated = await post.create({ title, body });
        res.status(201).json({ message: 'Post Created', postCreated });
    } catch (error) {
        console.log(error);
    }
});


/**
 * Delete /
 * Admin delete post
*/
// Use method-override middleware
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
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
 * Post /
 * Admin create user
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


/**
 * Get /
 * Admin logout
*/

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        //res.json({ message: 'Logout successful.'});
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
});





module.exports = router;
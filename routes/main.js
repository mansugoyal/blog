let express = require('express');
let router = express.Router();
let post = require('../models/post');

/**
 * GET /
 * HOME
*/
router.get('', async (req, res) => {
    try {
        let locals = {
            title: "Blog Platform",
            description: "Simple blog created with Nodejs, Express & MongoDb."
        }

        let perPage = 10;
        let page = req.query.page || 1;

        let data = await post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        let count = await post.countDocuments({});
        let nextPage = parseInt(page) + 1;
        let hasNextPage = nextPage <= Math.ceil(count / perPage);


        // let data = await post.find();
        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log("get data error-----" + error)
    }

});


/**
 * GET : id
*/

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        let data = await post.findById({_id:slug})

        let locals = {
            title: data.title,
            description: data.description
        }

        res.render('post', { 
            locals, 
            data,
            currentRoute: `/post/${slug}`
        });
    } catch (error) {
        console.log("get data error-----" + error)
    }

});

/**
 * POST : searchTerm
*/

router.post('/search', async (req, res) => {
    try {
        let locals = {
            title: "Search",
            description: "Simple blog created with Nodejs, Express & MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        let searchNoSpecialCharacter = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await post.find({
            $or: [
              { title: { $regex: new RegExp(searchNoSpecialCharacter, 'i') }},
              { body: { $regex: new RegExp(searchNoSpecialCharacter, 'i') }}
            ]
          });

          res.render("search", {
            data,
            locals,
            currentRoute: '/'
          });
    } catch (error) {
        console.log("get data error-----" + error)
    }

});


router.get('/about', (req, res) => {
    res.render('about',{
        currentRoute: '/about'
    })
});

router.get('/contact', (req, res) => {
    res.render('contact',{
        currentRoute: '/contact'
    })
});

// Seeder to insert sample data to view on page

// function insertPostData () {
//     post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }

// insertPostData();

// router.get('', async (req, res) => {
//     const locals = {
//       title: "NodeJs Blog",
//       description: "Simple Blog created with NodeJs, Express & MongoDb."
//     }
  
//     try {
//       const data = await Post.find();
//       res.render('index', { locals, data });
//     } catch (error) {
//       console.log(error);
//     }
  
//   });

module.exports = router;
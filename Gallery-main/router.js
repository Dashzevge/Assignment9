const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const { check, validationResult } = require('express-validator');
const mysql = require('mysql2');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const fileUpload = require('express-fileupload');

router.use(fileUpload());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(flash());
router.use(session({
    secret: 'root',
    resave: false,
    saveUninitialized: true,
}));

//bodyParser
router.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
router.use(bodyParser.json({ limit: '100mb' }));

// MySQL connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'web_gallery',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server');
});

//test
router.get('/test', (req, res) => {
     res.render('test');
});


router.get('/', (req, res) => {
    // Fetch images from the database
    const getImagesQuery = 'SELECT * FROM images';
    connection.query(getImagesQuery, (err, results) => {
      if (err) {
        console.error('Error fetching images:', err);
        req.flash('error', 'Error fetching images');
        return res.redirect('/login'); // Redirect to login or handle the error
      }
  
      res.render('index', { images: results, userName: ''});
    });
});

router.get('/login', (req, res) => {
    res.render('login.html');
});

router.post('/login',
    [
        check('email').isEmail().withMessage('Invalid email'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).send(errors.array());
        }

        const { email, password } = req.body;

        // Check user credentials
        const loginQuery = 'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1';
        const loginValues = [email, password];

        connection.query(loginQuery, loginValues, (err, results) => {
            if (err) {
                console.error('Error during login:', err);
                return res.status(500).send('Error during login.');
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid credentials.');
            }
            // Store user data in the session
            const user = results[0];
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                admin: user.isAdmin === 1, // Convert isAdmin to a boolean
            };

            if (user.isAdmin === 1) {
                req.session.admin = true;
            }

            res.redirect("/gallery")
        });
    }
);
router.get('/gallery', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/');
    }
    //res.send(`Welcome, ${req.session.user.name}! This is your Gallery.`);
    //res.render('index', {userName: req.session.user.name});
      // Fetch images from the database
      const getImagesQuery = 'SELECT * FROM images';
      connection.query(getImagesQuery, (err, results) => {
        if (err) {
          console.error('Error fetching images:', err);
          req.flash('error', 'Error fetching images');
          return res.redirect('/login'); // Redirect to login or handle the error
        }
        const name = req.session.user.name;
        res.render('index', { images: results, userName: name});
      });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register',
    [
        check('name').notEmpty().withMessage('Name is required'),
        check('email').isEmail().withMessage('Invalid email'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).send(errors.array());
        }

        const { name, email, password } = req.body;

        // Check if user with the same email already exists
        const emailCheckQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
        const emailCheckValues = [email];

        connection.query(emailCheckQuery, emailCheckValues, (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).send('Error checking email.');
            }

            const userCount = results[0].count;

            if (userCount > 0) {
                return res.status(400).send('Email already registered.');
            }

            // Insert user data into the database
            const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            const insertValues = [name, email, password];

            connection.query(insertQuery, insertValues, (err, insertResults) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).send('Error registering user.');
                }

                console.log('User registered successfully');
                res.send('User registered successfully.');
            });
        });
    }
);

router.get('/admin', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.redirect('/login');
    }

    // Fetch users from the database and render admin.html
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            req.flash('error', 'Error fetching users');
            return res.redirect('/login');
        }

        res.render('admin', { users: results, session: req.session });
    });
});

router.post('/setadmin/:userId', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.status(403).send('Access denied.');
    }

    const userId = req.params.userId;

    // Update the user's isAdmin status in the database
    const setAdminQuery = 'UPDATE users SET isAdmin = 1 WHERE id = ?';
    connection.query(setAdminQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error setting user as admin:', err);
            req.flash('error', 'Error setting user as admin');
            return res.redirect('/admin');
        }

        req.flash('success', 'User has been set as admin.');
        res.redirect('/admin');
    });
});
router.post('/setuser/:userId', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.status(403).send('Access denied.');
    }

    const adminUserId = req.session.user.id;
    const userId = req.params.userId;
    if (adminUserId === userId) {
        req.flash('error', "You can't set yourself as a regular user.");
        return res.redirect('/admin');
    }
    // Update the user's isAdmin status in the database
    const setAdminQuery = 'UPDATE users SET isAdmin = 0 WHERE id = ?';
    connection.query(setAdminQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error setting user as user:', err);
            req.flash('error', 'Error setting user as user');
            return res.redirect('/admin');
        }

        req.flash('success', 'User has been set as user.');
        res.redirect('/admin');
    });
});

router.post('/deleteUser/:userId', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.status(403).send('Access denied.');
    }

    const adminUserId = req.session.user.id;
    const userId = req.params.userId;
    if (adminUserId === userId) {
        req.flash('error', "You can't set yourself as a regular user.");
        return res.redirect('/admin');
    }
    // Update the user's isAdmin status in the database
    const setAdminQuery = 'DELETE FROM users WHERE id = ?';
    connection.query(setAdminQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error setting user as user:', err);
            req.flash('error', 'Error setting user as user');
            return res.redirect('/admin');
        }

        req.flash('success', 'User has been set as user.');
        res.redirect('/admin');
    });
});

router.post('/upload', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.status(403).send('Access denied.');
    }

    const { title, description } = req.body;
    const user_id = req.session.user.id;
    const image = req.files.image.data; // Binary data of the uploaded image
    const filename = req.files.image.name; // Original filename

    // Execute SQL query to insert image data into the database
    const insertImageQuery = 'INSERT INTO images (title, description, filename, image_data, created_at, user_id) VALUES (?, ?, ?, ?, NOW(), ?)';
    const insertImageValues = [title, description, filename, image, user_id];

    connection.query(insertImageQuery, insertImageValues, (err, result) => {
        if (err) {
            console.error('Error inserting image data into database:', err);
            req.flash('error', 'Error saving image data');
            return res.redirect('/admin');
        }

        req.flash('success', 'Image uploaded and saved successfully.');
        res.redirect('/adminImages');
    });
});

router.get('/adminImages', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.redirect('/login');
    }

    // Fetch images from the database
    connection.query('SELECT * FROM images', (err, results) => {
        if (err) {
            req.flash('error', 'Error fetching images');
            return res.redirect('/login');
        }

        // Render the adminImages view with the fetched images
        res.render('adminImages', { images: results });
    });
});

router.post('/deleteImage/:imageId', (req, res) => {
    // Check if the user is logged in as an admin
    if (!req.session.admin) {
        return res.status(403).send('Access denied.');
    }

    const imageId = req.params.imageId;

    // Delete the image from the database
    const deleteImageQuery = 'DELETE FROM images WHERE id = ?';
    connection.query(deleteImageQuery, [imageId], (err, result) => {
        if (err) {
            console.error('Error deleting image:', err);
            req.flash('error', 'Error deleting image');
            return res.redirect('/adminImages');
        }

        req.flash('success', 'Image has been deleted.');
        res.redirect('/adminImages');
    });
});

router.get('/imageDetail/:imageId', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    }
    const imageId = req.params.imageId;

    // Fetch the image details from the database
    const getImageQuery = 'SELECT * FROM images WHERE id = ?';
    connection.query(getImageQuery, [imageId], (err, results) => {
        if (err) {
            console.error('Error fetching image details:', err);
            req.flash('error', 'Error fetching image details');
            return res.redirect('/adminImages');
        }

        if (results.length === 0) {
            req.flash('error', 'Image not found.');
            return res.redirect('/adminImages');
        }

        res.render('imageDetail', { image: results[0] });
    });
});

router.get('/image/:imageId', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    }
    const imageId = req.params.imageId;

    // Fetch the image details from the database
    const getImageQuery = 'SELECT * FROM images WHERE id = ?';
    connection.query(getImageQuery, [imageId], (err, results) => {
        if (err) {
            console.error('Error fetching image details:', err);
            req.flash('error', 'Error fetching image details');
            return res.redirect('/adminImages');
        }

        if (results.length === 0) {
            req.flash('error', 'Image not found.');
            return res.redirect('/adminImages');
        }

        res.render('image', { image: results[0] });
    });
});

module.exports = router;
var express = require('express')
var app = express()
var ObjectId = require('mongodb').ObjectId

// SHOW LIST OF USERS
app.get('/', function(req, res, next) {
    // fetch and sort users collection by id in descending order
    req.db.collection('mahasiswa').find().sort({"_id": -1}).toArray(function(err, result) {
        //if (err) return console.log(err)
        if (err) {
            req.flash('error', err)
            res.render('mahasiswa/listmahasiswa', {
                title: 'Daftar Mahasiswa',
                data: ''
            })
        } else {
            // render to views/user/list.ejs template file
            res.render('mahasiswa/listmahasiswa', {
                title: 'Daftar Mahasiswa',
                data: result
            })
        }
    })
})

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){
    // render to views/user/add.ejs
    res.render('mahasiswa/add', {
        title: 'Tambah Mahasiswa',
        nim: '',
        nama: '',
        email: '',
        phone:''
    })
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){
    req.assert('nim', 'Nim is required').notEmpty()           //Validate name
    req.assert('nama', 'Nama is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email
    req.assert('phone', 'Phone is required').notEmpty()

    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!

        /********************************************
         * Express-validator module

        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';

        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var mahasiswa = {
            nim: req.sanitize('nim').escape().trim(),
            nama: req.sanitize('nama').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            phone : req.sanitize('phone').escape().trim()
        }

        req.db.collection('mahasiswa').insert(mahasiswa, function(err, result) {
            if (err) {
                req.flash('error', err)

                // render to views/user/add.ejs
                res.render('mahasiswa/add', {
                    title: 'Tambah Mahasiswa Baru',
                    nim: mahasiswa.nim,
                    nama: mahasiswa.nama,
                    email: mahasiswa.email,
                    phone: mahasiswa.phone
                })
            } else {
                req.flash('success', 'Data Berhasil Ditambah!')

                // redirect to user list page
                res.redirect('/mahasiswa')

                // render to views/user/add.ejs
                /*res.render('user/add', {
                    title: 'Add New User',
                    name: '',
                    age: '',
                    email: ''
                })*/
            }
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name
         * because req.param('name') is deprecated
         */
        res.render('mahasiswa/add', {
            title: 'Tambah Mahasiswa Baru',
            nim: req.body.nim,
            nama: req.body.nama,
            email: req.body.email,
            phone: req.body.phone
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('mahasiswa').find({"_id": o_id}).toArray(function(err, result) {
        if(err) return console.log(err)

        // if user not found
        if (!result) {
            req.flash('error', 'Mahasiswa tidak ada dengan id = ' + req.params.id)
            res.redirect('/mahasiswa')
        }
        else { // if user found
            // render to views/user/edit.ejs template file
            res.render('mahasiswa/edit', {
                title: 'Edit mahasiswa',
                //data: rows[0],
                id: result[0]._id,
                nim: result[0].nim,
                nama: result[0].nama,
                email: result[0].email,
                phone: result[0].phone
            })
        }
    })
})

// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
  req.assert('nim', 'Nim is required').notEmpty()           //Validate name
  req.assert('nama', 'Nama is required').notEmpty()             //Validate age
  req.assert('email', 'A valid email is required').isEmail()  //Validate email
  req.assert('phone', 'Phone is required').notEmpty()


    var errors = req.validationErrors()

    if( !errors ) {   //No errors were found.  Passed Validation!

        /********************************************
         * Express-validator module

        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';

        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var mahasiswa = {
            nim: req.sanitize('nim').escape().trim(),
            nama: req.sanitize('nama').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            phone : req.sanitize('phone').escape().trim()
        }

        var o_id = new ObjectId(req.params.id)
        req.db.collection('mahasiswa').update({"_id": o_id}, mahasiswa, function(err, result) {
            if (err) {
                req.flash('error', err)

                // render to views/user/edit.ejs
                res.render('user/edit', {
                    title: 'Edit User',
                    id: req.params.id,
                    nim: req.body.nim,
                    nama: req.body.nama,
                    email: req.body.email,
                    phone: req.body.phone
                })
            } else {
                req.flash('success', 'Data berhasil diupdate!')

                res.redirect('/mahasiswa')

                // render to views/user/edit.ejs
                /*res.render('user/edit', {
                    title: 'Edit User',
                    id: req.params.id,
                    name: req.body.name,
                    age: req.body.age,
                    email: req.body.email
                })*/
            }
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name
         * because req.param('name') is deprecated
         */
        res.render('mahasiswa/edit', {
            title: 'Edit Mahasiswa',
            id: req.params.id,
            nim: req.body.nim,
            nama: req.body.nama,
            email: req.body.email,
            phone:req.bosy.phone
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
    var o_id = new ObjectId(req.params.id)
    req.db.collection('mahasiswa').remove({"_id": o_id}, function(err, result) {
        if (err) {
            req.flash('error', err)
            // redirect to users list page
            res.redirect('/mahasiswa')
        } else {
            req.flash('success', 'Mahasiswa telah terhapus! id = ' + req.params.id)
            // redirect to users list page
            res.redirect('/mahasiswa')
        }
    })
})

module.exports = app;

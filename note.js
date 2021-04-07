const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

// 1. install mongoose >> npm instal --save mongoose
// 2. include mongoose and open connection to db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog', {useNewUrlParser: true, useUnifiedTopology: true});

// // 3. test connect
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function(){
//     //we're connected
// });

// 4. Define model
const commentSchema = new mongoose.Schema({
    //code object data here
    content: 
});

// 5. compile into model
const commentModel = mongoose.model('comment', commentSchema)

const postSchema = new mongoose.Schema({
    tittle: { type: String },
    description: { type: String},
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: commentModel
    }]
});

const postModel = mongoose.model('post', postSchema);

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    name: {type: String},
    address: {type: String},
    salt: {type: String},
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: postModel
    }]
});

// const userModel = mongoose.model('user', userSchema);

const server = express();

server.use(bodyParser.urlencoded({ extended: true}))
server.use(bodyParser.json())

//post register
server.post('/register', async (req, res) => {
    const payload = req.body;

    payload.salt = await bcrypt.genSalt(10)
    payload.password = await bcrypt.hash(payload.password, payload.salt)

    const newUser = new userModel(payload)
    const result = newUser.save()

    res.send({
        status: 200,
        data: result
    })
})

//post login
server.post('/login', (req, res) => {
    const payload = req.body;

    let message = ''
    const userExist = await userModel.findOne({username: payload.username})
    if (!userExist) {
        message = 'user not found'
    };

    const isPasswordMatch = await bcrypt.compare(payload.password, userExist.password)

    const token = await jwt.sign(userExist.toJSON(), 'secret_key')
    res.send({
        status:200,
        message,
        data: {
            token
        }
    })
})

//get users
server.get('/users', (req,res) => {
    
})

//post post
server.post('/post/:postId/comments', (req, res) => {})




//port
server.listen(3001, () => {
    console.log('SERVER RUNNING ON PORT 3001');
})
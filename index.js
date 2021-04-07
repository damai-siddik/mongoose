const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

// make connect
mongoose.connect('mongodb://localhost/blog', {useNewUrlParser: true, useUnifiedTopology: true});

// define model
const userSchema = mongoose.Schema({
  username: {type: String},
  password: {type: String},
  name: {type: String},
  address: {type: String},
  salt: {type: String},
})
const userModel = mongoose.model('user', userSchema);


const server = express()

server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

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

server.post('/login', async (req, res) => {
  const payload = req.body;

  let message = ''
  const userExist = await userModel.findOne({username: payload.username})
  if (!userExist) {
    message = 'user not found'
  };

  const isPasswordMatch = await bcrypt.compare(payload.password, userExist.password)
  if (!isPasswordMatch) {
    message = 'invalid password'
  }

  const token = await jwt.sign(userExist.toJSON(), 'secret_key')
  res.send({
    status: 200,
    message,
    data: {
      token
    }
  })
})

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
})
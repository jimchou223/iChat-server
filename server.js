const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
const uuidv4 = require('uuid/v4')
const express = require('express')
const app = express()



// var mongoose = require('mongoose'),
Timestamp = mongoose.mongo.Timestamp;

// var mongoose = require('mongoose');
require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid'

app.use(express.json())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

const port = process.env.PORT || 3000



const url = 'mongodb+srv://jimchou223:Jj669824@cluster0-l4bto.mongodb.net/ichat?retryWrites=true&w=majority'
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true }



if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, options);
}


// const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// var validateEmail = function (email) {
//     var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     return re.test(email)
// };

let userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        unique: true,
        required: true,

    },
    friendsList: {
        type: Array
    }
});

const User = mongoose.model('Users', userSchema);

const charRoomSchema = new Schema({
    roomID: {
        type: String,
        required: true
    },
    member: {
        type: Array,
        required: true,

    },
})

const ChatRoom = mongoose.model('Chatroom', charRoomSchema);

const messageSchema = new Schema({
    roomID: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    }
})

const Message = mongoose.model('Message', messageSchema);


mongoose.connect(url, mongooseOptions)
    .then(() => {
        console.log('database connected')
    })
    .catch((err) => {
        console.log(`Error: ${err}`)
    })


// how to check if two persons have relationship or not



app.get('/findallusers', (req, res) => {
    MongoClient.connect(url, mongooseOptions)
        .then((db) => {
            var dbo = db.db("ichat");
            dbo.collection("users").find().toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                res.send(result)
                db.close();
            })
        })
        .catch((err) => {
            console.log(`Error: ${err}`)
        })
})

app.post('/finduser', (req, res) => {
    const filter = {
        email: req.body.email
    }
    MongoClient.connect(url, mongooseOptions)
        .then((db) => {
            var dbo = db.db("ichat");
            dbo.collection("users").find({ email: filter.email }).toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                res.send(result)
                db.close();
            })
        })
        .catch((err) => {
            console.log(`Error: ${err}`)
        })
})

app.post('/findfriends', (req, res) => {
    const filter = req.body.username
    console.log(req.body)

    MongoClient.connect(url, mongooseOptions)
        .then((db) => {
            var dbo = db.db("ichat");
            dbo.collection("chatroom").find({ member: filter }).toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                res.send(result)
                db.close();
            })
        })
        .catch((err) => {
            console.log(`Error: ${err}`)
        })
})



app.post('/findchatroom', (req, res) => {
    const filter = {
        member: req.body.member
    }
    MongoClient.connect(url, mongooseOptions)
        .then((db) => {
            var dbo = db.db("ichat");
            dbo.collection("chatroom").find({ member: filter.member }).toArray(function (err, result) {
                if (err) {
                    res.status(400).send("Error:" + err)
                } else {
                    console.log("chatroom found");
                    res.send("chatroom found")
                    db.close();
                }
            })
        })
        .catch((err) => {
            console.log(`Error: ${err}`)
        })
})

app.post('/findmessages', (req, res) => {
    const roomID = req.body.roomID
    console.log(roomID)
    // const order = {  }
    MongoClient.connect(url, mongooseOptions)
        .then((db) => {
            var dbo = db.db("ichat");
            // dbo.collection("message").find({ roomID: filter.member }).sort(order).toArray(function (err, result) {
            dbo.collection("message").find({ roomID: roomID }).toArray(function (err, result) {
                if (err) {
                    res.status(400).send("Error:" + err)
                } else {
                    console.log("messages found");
                    res.send(result)
                    db.close();
                }
            })
        })
        .catch((err) => {
            console.log(`Error: ${err}`)
        })
})



app.post('/addnewuser', (req, res) => {
    let userObj = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    })
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("ichat");
        dbo.collection("users").insertOne(userObj, function (err) {
            if (err) {
                res.status(400).send("Error:" + err)
            } else {
                console.log("1 user inserted");
                res.send("one user added")
                db.close();
            }

        });
    });

})




app.post('/addnewchatroom', (req, res) => {
    const uuid = uuidv4();
    // console.log(uuidtest)
    let chatroomObj = new ChatRoom({
        roomID: uuid,
        member: req.body.member,
    })
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("ichat");
        dbo.collection("chatroom").insertOne(chatroomObj, function (err) {
            if (err) {
                res.status(400).send("Error:" + err)
            } else {
                console.log("1 chatroom inserted");
                res.send("one chatroom added")
            }
        });
    });
})

app.post('/addnewmessage', (req, res) => {
    time = new Date();
    let messageObj = new Message({
        roomID: req.body.roomID,
        sender: req.body.sender,
        content: req.body.content,
        time: time,
    })
    MongoClient.connect(url, async function (err, db) {
        if (err) throw err;
        var dbo = db.db("ichat");
        await dbo.collection("message").insertOne(messageObj, function (err) {
            if (err) {
                res.status(400).send("Error:" + err)
            } else {
                console.log("1 message inserted");
                res.send("one message added")
                db.close();
            }

        });
    });
})

app.listen(port, () => console.log(`listening to port ${port}`))
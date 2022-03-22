import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express'
//import cookieParser from 'cookie-parser'
import User from './models/User'
import knex from './config/database'
//var authenticate = require('./Utils/authenticate');
import authenticate from './utils/authenticate'

dotenv.config()

const https = require('https')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const bcrypt = require('bcrypt')
const app = express()
const auth = require("./routes/auth")
const profiles = require("./routes/profiles")
const sets = require("./routes/sets")
const flashcards = require("./routes/flashcards")

//app.use(express.json())
app.use(cors())
app.use(express.json())
//app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))


app.use("/api/auth", auth);
app.use("/api/profiles", profiles);
app.use("/api/sets", sets);
app.use("/api/flashcards", flashcards);

app.get('/api/', (req, res) => res.send('OK!'))

// User
app.get('/api/userInfo', authenticate, async (req, res, next) => {
    try {
        const users = await knex("users")
            .select('users.email', 'users.created_at', 'users.updated_at')
            .where({ id: req.user.payload.id })

        res.send(users)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})


//
app.post("/api/isEmailFree", async (req, res) => {

    try {
        return knex('users')
            .select()
            .where('email', req.body.email)
            .then(function (rows) {
                if (rows.length === 0) {
                    res.send({ res: 'email free' })
                } else {
                    res.send({ res: 'email already in use' })
                }
            })
            .catch(function (ex) {
                res.send(' err ')
            })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})


app.listen(3001, () => {
    console.log('Server is up!!')
})

// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
// }, app)

// sslServer.listen(3443, () => console.log('SSL server runing on port 3443!'))
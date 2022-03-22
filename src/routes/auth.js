import knex from '../config/database'
import jwt from 'jsonwebtoken'
import authenticate from '../utils/authenticate'
const express = require("express")
const bcrypt = require('bcrypt')
let router = express.Router();
const { body, validationResult } = require('express-validator');


router.post("/registration",
    body('email').normalizeEmail().isEmail(),
    body('password').isLength({ min: 5, max: 15 }),
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            await bcrypt.hash(req.body.password, 8)
                .then(hashedPassword => {
                    knex('users')
                        .select()
                        .where('email', req.body.email)
                        .then(function (rows) {
                            if (rows.length === 0) {
                                knex("users")
                                    //.returning("id")
                                    .insert({
                                        //id: "", 
                                        email: req.body.email,
                                        password: hashedPassword
                                    })// res.send( 'successful registration ' )
                                    .then((rows) => {
                                        knex('profiles').insert({
                                            user_id: rows
                                        })
                                            .then(res.send({ status: 'successful registration' }))
                                    })

                            } else {
                                return res.status(409).json({ error: 'email already in use' })
                            }
                        })
                        .catch(function (ex) {
                            // you can find errors here.
                            res.send({ status: ' err ' })
                        })
                })
        } catch (err) {
            return res.sendStatus(403)
        }
    })


router.post('/login', async (req, res) => {
    try {
        await knex("users")
            .where({ email: req.body.email })
            .first()
            .then(users => {
                if (!users) {
                    res.status(401).json({
                        error: "No users by that name"
                    })
                } else {
                    return bcrypt
                        .compare(req.body.password, users.password)
                        .then(isAuthenticated => {
                            if (!isAuthenticated) {
                                res.status(401).json({
                                    error: "Unauthorized Access!"
                                })
                            } else {
                                const payload = { id: users.id, email: users.email }
                                const accessToken = jwt.sign({ payload }, process.env.TOKEN_SECRET, { expiresIn: 86400 })
                                res.send({ accessToken })
                            }
                        })
                }
            })
    } catch (err) {
        return res.sendStatus(403)
    }

})

// router.post('/refresh', async (req, res) => {
//     const refreshToken = req.body.token

//     if (!refreshToken) {
//         return res.status(401)
//     }

//     // TODO: Check if refreshToken exist in DB

//     try {
//         await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
//     } catch (err) {
//         return res.sendStatus(403)
//     }

//     const accessToken = jwt.sign({ id: 1 }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

//     res.send({ accessToken })
// })


router.post('/password',
    authenticate,
    body('newPassword').isLength({ min: 5, max: 15 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            if (!req.body.oldPassword || !req.body.newPassword) return res.status(400).json({ error: "Bad Request!" });

            await knex("users")
                .where({ id: req.user.payload.id })
                .first()
                .then(users => {
                    if (!users) {
                        return res.status(401).json({
                            error: "No users by that name"
                        })
                    } else {
                        return bcrypt
                            .compare(req.body.oldPassword, users.password)
                            .then(isAuthenticated => {
                                if (!isAuthenticated) {
                                    res.status(401).json({
                                        error: "Unauthorized Access!"
                                    })
                                } else {
                                    bcrypt.hash(req.body.newPassword, 8)
                                        .then(hashedPassword => {
                                            knex('users')
                                                .where({ id: req.user.payload.id })
                                                .update({ password: hashedPassword })
                                                .then(res.send({ status: 'password updated' }))
                                        })
                                }
                            })
                    }
                })



        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "internal server error" })
        }
    })

module.exports = router;
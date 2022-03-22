import knex from '../config/database'
import jwt from 'jsonwebtoken'
import authenticate from '../utils/authenticate'
import setStatistics from '../utils/setStatistics'
const express = require("express")
let router = express.Router();
const { param, validationResult } = require('express-validator');


router.get("/", authenticate, async (req, res) => {
    try {
        const profile = await knex('profiles')
            .select('profiles.name', 'profiles.description')
            .where({ user_id: knex('users').select('id').where({ id: req.user.payload.id }) })

        res.send(profile)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})



router.put("/", authenticate, async (req, res) => {
    try {
        return await knex('profiles')
            .where({ user_id: req.user.payload.id })
            .update({
                name: req.body.name,
                description: req.body.description
            })
            .then(res.send({ status: 'sucesfull profile insert' }))
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

router.get('/statistics', authenticate, async (req, res) => {
    try {
        var setsId = await knex('sets')
            .select('sets.id')
            .where({ user_id: req.user.payload.id })

        if (setsId == 0)
            return res.send({ status: 'User don\'t have any sets' })

        var statistics = { howManySets: setsId.length, learned: 0, unlearned: 0, allFlashcards: 0 }

        for (var i = 0; i < setsId.length; i++) {
            statistics.learned += (await setStatistics(setsId[i].id)).learned
            statistics.unlearned += (await setStatistics(setsId[i].id)).unlearned
            statistics.allFlashcards += (await setStatistics(setsId[i].id)).allFlashcards
        }
        return res.send(Array.of(statistics))
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

router.post('/name', authenticate, async (req, res) => {
    try {
        if (!req.body.name) return res.status(400).json({ error: "Bad Request!" });

        return await knex('profiles')
            .where({ user_id: req.user.payload.id })
            .update({ name: req.body.name })
            .then(res.send({ status: 'name updated' }))



    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})



router.post('/description', authenticate, async (req, res) => {
    try {
        //console.log(req.params.setId)
        if (!req.body.description) return res.status(400).json({ error: "Bad Request!" });

        return await knex('profiles')
            .where({ user_id: req.user.payload.id })
            .update({ description: req.body.description })
            .then(res.send({ status: 'description updated' }))



    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

router.get('/statisticsSingle/:correctNumber',
    authenticate,
    param('correctNumber').exists().isNumeric(),
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            var setsId = await knex('sets')
                .select('sets.id')
                .where({ user_id: req.user.payload.id })

            if (setsId == 0)
                return res.send({ status: 'User don\'t have any sets' })

            var numberOfFlashcards = 0
            for (var i = 0; i < setsId.length; i++) {

                numberOfFlashcards += (await knex('flashcards')
                    .select('*')
                    .where({ set_id: setsId[i].id, correctNumber: req.params.correctNumber })).length
            }

            return res.send({ numberOfFlashcards: numberOfFlashcards })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "internal server error" })
        }
    })


router.get('/statisticsBetween/:correctNumberFrom/:correctNumberTo',
    authenticate,
    param('correctNumberFrom').exists().isNumeric(),
    param('correctNumberTo').exists().isNumeric(),
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (req.params.correctNumberFrom > req.params.correctNumberTo || req.params.correctNumberFrom < 0 || req.params.correctNumberTo > 5) {
                return res.status(400).json({ error: "Bad Request!" });
            }

            var setsId = await knex('sets')
                .select('sets.id')
                .where({ user_id: req.user.payload.id })

            if (setsId == 0)
                return res.send({ status: 'User don\'t have any sets' })

            var numberOfFlashcards = 0
            for (var i = 0; i < setsId.length; i++) {

                numberOfFlashcards += (await knex('flashcards')
                    .select('*')
                    .where({ set_id: setsId[i].id })
                    .andWhere('correctNumber', '>=' , req.params.correctNumberFrom)
                    .andWhere('correctNumber', '<=' , req.params.correctNumberTo)
                    ).length
            }

            return res.send({ numberOfFlashcards: numberOfFlashcards })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "internal server error" })
        }
    })

module.exports = router;
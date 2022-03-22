import knex from '../config/database'
import jwt from 'jsonwebtoken'
import authenticate from '../utils/authenticate'
import setStatistics from '../utils/setStatistics'
const express = require("express")
let router = express.Router();


router.post("/flashcardsToLearn", authenticate, async (req, res) => {
    try {

        if (!req.body.set_id) return res.status(400).json({ error: "Bad Request!" });

        const userIdFromSets = await knex('sets')
            .select('sets.user_id')
            .where({ id: req.body.set_id })

        if (req.user.payload.id !== userIdFromSets[0].user_id) // Compare userID from JWT and userID from req
            return res.status(401).json({ error: "Unauthorized Access!" })


        const flashcardsToLearn = await knex('flashcards')
            .select('flashcards.id', 'flashcards.front', 'flashcards.back')
            .where({ set_id: req.body.set_id })
            .whereNot({ correctNumber: 5 })
        if (!flashcardsToLearn) console.log('aaa')
        return res.send(flashcardsToLearn)


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})



router.post("/flashcardPlusOrZero", authenticate, async (req, res) => {
    try {

        if (!req.body.flashcardId) return res.status(400).json({ error: "Bad Request!" });

        const setInfo = await knex('sets').select('user_id', "id").where({
            id: knex('flashcards')
                .select('set_id')
                .where({ id: req.body.flashcardId })
        })




        if (req.user.payload.id !== setInfo[0].user_id)
            return res.status(401).json({ error: "Unauthorized Access!" })

        var _correctNumber = await knex('flashcards')
            .select('flashcards.correctNumber')
            .where({ id: req.body.flashcardId })
        _correctNumber = _correctNumber[0].correctNumber



        if (req.body.ifCorrect) _correctNumber++
        else _correctNumber = 0

        if (_correctNumber > 5) _correctNumber = 5
        if (_correctNumber < 0) _correctNumber = 0


        // return knex('flashcards')
        //     .update({correctNumber: _correctNumber})
        //     .where({ id: req.body.flashcardId })
        //     .then(res.send({ status: 'successful update' }))

        const update = await knex('flashcards')
            .update({ correctNumber: _correctNumber })
            .where({ id: req.body.flashcardId })



        const response = await setStatistics(setInfo[0].id)

        return res.send(response)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})


module.exports = router;
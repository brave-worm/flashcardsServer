import knex from '../config/database'
import jwt from 'jsonwebtoken'
import authenticate from '../utils/authenticate'
import setStatistics from '../utils/setStatistics'
const express = require("express")
let router = express.Router();


function getUserIdFromSets(setId) {
    try {
        return knex('sets').where({ id: setId }).select('user_id')
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
}

function getSetIdFromFlashcards(flashcardsId) {
    try {
        return knex('flashcards').select('set_id').where('id', flashcardsId)
    } catch (error) {
        console.error(error);
        //return res.status(500).json({ error: "internal server error" })
    }
}

async function inserUpdateFlashcards(req, rows, i) {
    try {
        if (!req.body.Flashcards[i].id) {
            return knex('flashcards').insert({
                front: req.body.Flashcards[i].front,
                back: req.body.Flashcards[i].back,
                set_id: rows
            })
            //.then(console.log('insert fc'))
        }
        else {
            var SetIdFromFlashcards = await getSetIdFromFlashcards(req.body.Flashcards[i].id)
            if (SetIdFromFlashcards[0].set_id !== rows)
                return console.log('Unauthorized Access! Flashcard dont belongs to this set')

            return knex('flashcards')
                .where({ id: req.body.Flashcards[i].id })
                .update({
                    front: req.body.Flashcards[i].front,
                    back: req.body.Flashcards[i].back
                })
            //.then(console.log('update fc', req.body.Flashcards[i].id))
        }
    } catch (error) {
        console.error(error);
        //return res.status(500).json({ error: "internal server error" })
    }
}

async function addLength(set) {
    try {
        var setPlusLength = {
            id: set.id,
            setTitle: set.setTitle,
            setDescription: set.setDescription,
            length: (await knex('flashcards')
            .select('*')
            .where({ set_id: set.id })).length
        }


        return setPlusLength
    } catch (error) {
        console.error(error);
    }
}

router.post("/allUserSets", authenticate, async (req, res) => {
    try {
        var sets = await knex('sets')
            .select('sets.id', 'sets.setTitle', 'sets.setDescription')
            .where({ user_id: req.user.payload.id })

        if (sets.length !== 0)
            for (var i = 0; i < sets.length; i++) {
                sets[i] = await addLength(sets[i])

            }

        return res.send(sets)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})



router.get("/set", authenticate, async (req, res) => {
    try {
        if (!req.body.id) return res.send('wrong data')
        const sets = await knex('sets')
            .select('sets.setTitle', 'sets.setDescription')
            .where({ id: req.body.id })

        return res.send(sets)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

router.post("/set", authenticate, async (req, res) => {
    try {
        if (!req.body.setTitle) return res.status(400).json({ error: "Bad Request!" });

        if (!req.body.id)
            return await knex('sets')
                .insert({
                    setTitle: req.body.setTitle,
                    setDescription: req.body.setDescription,
                    user_id: req.user.payload.id
                })
                .then(res.send({ status: 'sucesfull set insert' }))
        else {
            var debug = await knex('sets').where({ id: req.body.id }).select('sets.user_id')
            if ((await knex('sets').where({ id: req.body.id }).select('sets.user_id'))[0].user_id !== req.user.payload.id)
                return res.status(401).json({ error: "Unauthorized Access!" })
            return await knex('sets')
                .where({ id: req.body.id })
                .update({
                    setTitle: req.body.setTitle,
                    setDescription: req.body.setDescription,
                    user_id: req.user.payload.id
                })
                .then(res.send({ status: 'sucesfull set update' }))
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})


router.post("/setFlashcards", authenticate, async (req, res) => {
    try {
        if (!req.body.setTitle) return res.status(400).json({ error: "Bad Request!" });

        if (!(req.user.payload.email === req.body.email)) // Compare email from JWT and email from req
            return res.status(401).json({ error: "Unauthorized Access!" })


        if (!req.body.setId)
            return await knex('sets')
                .insert({
                    setTitle: req.body.setTitle,
                    setDescription: req.body.setDescription,
                    user_id: req.user.payload.id
                })
                //.then(res.send({status: 'sucesfull sets insert'}))
                .then((rows) => {
                    for (var i = 0; i < req.body.Flashcards.length; i++) {
                        inserUpdateFlashcards(req, rows, i)
                    }
                    return res.send({ status: 'set created' })
                })

        else {
            var userIdFromSets = await getUserIdFromSets(req.body.setId)
            if (userIdFromSets[0].user_id !== req.user.payload.id)
                return res.status(401).json({ error: "Unauthorized Access! Set dont belongs to this user" })
            return await knex('sets')

                .where({ id: req.body.setId })
                .update({
                    setTitle: req.body.setTitle,
                    setDescription: req.body.setDescription,
                    user_id: req.user.payload.id
                })
                .then((rows) => {
                    for (var i = 0; i < req.body.Flashcards.length; i++) {
                        inserUpdateFlashcards(req, req.body.setId, i)
                    }
                    return res.send({ status: 'set updated' })

                })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})





router.delete('/setFlashcardsDelete/:setId', authenticate, async (req, res) => {
    try {
        //console.log(req.params.setId)


        if (!req.params.setId) return res.status(400).json({ error: "Bad Request!" });

        const user_id = await knex('sets').where({ id: req.params.setId }).select('user_id')
        if (req.user.payload.id !== user_id[0].user_id)
            return res.status(401).json({ error: "Unauthorized Access!" })

        return await knex('sets')
            .del()
            .where('id', req.params.setId)
            .then(res.send({ status: 'set deleted' }))



    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})


router.get("/setStatistics/:setId", authenticate, async (req, res) => {
    try {

        if (!req.params.setId) return res.status(400).json({ error: "Bad Request!" });

        const user_id = await knex('sets').where({ id: req.params.setId }).select('user_id')
        if (req.user.payload.id !== user_id[0].user_id)
            return res.status(401).json({ error: "Unauthorized Access!" })

        const response = await setStatistics(req.params.setId)

        return res.send(Array.of(response))
        //return res.send(sets)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

router.put("/setReset/:setId", authenticate, async (req, res) => {
    try {

        if (!req.params.setId) return res.status(400).json({ error: "Bad Request!" });

        const userIdFromSet = await knex('sets').select('user_id').where({ id: req.params.setId })

        if (req.user.payload.id !== userIdFromSet[0].user_id)
            return res.status(401).json({ error: "Unauthorized Access!" })


        return knex('flashcards')
            .update({ correctNumber: 0 })
            .where({ set_id: req.params.setId })
            .then(res.send({ status: 'successful update' }))





    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" })
    }
})

module.exports = router;
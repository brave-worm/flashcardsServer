import jwt from 'jsonwebtoken'
import knex from '../config/database'
const express = require("express")

export default async function (setId) {

    var records
    var statistics = {learned: 0, unlearned: 0, allFlashcards: 0}

    records = await knex('flashcards')
        .select('*')
        .where({ set_id: setId, correctNumber: 5 })

    statistics.learned = records.length


    records = await knex('flashcards')
        .select('*')
        .where({ set_id: setId })
        .whereNot({ correctNumber: 5 })
    statistics.unlearned = records.length
    statistics.allFlashcards = statistics.learned + statistics.unlearned


    return statistics;

}


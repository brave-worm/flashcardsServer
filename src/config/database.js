import knexfile from "../../knexfile";
import knex from 'knex'

const env = process.env.NODE_ENV || 'development'

export default knex(knexfile[env])

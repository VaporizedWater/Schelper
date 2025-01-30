import { config } from 'dotenv'
config({ path: './../../.env' })
let db_URI = process.env.DB_URI
if (!db_URI) {
    db_URI = ""
}

export const DB_URI = db_URI
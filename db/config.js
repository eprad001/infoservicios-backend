import pg, { Connection } from 'pg'
import 'dotenv/config'

/** const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env
const pool = new pg.Pool(
    {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        port: DB_PORT,
        allowExitOnIdle: true
    }
)
*/

const { BD_URL } = process.env
const config = {
    connectionSring: BD_URL
}
const pool = new Connection(config)

pool.query('SELECT NOW()', (err, res) => {
        if(err){
            console.log('Error al conectar con la BD', err)
        }else{
            console.log('BD Conectada', res.rows[0]) 
        }
    }
)

export default pool

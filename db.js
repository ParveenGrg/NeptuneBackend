import pg from 'pg'

const Pool = pg.Pool

// const pool = new Pool({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: process.env.DATABASE_URL ? true : false
// })

const pool = new Pool({
    database: 'postgres',
	host: 'localhost',
	port: 5432,
	user: 'postgres',
	password: 'dhugraj',
});

export default pool
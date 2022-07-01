//
// imports
import dotenv from 'dotenv'
import express from 'express'
import xss from 'xss-clean'
import helmet from 'helmet'
import { songs, users } from './data.js'
import pool from './db.js'
import faces from './faces.js'
import cors from 'cors'
//
// import middlewares
import errorHandler from './middlewares/error-handler.js'
import createUser from './routes/user/user.js'
//import followuser from './routes/events/events.js'
//import createPost from './routes/post/create-post.js'
//import comment from './routes/comments/comments.js'
//import feed from './routes/feed/get-user-feed.js'
//import notifications from './routes/notifications/get-notifications.js'
import search from './routes/search.js'
import songroute from './routes/songs.js'
import tags from './routes/tags.js'
//
// import routes
import artists from './routes/artists.js'

//
// configure environment variables
dotenv.config({ path: '.env' })

//
// initailize express app
const app = express()
app.options('*', cors())
const PORT = process.env.PORT || 4444

// set up express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// initialize routes
app.get('/', (req, res) => res.json('Welcome to Neptune API'))

app.get('/artists', async (req, res) => {
	let allartists = []
	let newdata = []
	songs.map((artist) => allartists.push(artist.artist))
	allartists = allartists.filter(function (value, index, array) {
		return array.indexOf(value) === index
	})
	allartists.map((artist) =>
		newdata.push({
			...users[allartists.indexOf(artist)],
			artist,
			url: faces[allartists.indexOf(artist)],
		})
	)

	for (let i = 0; i < newdata.length; i++) {
		console.log(newdata[i])
		await pool.query(
			`insert into songappusers
	            (id, username,first_name, last_name,email,city, avatar) values ($1, $2, $3, $4,$5,$6,$7)`,
			[
				newdata[i].id,
				newdata[i].artist,
				newdata[i].first_name,
				newdata[i].last_name,
				newdata[i].email,
				newdata[i].from,
				newdata[i].url,
			]
		)
	}

	res.send({ le: newdata })
})
app.get('/songs', async (req, res) => {
	for (let i = 0; i < songs.length; i++) {
		await pool.query(
			`insert into songs 
                  (songname,userid, trackid,tags,duration, cover_image_url) values ($1, $2, $3, $4,$5,$6)`,
			[
				songs[i].name,
				songs[i].artist,
				songs[i].track,
				songs[i].tags,
				songs[i].duration,
				songs[i].cover_image,
			]
		)
	}
	res.send({ le: 'hello' })
})

app.use('/tags', async (req, res) => {
	let tags = []
	let cover = []
	let final = []
	songs.map((song) => {
		tags.push(...song.tags)
	})
	tags = tags.filter(function (value, index, array) {
		return (
			array.indexOf(value) === index &&
			!value.includes('free') &&
			!value.includes('music')
		)
	})
	songs.map((song) => {
		cover.push(song.cover_image)
	})
	tags.map((tag) => {
		final.push({ tag: tag, coverImage: cover[tags.indexOf(tag)] })
	})

	res.send({ num: tags.length, results: final })
})

app.use('/api/v1/user/', createUser)
//app.use('/api/v1/user/events', followuser)
//app.use('/api/v1/post/', createPost)
//app.use('/api/v1/post/comments', comment)
//app.use('/api/v1/feed', feed)
//app.use('/api/v1/notifications', notifications)
app.use('/api/v1/', artists)
app.use('/api/v1/songs/', songroute)
app.use('/api/v1/tags/', tags)
app.use('/api/v1/search/', search)
app.use(errorHandler)

app.use(helmet())
app.use(xss())
// set up express app to listen for requests
app.listen(PORT, () => console.log('listening on port 4444'))
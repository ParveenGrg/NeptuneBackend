import express from 'express'
import pool from './../db.js'
import asyncHandler from './../methods/async-function.js'

const router = express.Router()

router.get(
	'/',
	asyncHandler(async (req, res, next) => {
		var data = await pool.query(
			`select * from appusers where LOWER(name) like '%${req.query.q}%'`
		)
		res.status(200).json({
			success: true,
			results: data.rows,
		})
	})
)

router.get(
	'/get_posts',
	asyncHandler(async (req, res, next) => {
		var { rows } = await pool.query(`select * from get_search_posts();`)

		res.status(200).json({
			success: true,
			results: rows.map((row) => {
				return {
					post_id: row.new_post_id,
					post_image_url: row.new_post_image_url,
					caption: row.new_caption,
					user_id: row.new_user_id,
					posted_at: row.new_posted_at,
					likes: row.new_likes,
					username: row.new_username,
					name: row.new_name,
					width: row.new_width,
					height: row.new_height,
					avatar_url: row.new_avatar_url,
				}
			}),
		})
	})
)

router.get(
	'/songs',
	asyncHandler(async (req, res, next) => {
		const { page } = req.query ?? 0
		const { limit } = req.query ?? 20
		const offset = page * limit
		const { q } = req.query
		const { rows } = await pool.query(
			`select songid,
                  songname,
                  userid,
                  trackid,
                  duration,
                  cover_image_url,
                  first_name,
                  last_name from songs left join songappusers on songs.userid=songappusers.username where LOWER(songname) like '%${q}%' offset $1 limit $2;`,
			[offset, limit]
		)

		res.send({ results: rows })
	})
)

router.get(
	'/artists',
	asyncHandler(async (req, res, next) => {
		const { page } = req.query ?? 0
		const { limit } = req.query ?? 20
		const offset = page * limit
		const { q } = req.query
		const { rows } = await pool.query(
			`select avatar,first_name,last_name,username from songappusers
                  where LOWER(first_name) like '%${q}%'
                  or LOWER(last_name) like '%${q}%'
                  or LOWER(username) like '%${q}'
                  offset $1 limit $2;`,
			[offset, limit]
		)

		res.send({ results: rows })
	})
)

export default router
'use strict';
var Users = require('../tools/mongodb.js').getCollection('users')
	, getUid = require('../tools/tools.js').getUid
	

	
var posterList = [
	'/images/small4.png'
	, '/images/small5.png'
	, '/images/10_avatar_middle.jpg'
	, '/images/middle2.png'
]

module.exports = function(app)
{
	app.use(function(req, res, next)
	{
		console.log(req.time)
		if( !req.cookies._id ){
			req.cookies.poster = posterList[parseInt(Math.random()*posterList.length,10)]
			req.cookies._id = getUid(16)
			res.cookie('_id', req.cookies._id)
			res.cookie('poster', req.cookies.poster)
		}
				
		req.user = {
			_id: req.cookies._id
			, poster: req.cookies.poster
		}
		
		if( req.session.admin )
			req.user.admin = true
		
		if( req.body.username ) {
			res.cookie('username', req.body.username)
			req.cookies.username = req.body.username
			req.user.name =req.cookies.username
		}
		
		if( req.cookies.username ) {
			req.user.name = req.cookies.username
		}
		
		if( req.body.email ) {
			res.cookie('email', req.body.email)
			req.cookies.email = req.body.email
			req.user.email =req.cookies.email
		}
		
		if( req.cookies.email ) {
			req.user.email = req.cookies.email
		}
		
		next()
		
	})
	
	app.use('/', require('../server/controller/ask.js'))
}


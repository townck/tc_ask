'use strict';
var Users = require('../tools/mongodb.js').getCollection('users')
	, getUid = require('../tools/tools.js').getUid
	, Manage = require('../tools/mongodb.js').getCollection('manage')

	
var posterList = [
	'/images/av6.gif'
	, '/images/small5.png'
	, '/images/10_avatar_middle.jpg'
	, '/images/middle2.png'
	, '/images/av1.gif'
	, '/images/av2.gif'
	, '/images/av3.gif'
	, '/images/av4.gif'
	, '/images/av5.gif'
	, '/images/small4.png'
]

module.exports = function(app)
{
	app.use(function(req, res, next)
	{
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
		
		Manage.findOne({}, function(err, manage){
			req.manage = manage || {}
			next()
		})
		
	})
	
	app.use('/', require('../server/controller/ask.js'))
	app.use(function(req, res, next){
		if( req.user.admin )
			next()
		else
			res.redirect('/')
	})
	
	app.use('/', require('../server/controller/admin.js'))
}


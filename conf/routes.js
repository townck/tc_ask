'use strict';
var Users = require('../tools/mongodb.js').getCollection('users')
	, getUid = require('../tools/tools.js').getUid
	, Manage = require('../tools/mongodb.js').getCollection('manage')
	, multipart = require('connect-multiparty')
	, multipartMiddleware = multipart()
	, path = require('path')
	, fs = require('fs')
	
var posterList = [
	'/images/av1.gif'
	, '/images/av2.gif'
	, '/images/av3.gif'
	, '/images/av4.gif'
	, '/images/av5.gif'
]

module.exports = function(app)
{
	app.post('/upload', multipartMiddleware, function(req, res) {
		var obj = req.files.uploadImg
	    var tmp_path = obj.path
		var name = getUid(10)+obj.name.replace(/ /g, '_')  
	    var new_path = "./public/images/upload/" + name
		
	    fs.rename(tmp_path,new_path,function(err){  
	        if(err){  
	           return res.json({err:err.toString()})
	        }
			
			res.end(JSON.stringify({ name: name  }))
//			res.end('true')
	    })  
	  // don't forget to delete all req.files when done
	});

	app.use(function(req, res, next)
	{
		if( !req.cookies._id ){
			req.cookies.poster = posterList[parseInt(Math.random() * posterList.length, 10)]
			req.cookies._id = getUid(16)
			res.cookie('_id', req.cookies._id)
			res.cookie('poster', req.cookies.poster)
		}
	
		req.user = {
			_id: req.cookies._id
			, poster: posterList[parseInt(Math.random() * posterList.length, 10)]
		}
		
		if( req.session.admin ){
			req.user.poster = '/images/av6.gif'
			req.user.admin = true
		}
		
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


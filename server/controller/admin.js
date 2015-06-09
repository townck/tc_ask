
var express = require('express')
	, router = express.Router()
	, getUid = require('../../tools/tools.js').getUid
	, Manage = require('../../tools/mongodb.js').getCollection('manage')
	, Questions = require('../../tools/mongodb.js').getCollection('questions')
	, Answers = require('../../tools/mongodb.js').getCollection('answers')
	, Tags = require('../../tools/mongodb.js').getCollection('tags')
	, spawn = require('child_process').spawn
	, dateFormat = require('../../tools/tools.js').dateFormat
	, exec = require('child_process').exec


var _id = '1234567890'

router.get('/admin/manage', function(req, res){
	res.render('manage', { manage: req.manage, user: req.user })
})

router.post('/admin/manage/update', function(req, res){
	Manage.updateById(_id, req.body, function(err){
		res.redirect('/admin/manage')
	})
})

router.get('/admin/question/edit/:_id', function(req, res){
	Questions.findById(req.params._id, function(err, doc){
		res.render('form', { manage: req.manage, question: doc, error: '', user: req.user })
	})
})

router.get('/admin/backup', function(req, res)
{
	var date = dateFormat(new Date, 'yyyyMMddhhmmss')
	var cmd = 'rm -r /root/tmp/backup/ask/*;mongodump -d ask -o /root/tmp/backup/;tar -cPvf /root/tc_ask/public/backup/ask'+ date +'.tar /root/tmp/backup'
	exec(cmd,function (error, stdout, stderr) {
	    res.redirect('/backup/ask'+ date +'.tar')
	})
})

router.post('/admin/question/update', function(req, res){
	Questions.findById(req.body._id, function(err, doc)
	{
		if( doc ){
			doc.tag.forEach(function(tag){
				Tags.updateById(tag, { $inc: { count: -1 } }, function(){})
			})
			
			var _id = req.body._id
			delete req.body._id
			
			req.body.tag = req.body.tag.replace(/ +/g, ' ').trim().split(' ')
			
			Questions.updateById(_id, { $set: req.body }, function(){
				req.body.tag.forEach(function(tag){
					
					Tags.update({ _id: tag }, { $inc: { count: 1 } }, { upsert: true }, function(){})	
				})
			})	
			
			return res.redirect('/detail/'+_id)
		}
								
		res.render('form', { manage: req.manage, question: req.body, error: true, user: req.user })
	
	})
})

router.get('/question/delete/:_id', function(req, res)
{
	Questions.findById(req.params._id, function(err, doc)
	{
		if( doc ){
			doc.tag.forEach(function(tag){
				Tags.updateById(tag, { $inc: { count: -1 } }, function(){})
			})
		}
		Questions.removeById(req.params._id, function(){
			res.redirect('/')
		})
	})
})

router.get('/answer/delete/:qid/:aid', function(req, res){
	Answers.remove({qid: req.params.qid, _id: req.params.aid }, function(){
		Questions.updateById(req.params.qid, { $inc: { answers: -1 } }, function(){})
		res.redirect('/detail/'+req.params.qid)
	})
})


module.exports = router


var express = require('express')
	, router = express.Router()
	, Questions = require('../../tools/mongodb.js').getCollection('questions')
	, Answers = require('../../tools/mongodb.js').getCollection('answers')
	, Tags = require('../../tools/mongodb.js').getCollection('tags')
	, Captcha = require('../../tools/mongodb.js').getCollection('captcha')
	, Users = require('../../tools/mongodb.js').getCollection('users')
	, getUid = require('../../tools/tools.js').getUid
	, dateFormat = require('../../tools/tools.js').dateFormat
	, getDateAgo = require('../../tools/tools.js').getDateAgo
	, ccap = require('ccap')()
	, Manage = require('../../tools/mongodb.js').getCollection('manage')
	, sm = require('sitemap')
	
function getSidebarData(done)
{
	Questions.find({}).sort({ answers: -1 }).limit(10).toArray(function(err, questions){
		Tags.find({ count: { $gte: 1 } }).sort({ count: -1 }).limit(50).toArray(function(err, tags){
			Questions.count({}, function(err, qcount){
				Answers.count({}, function(err, acount){
					done({ questions: questions || [], tags: tags || [], acount: acount, qcount: qcount })
				})
			})
		})
	})	
}
//
//router.post("/upload",function(req,res){  
//	console.log(req.files, req.file)
////    console.log("文件默认属性："+req.files.uploadImg);  
////    var obj = req.files.uploadImg;  
////    var tmp_path = obj.path;  
////    var new_path = "./public/images/"+obj.name;  
////    console.log("原路径："+tmp_path);  
////    fs.rename(tmp_path,new_path,function(err){  
////        if(err){  
////            throw err;  
////        }  
////    })  
//});  

router.get('/captcha', function(req, res)
{
	var ary = ccap.get();
	
    var value = ary[0];
	
    var buf = ary[1];
	
	Captcha.updateById(req.cookies._id, { $set: { value: value } }, { upsert: true }, function(){
    	res.end(buf);
	})
})

router.get(['/', '/search', '/list/:type', '/list/:type/:tag'], function(req, res)
{
	var sort = {}
		, query = {}
	
	req.params.type = req.params.type || 'all'
	var isPage = req.query.page === undefined ? false : true
	var page = req.query.page ? parseInt(req.query.page) : 0
	
	if( req.params.type === 'all' )
		sort = { date: -1 }
	else if ( req.params.type === 'hot' )
		sort = { answers: -1 }
	else if ( req.params.type === 'wait' ){
		query['$or'] = [ { answers: { $exists: false } }, { answers: 0 } ]
		sort = { date: -1 }
	}		
	
	if( req.params.tag )
		query.tag = { $in: [req.params.tag] }
	
	if( req.query.q )
		query['$or'] = [{ title: RegExp(req.query.q) }, { tag: {$in: [req.query.q] }}]
	
    Questions.find(query).sort(sort).limit(10).skip(page*10).toArray(function(err, list)
	{
		if( err )
			return res.render('error', { error: err })
		
		list.forEach(function(item){
			item.dateStr = getDateAgo(item.date)
			item.user = {name:item.user.name, poster: item.user.poster}
			delete item.email
			delete item.captcha
		})
		
		if( req.query.callback )
			return res.end(req.query.callback+ '('+ JSON.stringify(list)+ ')');
		
		if( isPage )
			return res.json(list)
		
		getSidebarData(function(data){
			res.render('index', { manage: req.manage, list: list, sidebar: data, type: req.params.type, queryTag: req.params.tag, isQuery: !!req.query.q, user: req.user })
		})
	})
})

router.get('/sitemap.xml', function(req, res) {
	
	var sitemap = sm.createSitemap({
        hostname: 'http://www.ask.townck.com',
        cacheTime: 600000,
        urls: [
            { url:'http://www.ask.townck.com', priority: 0.8, changefreq: 'always', lastmod: dateFormat(new Date(), 'yyyy-MM-dd') }
        ]
    })
	
	Questions.find({}).sort({ date: -1 }).limit(1000).toArray(function(err, datas)
	{
		datas.forEach(function(data){
			sitemap.add({url: 'http://www.ask.townck.com/detail/'+data._id, changefreq: 'always', lastmod: dateFormat(data.date, 'yyyy-MM-dd')  })
		})
		
		sitemap.toXML( function (xml) {
            res.header('Content-Type', 'application/xml')
            res.send(xml)
        })
	})
})

router.get('/form', function(req, res){
	res.render('form', { manage: req.manage, question: {}, error: '', user: req.user })
})

router.get('/admin/login', function(req, res){
	res.render('login', { manage: req.manage })
})

router.post('/login', function(req, res)
{
	Users.findOne({username: req.body.username, password: req.body.password }, function(err, user){
		req.session.admin = user
		res.redirect('/')
	})
})

router.get('/detail/:id', function(req, res)
{
	Questions.findById(req.params.id, function(err, doc){
		if(!doc)
			return res.redirect('/')
			console.log(doc)
		Answers.find({ qid: req.params.id }).toArray(function(err, answers){
			doc.dateStr = getDateAgo(doc.date)
			doc.date = dateFormat(doc.date, 'yyyy-MM-dd hh:mm')
			answers.forEach(function(answer){
				answer.dateStr = getDateAgo(answer.date)
				answer.date = dateFormat(answer.date, 'yyyy-MM-dd hh:mm')
			})
			
			getSidebarData(function(data){
				res.render('detail', { manage: req.manage, manage: req.manage, doc: doc, answers:answers, content: req.query.content, sidebar: data, user: req.user, error: req.query.error || '' })
			})
		})
	})
})

router.post('/answers/:qid', function(req, res)
{
	Captcha.findById(req.user._id, function(err, captcha)
	{
		if( err || !captcha || captcha.value.toUpperCase() !== req.body.captcha.toUpperCase() )
			return res.redirect('/detail/'+req.params.qid + '?error=captcha&content=' + encodeURI(req.body.content))
		
		if( !req.body.content )
			return res.redirect('/detail/'+req.params.qid)
		
		req.body._id = getUid(16)
		req.body.qid = req.params.qid
		req.body.user = req.user
		req.body.date = new Date
		
		Answers.insert(req.body, function(err){
			if( !err )
				Questions.updateById(req.params.qid, { $inc: { answers: 1 } }, function(){})
			
			res.redirect('/detail/'+req.params.qid)
		})
	})
})

router.post('/create', function(req, res)
{
	Captcha.findById(req.cookies._id, function(err, captcha)
	{
		req.body.tag = req.body.tag.replace(/ +/g, ' ').trim().split(' ')
		
		if( err || !captcha || captcha.value.toUpperCase() !== req.body.captcha.toUpperCase() )
			return res.render('form', { manage: req.manage, question: req.body, error: 'captcha', user: req.user })
		
		if( req.body.title && req.body.content && req.body.tag )
		{
			req.body.user = req.user
			
			req.body._id = getUid(8)
			req.body.date = new Date
			
			Questions.insert(req.body, function(err)
			{
				if( !err )
				{
					req.body.tag.forEach(function(tag){
						Tags.update({ _id: tag }, { $inc: { count: 1 } }, { upsert: true }, function(){})	
					})
					
					return res.redirect('/detail/'+req.body._id)
				}
				
				res.render('form', { manage: req.manage, question: req.body, error: true, user: req.user })
			})
		}
	})
	
})

router.post('/like', function(req, res){
	if( !req.body.answer_id )
		return res.json(400, {})
	
	Answers.count({ _id: req.body.answer_id, like: {$in:[ req.user._id ]} }, function(err, count){
		if( count !== 0 )
			return res.json(400, {})
				
		Answers.updateById(req.body.answer_id, { $addToSet: { like: req.user._id } }, function(err){
			if( err )
				return res.json(400, {})
			
			res.json({})
		})
	})
})

module.exports = router

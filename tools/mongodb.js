var mongoskin = require('mongoskin'),
	config = require('../conf/config.js'),
	db = null;

exports.getCollection = function (collectionName, mongodb_url) 
{
	// if (!db) 
	// {
		db = mongoskin.db(mongodb_url || config.mongodb_url + '?auto_reconnect=true&poolSize=3',
			{numberOfRetries: 1, retryMiliSeconds: 500, safe: true, native_parser: true},
			{socketOptions: {timeout: 5000}});
	// }
	
	return db.collection(collectionName);
}

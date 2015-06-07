var http = require('http')
var https = require('https')

function getUid(length) {
    var id = '', length = length || 20;
    while (length--) {
        id += (Math.random() * 16 | 0) % 2 ? (Math.random() * 16 | 0).toString(16) : (Math.random() * 16 | 0).toString(16).toUpperCase();
    }
    return id.toLowerCase();
}

function getDateAgo(date)
{
	var time = new Date().getTime()
	var ct= time - date

	ct= ct/1000

	if( ct > 31104000 ) return parseInt(ct / 31104000) + '年前'
	
	else if( ct > 2592000 ) return parseInt(ct / 2592000) + '个月前'

	else if( ct > 86400*2 ) return parseInt(ct / 86400) + '天前'

	else if( ct > 86400*2 ) return '昨天'

	else if( ct > 3600 ) return parseInt(ct / 3600) + '小时前'

	else if( ct > 60 ) return parseInt(ct / 60) + '分钟前'

	else if( ct > 0 ) return parseInt(ct) + '秒前'
}

function dateFormat(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

exports.getUid = getUid
exports.getDateAgo = getDateAgo
exports.dateFormat = dateFormat

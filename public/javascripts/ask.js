// JavaScript Document

function checkAnswerForm()
{
	var content = $('#content').val()
	var username = $('#username').val()
	var captcha = $('#captcha').val()
	
	if( content.length < 5 || content.length > 1000 ){
		alert('请输入长度小于5 并且小于1000 的内容')
		$("#content").focus();
		return false
	}
	
	if( username.length < 4 || username.length > 15 ){
		alert('请输入长度大于4 并且小于100 的临时用户名')
		$("#username").focus();
		return false
	}
	
	if( captcha.length !== 6 ){
		alert('验证码不合法')
		$("#captcha").focus();
		return false
	}
	
    return true;	
}

function checkForm(){
	
	var title = $('#title').val()
	var content = $('#content').val()
	var email = $('#email').val()
	var tag = $('#tag').val()
	var username = $('#username').val()
	var captcha = $('#captcha').val()
	
	if( title.length < 5 || title.length > 100 ){
		alert('请输入长度大于5 并且小于100 的标题')
		$("#title").focus();
		return false
	}
	
	if( content.length < 5 || content.length > 1000 ){
		alert('请输入长度大于5 并且小于1000 的详细内容')
		$("#content").focus();
		return false
	}
	
	if( tag.length < 1 || tag.length > 50 ){
		alert('请输入最少一个标签')
		$("#tag").focus();
		return false
	}
	
	if( username.length < 4 || username.length > 15 ){
		alert('请输入长度大于4 并且小于15的临时用户名')
		$("#username").focus();
		return false
	}
	
	if( captcha.length !== 6 ){
		alert('验证码不合法')
		$("#captcha").focus();
		return false
	}
	
	var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
	
	console.log(email)
	if (!reg.test(email)) {
        alert(email + "不是有效的Email地址，请输入有效的Email地址！");
        $("#email").focus();
		return false
    }
	
	console.log(title, content, email, tag)
    return true;
}


$(function(){ 
	
	$(document).click(function(){
		$(".ask_tagmain_list_bbs_select_list").hide();
	});
	//$("*[class!='ask_tagmain_list_bbs_select_title']").click(function(){
		//$(".ask_tagmain_list_bbs_select_list").hide();
	//}); 
	if($(".js_fid_con").html()=='请选择论坛板面'){$("#fid").val(0)};
	$(".js_li_fid").each(function(){
		if($(this).find("a").attr("alt") == 0){
			$(".js_fid_con").html($(this).find("a").html());
			$("#fid").val($(this).find("a").attr("alt"));
		}
	});
	$(".ask_tagmain_list_bbs_select_list li ul").find("li:first").css("border","0");
	$(".ask_tagmain_list_bbs_select_title_click").click(function(event)
		{
			event.stopPropagation();
			if($(".ask_tagmain_list_bbs_select_list").is(":hidden"))
			{
				$(this).find(".ask_tagmain_list_bbs_select_title1")
				.removeClass("ask_tagmain_list_bbs_select_title1")
				.addClass("ask_tagmain_list_bbs_select_title2");
				
				$(this).next(".ask_tagmain_list_bbs_select_list").show();
			}else{
				$(this).find(".ask_tagmain_list_bbs_select_title2")
				.removeClass("ask_tagmain_list_bbs_select_title2")
				.addClass("ask_tagmain_list_bbs_select_title1");
				
				$(this).next(".ask_tagmain_list_bbs_select_list").hide();
			}
		}
	);
	$(".ask_tagmain_list_bbs_select_list").find("ul").click(function(event){
			if(event.target!="javascript:void(0);"){
				event.stopPropagation();
			}
		});
	$(".ask_tagmain_list_bbs_select_list").find("li").hover(
		function(){
			$(this).find("strong").addClass("ask_tagmain_list_bbs_select_list_s");
			$(this).find("ul").show();
		},
		function(){
			$(this).find("strong").removeClass("ask_tagmain_list_bbs_select_list_s");
			$(this).find("ul").hide();
		}
	);
	$(".js_li_fid a").click(function(){
	$(".ask_tagmain_list_bbs_select_content").html($(this).html())

	})
	$(".js_ask_close_tip").click(function(){
		$(this).parent("div").first().css("display","none")
		})
});	
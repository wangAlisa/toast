//dialog对话框插件
//author:finemi  作者：卢有佳
//Last-Modified:2014-12-28
function dialog(params){
	var type = params['type']?params['type']:0;//对话框类型：0、确认取消对话框 1、确认对话框  1、信息框
	var content = params['content']?params['content']:"";//文本内容
	var icon = params['icon']?params['icon']:(type==0?"question":"info");//对话框类型：question、info、warning、error、right
	var animateType;//对话框动画类型：0、1、
	if(params['animateType']==undefined)
		animateType = type==2?1:0;
	else
		animateType=params['animateType'];
	
	var animateSpeed;//对话框动画执行时间（数组[in,out]）
	if(params['animateSpeed']==undefined)
		animateSpeed=type==2?[500,500]:[300,100];
	else
		animateSpeed=params['animateSpeed'];
		
	
	var btns;//按钮文字（数组）
	if(params['btns']==undefined)
		btns=type==0?["确认","取消"]:["我知道了"];
	else
		btns=params['btns'];
	
	//注意类型1的对话框（只有确认按钮的），不管关闭还是点按钮关闭都是触发的ok事件，所以esc和回车也都是触发ok事件
	var useHotkey = params['useHotkey']?params['useHotkey']:true;//是否注册热键（回车确认，esc关闭）
	
	var canMove = params['canMove']?params['canMove']:true;//可否移动
	
	var timeOut = params['timeOut']?params['timeOut']:2000;//自动关闭时间，-1为不关闭（只针对信息框）
	
	var hasShade;//是否有遮罩
	if(params['hasShade']==undefined)
		hasShade=type!=2?true:false;
	else
		hasShade=params['hasShade'];
	
	var shadeColor = params['shadeColor']?params['shadeColor']:"#000";//遮罩颜色
	
	var shadeOpacity = params['shadeOpacity']?params['shadeOpacity']:0.3;//遮罩透明度
	var shadeAnimateSpeed = params['shadeAnimateSpeed']?params['shadeAnimateSpeed']:[0,0];//遮罩动画时间，数组[in,out]
	
	var isShadeClose;//是否点击遮罩关闭对话框
	if(params['isShadeClose']==undefined)
		isShadeClose=type==0?false:true;
	else
		isShadeClose=params['isShadeClose'];
	
	//回调函数
	var ok = params['ok']?params['ok']:function(){};//对于type=0：按钮1事件  type=1：按钮点击、关闭窗口等所有事件  type=2：自动关闭时的事件
	var cancel = params['cancel']?params['cancel']:function(){};//只对type=0有效，点击取消按钮或所有关闭窗口的动作

	/* ==========  分割  ========== */
	
	/* 构建组件 */
	var $shade = $("<div class='dialog-shade'></div>")
	
	var $main = $("<div class='dialog-main'><div class='dialog-topBorder'></div></div>");
	var $top = $("<div class='dialog-top'><div class='dialog-top-close'></div></div>");
	var $middle = $("<div class='dialog-middle'></div>");
	var $icon = $("<div class='dialog-icon'></div>");
	var $content = $("<div class='dialog-content'></div>");
	var $btns = $("<div class='dialog-btns'></div>");
	var $btn1 = $("<div class='dialog-btn-1'></div>");
	var $btn2 = $("<div class='dialog-btn-2'></div>");
	
	var $close = $top.find(" .dialog-top-close");

	//必须先加入到实际文档中才能得到真实宽高
	var $body = $("body");
	var $wd = $(window);//用window对象获取窗口高度，而非body的高度，否则垂直居中和阴影body如果太高或太短可能使对话框位置不正确
	
	$body.append($main);
	if(hasShade)
		$body.append($shade);
	
	var imagePath = $("script[src$='dialog.js']").prop('src').replace("dialog.js","image")+"/icons.png";
	var icleft=0;
	var icright=0;
	switch(icon){
		case 'question':
			icleft='-107px';
			ictop='-4px';
			break;
		case 'info':
			icleft='-212px';
			ictop='-4px';
			break;
		case 'warning':
			icleft='-264px';
			ictop='-4px';
			break;
		case 'error':
			icleft='-160px';
			ictop='-4px';
			break;
		case 'right':
			icleft='-54px';
			ictop='-4px';
			break;
	}
	
	
	
	$shade.css({
		'position':'fixed','top':'0px','left':'0px','width':'100%','height':$wd.height(),'z-index':99990,'opacity':0,'background-color':shadeColor,
	});
	
	$main.css({
		'background-color':'#fff','overflow':'hidden','z-index':99991,'border-radius':'3px','position':'fixed','font-size':'14px','font-family':'Microsoft YaHei','line-height':1.3,'color':'#333','opacity':0
	}).find(' .dialog-topBorder').css({
		'height':'2px','background-color':'#4db748'
	});
	$top.css({
		'height':'36px','position':'relative'
	});
	$close.css({
		'position':'absolute','right':'12px','top':'9px','background':'url('+imagePath+') -7px -5px no-repeat','width':'12px','height':'12px','cursor':'pointer'
	});
	$middle.css({
		'height':'73px'
	});
	$icon.css({
		'width':'37px',
		'height':'42px',
		'background':'no-repeat url('+imagePath+') '+icleft+' '+ictop,
		'margin':'15px auto 0 auto'
	});
	$content.css({
		'margin':'0 40px 25px 40px','text-align':'center','max-width':'340px','min-width':type==2?'65px':'150px'
	}).html(content);
	$btns.css({
		'height':'56px','background-color':'#f2f2f2','position':'relative'
	});
	$btn1.css({
		'padding':'0 22px','line-height':'36px','text-align':'center','position':'absolute','border-radius':'2px','background-color':'#4db748','color':'#fff','box-shadow':'rgba(0, 0, 0, 0.247059) 0px 1px 2px','border':'#45B245 1px solid','cursor':'pointer','margin-top':'10px'
	}).html(btns[0]);
	$btn2.css({
		'padding':'0 22px','line-height':'36px','text-align':'center','position':'absolute','border-radius':'2px','background-color':'#fff','color':'#333','box-shadow':'rgba(0, 0, 0, 0.0980392) 0px 1px 2px','border':'#d9d9d9 1px solid','cursor':'pointer','margin-top':'10px'
	}).html(type==0?btns[1]:btns[0]);
	
	
	var padding1 = parseInt($btn1.css('padding-left').replace("px","")) + parseInt($btn1.css('padding-right').replace("px",""));
	var padding2 = parseInt($btn2.css('padding-left').replace("px","")) + parseInt($btn2.css('padding-right').replace("px",""));
	$middle.append($icon);
	if(type!=2)
		$main.append($top);
		$main.append($middle).append($content);
	if(type!=2)
		$main.append($btns);
	if(type==1){
		$btns.append($btn2);
		$btn2.css("left",($btns.width()-$btn2.width()-padding2)/2);
		$btns.append($btn2);
	}
	if(type==0){
		$btns.append($btn1);
		$btns.append($btn2);
		var temp = ($btns.width()-($btn1.width() + $btn2.width()+padding1+padding2+  13))/2;
		$btn1.css("left",temp);
		$btn2.css("left",temp+$btn1.width()+padding1+13);
	}
	/* 构建组件 end */
	
	/* 绑定基本效果事件 */
	$close.hover(function(){$close.css('background-position','-23px -5px');},function(){$close.css('background-position','-7px -5px');});
	$btn1.hover(function(){$btn1.css('background-color','#4bb046');},function(){$btn1.css('background-color','#4db748');});
	$btn2.hover(function(){$btn2.css('box-shadow','rgba(0, 0, 0, 0.14902) 0px 1px 1px');},function(){$btn2.css('box-shadow','rgba(0, 0, 0, 0.0980392) 0px 1px 2px');});
	/* 绑定基本效果事件 */
	
	
	
		var oldresize = window.onresize;//原window改变大小事件
	if(useHotkey){
		var oldkeyup = window.onkeyup;//原window键弹起事件
	}
	
	/* 主要事件 */
	function back(index){//关闭
		var top = parseInt($main.css("top").replace("px",""));
		var left = parseInt($main.css("left").replace("px",""));
		
		//---------配置退出动画类型--------------
		var animate;
		switch(animateType){
			case 0:
				animate={
					top:top+$main.height()/2,
					left:left+$main.width()/2,
					width:0,
					height:0,
					opacity:0
				};
				break;
			case 1:
				animate={
					top:top-50,
					opacity:0
				};
			break;
			case 2:
				animate={
					top:top+50,
					opacity:0
				};
				break;
		}
		//---------执行退出动画----------
		$shade.animate({opacity:0},shadeAnimateSpeed[1],function(){$shade.remove();});
		$main.animate(animate,animateSpeed[1],function(){
			$main.remove();
			if(type==0){
				if(index==0) ok();
				else cancel();
			}else{
				ok();
			}
		});
		
		
		
		//恢复window原绑定事件
		window.onresize = oldresize;
		if(useHotkey){
			window.onkeyup = oldkeyup;
		}
		
	}
	
	$close.click(function(){back(1);});
	$btn1.click(function(){back(0);});
	$btn2.click(function(){back(1);});
	if(isShadeClose)
		$shade.click(function(){back(1);});
	/* 主要事件 */
	
	/* 载入 */		
	var mWidth = $main.width();
	var mHeight = $main.height();
	var mLeft = ($wd.width()-mWidth)/2;
	var mTop = ($wd.height()-mHeight)/2;
	
	
	
	//---------配置进入动画类型-------------
	var animate;
	var css;
	var inCallback;
	if(animateType==0){
		css = {
			"left":mLeft + mWidth/2,
			"top":mTop + mHeight/2,
			"width":0,
			"height":0
		};
		animate = {
			width:mWidth+10,
			height:mHeight+10,
			left:mLeft-5,
			top:mTop-5,
			opacity:0.8
		}
		inCallback = function(){
			$main.animate({
				width:mWidth,
				height:mHeight,
				left:mLeft,
				top:mTop,
				opacity:1
			},animateSpeed[0]/10,function(){
				if(type==2 && timeOut!=-1)
					window.setTimeout(function(){back(1)},timeOut);
			})
		};
	}else{
		inCallback = function(){
				if(type==2 && timeOut!=-1)
					window.setTimeout(function(){back(1)},timeOut);
		};
		
		switch(animateType){
			case 1:
				css = {
					"left":mLeft,
					"top":mTop+50
				};
				animate = {
					top:mTop,
					opacity:1
				}
				break;
			case 2:
				css = {
					"left":mLeft,
					"top":mTop-50
				};
				animate = {
					top:mTop,
					opacity:1
				}
				break;
		}
	}
	
	
	//---------执行进入动画-------------
	if(hasShade)
		$shade.animate({opacity:shadeOpacity},shadeAnimateSpeed[0]);
	
	$main.css(css);
	$main.animate(animate,animateSpeed[0],inCallback);


	
	//窗口改变大小调整对话框位置与遮罩大小
	var refunc = function(){
		$shade.width($wd.width()).height($wd.height());
		mLeft = ($wd.width()-mWidth)/2;
		mTop = ($wd.height()-mHeight)/2;
		$main.css({"left":mLeft,"top":mTop});
	}
	if(typeof window.onresize != 'function'){
		$wd.resize(refunc);
	}else{
		$wd.resize(function(){
			oldresize();
			refunc();
		});
	}
	
	
	if(useHotkey){//注册回车确认、ESC关闭事件
		var keyup = function(e){
			if(e.keyCode===13){
				$btn1.click();
			}else if(e.keyCode===27){
				$close.click();
			}
			
		}
		if(typeof window.onkeyup != 'function'){
			window.onkeyup = keyup;
		}else{
			$wd.resize(function(){
				oldkeyup();
				keyup();
			});
		}
	}

		
	//移动
	if(canMove){
		var isdown=false,mvWidth,mvHeight;
		$main.on({
			mousedown:function(e) {
				if(e.target.className=="dialog-btn-1" ||  e.target.className=="dialog-btn-2" || e.target.className=="dialog-top-close"){
					return;
				}
				isdown=true;
				mvWidth = e.clientX - mLeft;
				mvHeight = e.clientY - mTop;
				$main.css({"opacity":0.8,"cursor":"move"});
			},
			mouseup:function(){
				isdown=false;
				$main.css({"opacity":1,"cursor":"default"});
			},
			mousemove:function(e){
				if(isdown){
					mLeft = e.clientX - mvWidth;
					mTop = e.clientY - mvHeight;
					$main.css({"left":mLeft,"top":mTop});
				}
			}
		});
	}
	/* 载入 end */
}
<!-- 支付特效-->
$(document).ready(function(){
	$("button").mouseover(100,function(){
		$("#pay").show()
		}
	)
	$("button").mouseleave(100,function(){
		$("#pay").hide()
		})
	}
)

<!-- 菜单特效-->
/*$(".glyphicon-th-list").bind("click",function(){
	$("li").fadeIn()
});
if($(".menu li").css("display")==""){
	$("body").bind("click",function(){
	$("li").hide()
})
}*/

$(".glyphicon-th-list").bind("click",function(){
	$("li").toggle(500)
})

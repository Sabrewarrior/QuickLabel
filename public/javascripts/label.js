$(document).ready(function () {
    $("input[name='tb_filter']").change(function(){
		var label = $( this ).name();
        var value = $( this ).val();
        var cur_id = document.getElementById("cur_id").textContent;
        console.log(cur_id);
            //console.log($( this ).val());
        $.ajax({
            type: "GET",
            url: "/save/" + cur_id  + "/" + label + "/" + value
        })
    });
});
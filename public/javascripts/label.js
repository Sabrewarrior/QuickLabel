$(document).ready(function () {
    $("input[name='tb_filter']").change(function(){
        $.ajax({
            type: "GET",
            url: "/save/"$("input[name='tb_filter']").val(),
            cache: false,
        })
    })
});
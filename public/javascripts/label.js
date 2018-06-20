$(document).ready(function () {
    $(".input_form").change(function(){

		var label = $( this );
		console.log(label);
		console.log(label[0].attributes.name.value);
        var node_list = document.getElementsByName(label[0].attributes.name.value);
        var values_list = [];
        node_list.forEach(function(item){
            if (item.checked || item.type === "text"){
                values_list.push(item.value)
            }
        });

        var value = $( this ).val();
        var cur_id = document.getElementById("cur_id").textContent;
        console.log(cur_id);
            //console.log($( this ).val());
        $.ajax("save/" + cur_id  + "/" + label[0].attributes.name.value, {
            type: 'POST',
            data: JSON.stringify({"values": values_list}),
            contentType: 'application/json'
        })
    });
});
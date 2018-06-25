$(document).ready(function () {
    var height = $("#one").height();
    if(height > 0) {
        $("#two").css("margin-top",height);
    }

    $( '.dropdown-menu a' ).on( 'click', function( event ) {

        var $target = $( event.currentTarget ),
            val = $target.attr( 'data-value' ),
            $inp = $target.find( 'input' ),
            idx;
        console.log($inp.prop("checked") === false);
        $inp.prop("checked", !$inp.prop("checked"));
        $( event.target ).blur();
        let label = $inp;
        $('#save')[0].textContent = 'Save';
        let value = $inp.prop("checked");
        let cur_id = document.getElementById("cur_id").textContent;
        // console.log(cur_id);
        //console.log($( this ).val());
        let node_list = document.getElementsByName(label[0].attributes.name.value);
        let values_list = [];
        node_list.forEach(function(item){
            if (item.checked || item.type === "text"){
                values_list.push(item.value)
            }
        });
        $.ajax("save/" + cur_id  + "/" + label[0].attributes.name.value, {
            type: 'POST',
            data: JSON.stringify({"values": values_list}),
            contentType: 'application/json'
        });
        return false;
    });

    $( '.dropdown-menu input' ).on( 'click', function( event ) {
        var $target = $( event.currentTarget );
        console.log($target);
        $target.prop("checked", !$target.prop("checked"));
        $( event.target ).blur();

        return false;
    });

    $('#save').click(function(){
        $('#save')[0].textContent = 'Saving';
        $.ajax("/save", {
            type: 'GET',
            success: function(data) {
                $('#save')[0].textContent = 'Saved';
            },
            error: function(data) {
                $('#save')[0].textContent = 'Failed';
                alert(JSON.stringify(data.responseJSON).slice(1,-1).split(",").join("\n"))
            }
        })
    });

    $("input").keydown(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });

    $(".input_form").change(function(){
        console.log("HERE");
		let label = $( this );
		// console.log(label);
		// console.log(label[0].attributes.name.value);

        $('#save')[0].textContent = 'Save';
        let value = $( this ).val();
        let cur_id = document.getElementById("cur_id").textContent;
        // console.log(cur_id);
        //console.log($( this ).val());
        $.ajax("save/" + cur_id  + "/" + label[0].attributes.name.value, {
            type: 'POST',
            data: JSON.stringify({"values": values_list}),
            contentType: 'application/json'
        })
    });
});
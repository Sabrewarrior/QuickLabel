$(document).ready(function () {
    var height = $("#one").height();
    if(height > 0) {
        $("#two").css("margin-top",height);
    }
    function saveID(label){
        $('#save')[0].textContent = 'Save';
        let cur_id = document.getElementById("cur_id").textContent;
        let node_list = document.getElementsByName(label[0].attributes.name.value);
        let values_list = [];
        node_list.forEach(function(item){
            if (item.checked || item.type === "text" || item.type === "date"){
                values_list.push(item.value)
            }
        });
        $.ajax("save/" + cur_id, {
            type: 'POST',
            data: JSON.stringify({"variable": label[0].attributes.name.value,
                "values": values_list}),
            contentType: 'application/json'
        });
    }
    // the input field
    var $input = $("input[id='searchText']"),
        // clear button
        $clearBtn = $("button[data-search='clear']"),
        // prev button
        $prevBtn = $("button[data-search='prev']"),
        // next button
        $nextBtn = $("button[data-search='next']"),
        // the context where to search
        $content = $(".searchable"),
        // jQuery object to save <mark> elements
        $results,
        // the class that will be appended to the current
        // focused element
        currentClass = "current",
        // top offset for the jump (the search bar)
        offsetTop = height + 100,
        // the current index of the focused element
        currentIndex = 0;

    /**
     * Jumps to the element matching the currentIndex
     */
    function jumpTo() {
        if ($results.length) {
            var position,
                $current = $results.eq(currentIndex);
            $results.removeClass(currentClass);
            if ($current.length) {
                $current.addClass(currentClass);
                position = $current.offset().top - offsetTop;
                window.scrollTo(0, position);
            }
        }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    $input.on("input", function() {
        var searchVal = this.value;
        $content.unmark({
            done: function() {
                $content.mark(searchVal, {
                    separateWordSearch: true,
                    element: "span",
                    className: "mark-highlight",
                    done: function() {
                        $results = $content.find(".mark-highlight");
                        currentIndex = 0;
                        jumpTo();
                    }
                });
            }
        });
    });

    /**
     * Clears the search
     */
    $clearBtn.on("click", function() {
        $content.unmark();
        $input.val("").focus();
        document.getElementById("searchbar").style.display = "none";

        return false;
    });

    /**
     * Next and previous search jump to
     */
    $nextBtn.add($prevBtn).on("click", function() {
        if ($results !== undefined && $results.length) {
            currentIndex += $(this).is($prevBtn) ? -1 : 1;
            if (currentIndex < 0) {
                currentIndex = $results.length - 1;
            }
            if (currentIndex > $results.length - 1) {
                currentIndex = 0;
            }

            jumpTo();
        }
        return false;
    });

    $( '.dropdown-menu a' ).on( 'click', function( event ) {
        var $target = $( event.currentTarget ),
            val = $target.attr( 'data-value' ),
            $inp = $target.find( 'input' ),
            idx;
        // console.log($inp.prop("checked") === false);
        $inp.prop("checked", !$inp.prop("checked"));
        $( event.target ).blur();
        saveID($inp);
        return false;
    });

    $(".input_form").change(function(){
        // console.log("HERE");
        let label = $( this );
        // console.log(label);
        // console.log(label[0].attributes.name.value);

        saveID(label);
    });

    $( '.dropdown-menu input' ).on( 'click', function( event ) {
        var $target = $( event.currentTarget );
        // console.log($target);
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

    window.addEventListener('keydown', function(event){
        var searchText = document.getElementById("searchText");
        if (event.defaultPrevented) {
            return; // Should do nothing if the default action has been cancelled
        }
        var handle_find = false,
            handle_escape = false;
        if (event.key !== undefined){
            // console.log(event.key);
            if (event.key === "F3" || (event.ctrlKey && event.key === "f")){
                handle_find = true;
            }
            if (event.key === "Escape" && document.activeElement === searchText) {
                handle_escape = true;
            }
        } else if (event.keyIdentifier !== undefined){
            console.log(event.keyIdentifier);
        } else if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
            handled = true;
        }
        if (handle_escape) {
            document.getElementById("searchbar").style.display = "none";
            // Suppress "double action" if event handled
            event.preventDefault();
        } else if (handle_find) {
            document.getElementById("searchbar").style.display = "block";
            searchText.focus();
            // Suppress "double action" if event handled
            event.preventDefault();
        }
    });

    $("input").keydown(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });


});
$(document).ready(function () {
    let height = $("#one").height();
    if(height > 0) {
        $( '#two' ).css("margin-top", height);
    }
    let cur_id = document.getElementById("cur_id").textContent;
    let searchDisplay = document.getElementById("searchbar");
    let searchText = document.getElementById("searchText");

    // the input field
    let $searchInput = $("input[id='searchText']"),
        // clear button
        $searchClearBtn = $("button[data-search='clear']"),
        // prev button
        $searchPrevBtn = $("button[data-search='prev']"),
        // next button
        $searchNextBtn = $("button[data-search='next']"),
        // the context where to search
        $searchContent = $(".searchable"),
        // jQuery object to save <mark> elements
        $searchResults,
        // the class that will be appended to the current
        // focused element
        currentClass = "current",
        // top offset for the jump (the search bar)
        offsetTop = height + 100,
        // the current index of the focused element
        searchCurrentIndex = 0;

    /**
     * Jumps to the element matching the searchCurrentIndex
     */
    function jumpTo(performJump) {
        if ($searchResults.length) {
            let position,
                $current = $searchResults.eq(searchCurrentIndex);
            $searchResults.removeClass(currentClass);
            if ($current.length) {
                $current.addClass(currentClass);
                if(performJump){
                    position = $current.offset().top - offsetTop;
                    window.scrollTo(0, position);
                }
            }
        }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    function getSearch(jump){
        if ($searchInput.prop("value") !== undefined || $searchInput.prop("value") !== ""){
            $searchContent.unmark({
                done: function() {
                    $searchContent.mark($searchInput.prop("value"), {
                        separateWordSearch: false,
                        element: "span",
                        className: "mark-highlight",
                        done: function() {
                            $searchResults = $searchContent.find(".mark-highlight");
                            if (jump){
                                searchCurrentIndex = 0;
                            }
                            jumpTo(jump);
                        },
                        noMatch: function(){
                        }
                    });
                }});
        } else {
            searchCurrentIndex = 0;
        }
    }

    $searchInput.on("input", function(){
        getSearch(true);
    });

    /**
     * Clears the search
     */
    function clearSearch(){
        $searchContent.unmark();
        searchDisplay.style.display = "none";
        return false;
    }

    $searchClearBtn.on("click", clearSearch);

    /**
     * Next and previous search jump to
     */
    $searchNextBtn.add($searchPrevBtn).on("click", function() {
        if ($searchResults !== undefined && $searchResults.length) {
            searchCurrentIndex += $(this).is($searchPrevBtn) ? -1 : 1;
            if (searchCurrentIndex < 0) {
                searchCurrentIndex = $searchResults.length - 1;
            }
            if (searchCurrentIndex > $searchResults.length - 1) {
                searchCurrentIndex = 0;
            }

            jumpTo(true);
        }
        return false;
    });

    function saveID(variableName){
        $( '#save' ).prop("textContent", "Save");
        let values_list = [];
        // Use ID for faster traversing
        let node_list = document.getElementById(variableName).getElementsByClassName("single_element");

        [].forEach.call(node_list, function(item){
            if (item.checked || item.type === "text" || item.type === "date"){
                values_list.push(item.value)
            }
        });
        $.ajax("save/" + cur_id, {
            type: 'POST',
            data: JSON.stringify({"variable": variableName,
                "values": values_list}),
            contentType: 'application/json'
        });
    }

    $( '.dropdown-menu a' ).on( 'click', function( event ) {
        let $target = $( event.currentTarget ),
            $inp = $target.find( '.single_element' );
        $inp.prop("checked", !$inp.prop("checked"));
        $( event.target ).blur();
        saveID($target.prop("name"));
        return false;
    });

    $( '.input_form' ).change(function(){
        let label = $( this ).prop("name");
        saveID(label);
    });

    $( '#save' ).click(function(){
        $( '#save' ).prop("textContent", "Saving");
        $.ajax("/save", {
            type: 'GET',
            success: function(data) {
                $( '#save' ).prop("textContent", "Saved");
            },
            error: function(data) {
                $( '#save' ).prop("textContent", "Failed");
                alert(JSON.stringify(data.responseJSON).slice(1,-1).split(",").join("\n"))
            }
        })
    });

    if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
        document.getElementById("settings").style.display = "inline-block";
        $( '#settings' ).click(function(){
            window.location.href = "/settings";
        });
    }

    window.addEventListener('keydown', function(event){
        if (event.defaultPrevented) {
            return; // Should do nothing if the default action has been cancelled
        }
        let handle_find = false,
            handle_escape = false;
        if (event.key !== undefined){
            if (event.key === "F3" || (event.ctrlKey && event.key === "f")){
                handle_find = true;
            } else if (event.key === "Escape" && document.activeElement === searchText) {
                handle_escape = true;
            }
        } else if (event.keyCode !== undefined){
            if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)){
                handle_find = true;
            } else if (event.keyCode === 27 && document.activeElement === searchText) {
                handle_escape = true;
            }
        }

        if (handle_escape) {
            clearSearch();
            // Suppress "double action" if event handled
            event.preventDefault();
        } else if (handle_find) {
            searchDisplay.style.display = "block";
            searchText.focus();
            getSearch(false);
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
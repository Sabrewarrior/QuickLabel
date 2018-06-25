function searchAndHighlight(searchTerm, selector) {
    if(searchTerm) {
        //var wholeWordOnly = new RegExp("\\g"+searchTerm+"\\g","ig"); //matches whole word only
        //var anyCharacter = new RegExp("\\g["+searchTerm+"]\\g","ig"); //matches any word with any of search chars characters
        var selector = selector || "body";                             //use body as selector if none provided
        var searchTermRegEx = new RegExp(searchTerm,"ig");

        //console.log(cur_spans);
        //cur_spans.html().replace()
        var matches = $(selector).text().match(searchTermRegEx);
        if(matches) {
            //Remove old search highlights
            $(selector).html($(selector).html()
                .replace(searchTermRegEx, function(repl){
                    return "<span class='highlight'>"+repl+"</span>"
                }));
            if($('.highlight:first').length) {             //if match found, scroll to where the first one appears
                $(window).scrollTop($('.highlight:first').position().top);
            }
            return true;
        }
    }
    return false;
}

function clearHighlight(selector){
    var selector = selector || "body";                             //use body as selector if none provided
    var searchTermRegEx = new RegExp(searchTerm,"ig");
    $(selector).html($(selector).html()
        .replace(/<span class='highlight'>/, " ")
        .replace(/<\/span>/, " "));
}

$(document).ready(function() {
    var lstEl;
    var cntr;
    $('#btnSearch').click(function() {
        lstEl = null;
        cntr = -1;
        searchAndHighlight(document.getElementById('searchTerm').value, "#two");
    });
    $('#btnClear').click(function() {
        lstEl = null;
        cntr = -1;
        clearHighlight("#two");
    });

    $('#btnNext').click(function() {
        alert(cntr);
        if (lstEl === null) {
            lstEl = $('#two').find('span.highlight');
            if (!lstEl || lstEl.length === 0) {
                lstEl = null;
                return;
            }
        }
        if (cntr < lstEl.length - 1) {
            cntr++;
            if (cntr > 0) {
                $(lstEl[0]).removeClass('current');
            }
            var elm = lstEl[cntr];
            $(elm).addClass('current');
        } else
            alert("End of search reached!");
    });

    $('#btnPrev').click(function() {
        alert(cntr);
        if (lstEl === null) {
            lstEl = $('#two').find('span.highlight');
            if (!lstEl || lstEl.length === 0) {
                lstEl = null;
                return;
            }
        }
        if (cntr > 0) {
            cntr--;
            if (cntr < lstEl.length) {
                $(lstEl[cntr + 1]).removeClass('current');
            }
            var elm = lstEl[cntr];
            $(elm).addClass('current');
        } else
            alert("Begining of search!");
    });
});
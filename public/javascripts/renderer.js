if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    const {ipcRenderer} = require('electron');

    const selectDataFileBtn = document.getElementById('openDataSelector');
    const selectMapFileBtn = document.getElementById('openMapSelector');
    const selectSaveFolderBtn = document.getElementById('openSaveSelector');

    selectDataFileBtn.addEventListener('click', (event) => {
        ipcRenderer.send('open-file-dialog', 'dataFile')
    });

    selectMapFileBtn.addEventListener('click', (event) => {
        ipcRenderer.send('open-file-dialog', 'mapFile')
    });

    selectSaveFolderBtn.addEventListener('click', (event) => {
        ipcRenderer.send('open-folder-dialog', 'saveFolder')
    });

    ipcRenderer.on('selected-file', (event, element, path) => {
        $( '#load' ).prop("textContent", "Load");
        document.getElementById(element).value = `${path}`
    });

    ipcRenderer.on('selected-folder', (event, element, path) => {
        $( '#load' ).prop("textContent", "Load");
        document.getElementById(element).value = `${path}`
    });

    $( '#load' ).click(function(){
        $( '#load' ).prop("textContent", "Loading");
        $.ajax("/load", {
            type: 'POST',
            data: JSON.stringify({"charts_file": "/Users/Ujash/WebstormProjects/QuickLabel/example/data.csv" ,
                "label_map_file": "/Users/Ujash/WebstormProjects/QuickLabel/example/map.csv" ,
                "save_location": "/Users/Ujash/WebstormProjects/QuickLabel/example"}),
            /*data: JSON.stringify({"charts_file": document.getElementById("dataFile").value ,
                                        "label_map_file": document.getElementById("mapFile").value ,
                "save_location": document.getElementById("saveFolder").value
            }),*/
            contentType: 'application/json',
            success: function(data) {
                window.location.href = "/";
            },
            error: function(data) {
                $( '#load' ).prop("textContent", "Failed");
                alert(JSON.stringify(data.responseJSON).slice(1,-1).split(",").join("\n"))
            }
        })
    });
}

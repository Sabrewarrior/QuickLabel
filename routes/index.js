// node_modules\nodemon\bin\nodemon
const express = require('express');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
let save_status = "Save";
let load_status = "Load";
let router = express.Router();

let unique_ids;
let id_dict;
let labels;
let label_map;
let set_array;


// let neighbourhood_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\active_tb.csv";
// let charts_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\Data_Unlabeled(Clean).csv";
// let label_map_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\labels_map.csv";

//let charts_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\Jane_list_unlabeled(Clean).csv";
//let label_map_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\test_map.csv";
//let save_location = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\Labels\\Finished";

//let neighbourhood_file = "./example/test.csv";

// Paths loaded through settings file or settings page in electron.
let charts_file;
let label_map_file;
let save_location;
let version_num;
let write_flag;

fs.readFile('settings.json', (err, data) => {
    if (err) {
        if (err.code === "ENOENT"){
            charts_file = "./example/data.csv";
            label_map_file = "./example/map.csv";
            save_location = "./example/test_run";
        } else {
            console.log(err);
        }
    } else {
        let settings = JSON.parse(data);
        charts_file = settings["charts_file"];
        label_map_file = settings["label_map_file"];
        save_location = settings["save_location"];
    }
});


// Electron only
let dialog;
let ipcMain;

reset_data();

if (!isElectron()){
    // check settings file
    parse_files(label_map_file, charts_file);
} else {
    ipcMain = require('electron').ipcMain;
    dialog = require('electron').dialog;
    ipcMain.on('open-file-dialog', (event, element) => {
        dialog.showOpenDialog({
            properties: ['openFile']
        }, (files) => {
            if (files) {
                event.sender.send('selected-file', element, files)
            }
        })
    });
    ipcMain.on('open-folder-dialog', (event, element) => {
        dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory']
        }, (files) => {
            if (files) {
                event.sender.send('selected-folder', element, files)
            }
        })
    });
}

function reset_data(){
    unique_ids = new Set([]);
    id_dict = {};
    labels = {};
    label_map = [];
    set_array = [];
    version_num = 1;
    write_flag = "wx";
}

function isElectron() {
    return typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron;
}

let test_csv = "Label,\"a, b, c\"\n";
//console.log(Papa.parse(test_csv, {"delimiter":',',"escapeChar": '"', "skipEmptyLines": true}));

let available_inputs = {
    "checkbox":	{"description": "Defines a checkbox"},
    "color": {"description": "Defines a color picker"},
    "date":	{"description": "Defines a date control (year, month, day (no time))"},
    "datetime-local": {"description": "Defines a date and time control (year, month, day, time (no timezone))"},
    "email": {"description": "Defines a field for an e-mail address"},
    "month": {"description": "Defines a month and year control (no timezone)"},
    "number":	{"description": "Defines a field for entering a number"},
    "password":	{"description": "Defines a password field"},
    "radio":	{"description": "Defines a radio button"},
    "tel":	{"description": "Defines a field for entering a telephone number"},
    "text":	{"description": "Defines a single-line text field"},
    "time":	{"description": "Defines a control for entering a time (no timezone)"},
    "url":	{"description": "Defines a field for entering a URL"}
};

console.time("dbsave");

function parse_neighbourfile(items){
    if (isNaN(items[0]) || items[0] === ""){
        return;
    }
    if (id_dict[items[0]] === undefined) {
        id_dict[items[0]] = {"neighbourhood": [items[1]],
            "text": []
        }
    } else {
        id_dict[items[0]]["neighbourhood"].push(items[1])
    }
}

function get_labels(items){
    //let items = Papa.parse(line, {encoding: "uft-8"})[0];
    if (items[0] === "Label") {
        items.slice(1).forEach(function (item, index) {
            if (item !== "") {
                label_map.push({"Variable": item})
            }
        })
    } else if (items[0] === "Type") {
        items.slice(1).forEach(function (item, index) {
            if (item !== "") {
                label_map[index]["Type"] = item
            }
        })
    } else if (items[0] === "Default") {
        items.slice(1).forEach(function (item, index) {
            if (item !== "") {
                label_map[index]["Default"] = [item]
            } else {
                label_map[index]["Default"] = []
            }
        })
    } else {
        items.slice(1).forEach(function (item, index) {
            if (item !== "") {
                if (label_map[index]["Options"] !== undefined) {
                    label_map[index]["Options"].push(item)
                } else {
                    label_map[index]["Options"] = [item]
                }
            } else {
                if (label_map[index]["Options"] === undefined){
                    label_map[index]["Options"] = [" "]
                }
            }
        })
    }
}

function get_charts(items){
    //let items = parse(line)[0];
    if (isNaN(items[0]) || items[0] === ""){
        return;
    }
    if (id_dict[items[0]] === undefined) {
        unique_ids.add(items[0]);
        label_map.forEach(function (label){
            if (labels[items[0]] !== undefined) {
                labels[items[0]][label["Variable"]] = label["Default"]
            } else {
                labels[items[0]] = {[label["Variable"]]: label["Default"]}
            }
        });
        id_dict[items[0]] = {"neighbourhood": [],
            "text": [items[1]]};
    } else {
        /*
        if (items[1].slice(0,50).search(/((RES)|(Respirology))/) > -1){
            id_dict[items[0]]["text"].push(items[1]);
        }*/
        id_dict[items[0]]["text"].push(items[1]);
    }
}

console.log("Starting...");

function parse_files(label_map_file, charts_file, neighbourhood_file) {
    Papa.parse(fs.createReadStream(label_map_file, "utf-8"),
        {
            skipEmptyLines: true,
            step: function(results, parser){
                results.data.forEach(get_labels);
            },
            complete: function (results) {
                if (results.errors.length > 0) {
                    console.log("Parsing errors:");
                    console.log(results.errors);
                }
                Papa.parse(fs.createReadStream(charts_file, "utf-8"), {
                    skipEmptyLines: true,
                    step: function(results, parser){
                        results.data.forEach(get_charts);
                    },
                    complete: function(results) {
                        if (results.errors.length > 0) {
                            console.log("Parsing errors:");
                            console.log(results.errors);
                        }

                        set_array = Array.from(unique_ids);
                        if (neighbourhood_file !== undefined) {
                            Papa.parse(fs.createReadStream(neighbourhood_file, "utf-8"), {
                                skipEmptyLines: true,
                                step: function(results, parser){
                                    results.data.forEach(parse_neighbourfile);
                                },
                                complete: function(results){
                                    if (results.errors.length > 0) {
                                        console.log("Parsing errors:");
                                        console.log(results.errors);
                                    }
                                    load_status = "Load";
                                    console.log("Ready");
                                    console.timeEnd("dbsave");
                                }
                            });
                        } else {
                            load_status = "Load";
                            console.log("Ready");
                            console.timeEnd("dbsave");
                        }
                    }
                });
            }
        });

}

router.get('/', function(req, res, next) {
  res.redirect('/0');
});

router.get('/settings', function(req, res, next){
    res.render('settings', {
        title: "Quick Label",
        load_status: load_status,
        charts_file: charts_file,
        label_map_file: label_map_file,
        save_location: save_location,
    });
});

router.post('/load', function(req, res, next){
    load_status = "Loading";
    reset_data();
    charts_file = req.body["charts_file"];
    label_map_file = req.body["label_map_file"];
    save_location = req.body["save_location"];
    parse_files(label_map_file, charts_file);
    fs.writeFile('settings.json',
        JSON.stringify({charts_file: charts_file, label_map_file: label_map_file, save_location: save_location},
            null, 4),
        function (err) {
            if (err) {
                console.log(err)
            }
        }
    );
    res.sendStatus(200);
});

router.post('/save/:index_id', function(req, res, next) {
    save_status = "Save";
	labels[req.params["index_id"]][req.body["variable"]] = req.body["values"];
    res.sendStatus(200);
});

router.get('/save', function(req, res, next){
    save_status = "Saving";
    let labels_array = [];
    for (const [key, value] of Object.entries(labels)){
        let single_id = {"id": key};
        for (const [title, label] of Object.entries(value)){
            single_id[title] = label
        }
        labels_array.push(single_id)
    }

    let csv_converted = new Promise(function(resolve, reject){
        try {
            resolve(Papa.unparse(labels_array));
        } catch(err) {
            reject(err);
        }
    });

    csv_converted.then(
        function(results){
            // Will only overwrite file if its part of this run and settings have not been changed.
            function write_csv_file(){
                fs.writeFile(path.join(save_location, "labels_" + version_num + ".csv"), results, {flag: write_flag},function(err) {
                    if(err) {
                        if (err.code === "EEXIST") {
                            version_num += 1;
                            write_csv_file();
                        } else {
                            console.log(err);
                            save_status = "Failed";
                            res.status(500);
                            res.send(err);
                        }
                    } else {
                        write_flag = "w";
                        save_status = "Saved";
                        res.sendStatus(200);
                    }
                });
            }
            write_csv_file();
        }
    ).catch(function(err){
        console.log(err);
        save_status = "Failed";
        res.status(500);
        res.send(err);
    });
});

router.get('/:index_id', function(req, res, next) {
    console.log(id_dict);
    res.render('record', { title: "Quick Label",
        neighbourhood_data: id_dict[set_array[Number(req.params["index_id"])]]["neighbourhood"],
        text_data: id_dict[set_array[Number(req.params["index_id"])]]["text"],
        index_id: Number(req.params["index_id"]), max_index: set_array.length,
        cur_id: set_array[Number(req.params["index_id"])],
        labels: labels[set_array[Number(req.params["index_id"])]],
        label_map: label_map,
        save_status: save_status
    });
});

module.exports = router;

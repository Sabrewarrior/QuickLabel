// node_modules\nodemon\bin\nodemon
const express = require('express');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const Lazy = require('lazy');
const JsonExport = require('jsonexport');
const path = require('path');
let savenum = 1;
let save_status = "Save";
let router = express.Router();
let unique_ids = new Set([]);
let id_dict = {};
let labels = {};
let label_map = [];
let neighbourhood_file = undefined;
// let neighbourhood_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\active_tb.csv";
let charts_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\Jane_list_unlabeled(Clean).csv";
let label_map_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\test_map.csv";
let saveLocation = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\Labels\\Test";
//let label_map_file = "Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\labels_map.csv";
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

let set_array = [];
console.time("dbsave");
function parse_neighbourfile(line){
    let items = parse(line)[0];
    if (id_dict[items[0]] === undefined) {
        id_dict[items[0]] = {"neighbourhood": [items[1]],
            "text": []
        }
    } else {
        id_dict[items[0]]["neighbourhood"].push(items[1])
    }
}

function get_labels(line){
    let items = parse(line)[0];
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

function get_charts(line){
    let items = parse(line)[0];
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
            "text": [items[2]]};
    } else {
        if (items[2].slice(0,50).search(/((RES)|(Respirology))/) > -1){
            id_dict[items[0]]["text"].push(items[2]);
        }
    }
}

new Lazy(fs.createReadStream(label_map_file, "utf-8"))
    .lines
    .forEach(get_labels).on("pipe", function(){
            new Lazy(fs.createReadStream(charts_file, "utf-8"))
                .lines
                .skip(1)
                .forEach(get_charts).on("pipe", function(){

                    set_array = Array.from(unique_ids);
                    // console.log(labels);
                    console.log("Started reading data");
                    if (neighbourhood_file !== undefined) {
                        new Lazy(fs.createReadStream(neighbourhood_file, "utf-8"))
                            .lines
                            .skip(1)
                            .forEach(parse_neighbourfile)
                            .on('pipe', function () {
                                console.log("Finished reading data");
                                console.timeEnd("dbsave");
                            })
                    }
                });
        });

//console.log("Finished neighbourhood");

console.log("READY");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/0');
});

router.post('/save/:index_id', function(req, res, next) {
    save_status = "Save";
    console.log("Saving:");
    console.log(req.params["index_id"]);
    console.log(req.body["variable"]);
    console.log(req.body["values"]);
	labels[req.params["index_id"]][req.body["variable"]] = req.body["values"];
    //console.log([req.params["index_id"]] + " " + [req.params["label"]]);
    //console.log(labels[req.params["index_id"]][req.params["label"]]);
    res.sendStatus(200);
});

router.get('/save', function(req, res, next){
    save_status = "Saving";
    console.log("Got save request");
    let labels_array = [];
    for (const [key, value] of Object.entries(labels)){
        if (value === undefined) {
            console.log(key + "IS UNDEFINED");
        }
        let single_id = {"id": key};
        for (const [title, label] of Object.entries(value)){
            single_id[title] = label
        }
        labels_array.push(single_id)
    }
    // console.log(labels_array);
    JsonExport(labels_array,function(err, csv){
        //console.log(labels_array);
        if(err) {
            console.log(err);
            save_status = "Failed";
            res.sendStatus(500);
        } else {

            fs.writeFile(path.join(saveLocation, "label_Vtest" + savenum + ".csv"), csv, function(err) {

                if(err) {
                    console.log(err);
                    save_status = "Failed";
                    res.status(500);
                    res.send(err);
                } else {
                    savenum = savenum + 1;
                    // console.log(csv);
                    save_status = "Saved";
                    res.sendStatus(200);
                }
            });
        }
    });
});

router.get('/:index_id', function(req, res, next) {
    //console.log(labels[set_array[Number(req.params["index_id"])]]);
    //console.log(label_map);
    res.render('record', { title: "QuickLabel",
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

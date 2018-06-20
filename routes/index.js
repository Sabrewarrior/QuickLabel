// node_modules\nodemon\bin\nodemon
const express = require('express');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const Lazy = require('lazy');
const jsonexport = require('jsonexport');

let router = express.Router();
let unique_ids = new Set([]);
let id_dict = {};
let labels = {};
let label_map = [];
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
    unique_ids.add(items[0]);
    if (id_dict[items[0]] === undefined) {
        label_map.forEach(function (label){
            if (labels[items[0]] !== undefined) {
                labels[items[0]][label["Variable"]] = label["Default"]
            } else {
                labels[items[0]] = {[label["Variable"]]: label["Default"]}
            }
        });
        id_dict[items[0]] = {"neighbourhood": [items[1]],
            "text": []
        }
    } else {
        id_dict[items[0]]["neighbourhood"].push(items[1])
    }
}

function get_labels(line){
    console.log("Line: " + line);
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
    let item = parse(line)[0];
    if (id_dict[item[0]] !== undefined) {
        id_dict[item[0]]["text"].push(item[2])
    }
}

new Lazy(fs.createReadStream("Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\labels_map.csv", "utf-8"))
    .lines
    .forEach(get_labels).on("pipe", function(){
            new Lazy(fs.createReadStream("Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\active_tb.csv", "utf-8"))
                .lines
                .skip(1)
                .forEach(parse_neighbourfile).on("pipe", function(){

                    set_array = Array.from(unique_ids);
                    console.log(labels);
                    console.log("Started reading data");
                    new Lazy(fs.createReadStream("Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Data_unlabeled(Clean).csv", "utf-8"))
                        .lines
                        .skip(1)
                        .forEach(get_charts)
                        .on('pipe', function() {
                            console.log("Finished reading data");
                            console.timeEnd("dbsave");

                            delete(unique_ids);
                        })
                });
        });

console.log("Finished neighbourhood");

console.log("READY");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('record', { title: "QuickLabel",
      neighbourhood_data: id_dict[set_array[0]]["neighbourhood"],
      text_data: id_dict[set_array[0]]["text"],
      index_id: 0, max_index: set_array.length,
      cur_id: set_array[0],
      labels: labels[set_array[0]],
      label_map: label_map
  });
});

router.post('/save/:index_id/:label', function(req, res, next) {
    console.log([req.params["index_id"]] + " " + [req.params["label"]]);
	labels[req.params["index_id"]][req.params["label"]] = req.body["values"];
	console.log(labels[req.params["index_id"]][req.params["label"]]);
    res.sendStatus(200);
});

router.get('/save', function(req, res, next){
    console.log("Got save request");
    jsonexport(labels,function(err, csv){
        if(err) return console.log(err);
        console.log(csv);
    });
});

router.get('/:index_id', function(req, res, next) {
    res.render('record', { title: "QuickLabel",
        neighbourhood_data: id_dict[set_array[Number(req.params["index_id"])]]["neighbourhood"],
        text_data: id_dict[set_array[Number(req.params["index_id"])]]["text"],
        index_id: Number(req.params["index_id"]), max_index: set_array.length,
        cur_id: set_array[Number(req.params["index_id"])],
        labels: labels[set_array[Number(req.params["index_id"])]],
        label_map: label_map
    });
});

module.exports = router;

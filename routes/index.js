// node_modules\nodemon\bin\nodemon
const express = require('express');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const Lazy = require('lazy');

let router = express.Router();
let unique_ids = new Set([]);
let id_dict = {};
let labels = {};
//let x = parse(fs.readFileSync(", "utf-8"), from=2);
let set_array = [];
console.time("dbsave");
new Lazy(fs.createReadStream("Y:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Unlabeled\\active_tb.csv", "utf-8"))
    .lines
    .skip(1)
    .forEach(function(line){
        let item = parse(line)[0];
        unique_ids.add(item[0]);
        if (id_dict[item[0]] === undefined) {
            labels[item[0]] = {"tb_status": "None"};
            id_dict[item[0]] = {"neighbourhood": [item[1]],
                "text": []
            }
        } else {
            id_dict[item[0]]["neighbourhood"].push(item[1])
        }}).on("pipe", function(){
            set_array = Array.from(unique_ids);

            console.log("Started reading data");
            new Lazy(fs.createReadStream("Y:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Data_unlabeled(Clean).csv", "utf-8"))
                .lines
                .skip(1)
                .forEach(function(line){
                    let item = parse(line)[0];
                    if (id_dict[item[0]] !== undefined) {
                        id_dict[item[0]]["text"].push(item[2])
                    }
                }).on('pipe', function() {
                    console.log("Finished reading data");
                    console.timeEnd("dbsave");
                    delete(unique_ids);
                });
        });
/*
x.forEach(function(item){
    unique_ids.add(item[0]);
    if (id_dict[item[0]] === undefined) {
        id_dict[item[0]] = {"neighbourhood": [item[1]],
            "text": []
        }
    } else {
        id_dict[item[0]]["neighbourhood"].push(item[1])
    }
});

delete(x);
*/

console.log("Finished neighbourhood");
/*/
var parser = parse_async({from: 2}, function(err, data){
    data.forEach(function(item){
        if (id_dict[item[0]] !== undefined) {
            id_dict[item[0]]["text"].push(item[2])
        }
    });
});
var stream = fs.createReadStream("Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Data_unlabeled(Clean).csv", "utf-8");
stream.pipe(parser).on('end',function(){
    console.timeEnd("dbsave");
    stream.destroy();
});
//*/

//*/


console.log("READY");
// console.log(x);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('record', { title: "QuickLabel",
      neighbourhood_data: id_dict[set_array[0]]["neighbourhood"],
      text_data: id_dict[set_array[0]]["text"],
      index_id: 0, max_index: set_array.length,
      cur_id: set_array[0],
      labels: labels[set_array[0]]["tb_status"]
  });
});

router.get('/save/:index_id/:label/:value', function(req, res, next) {
	if (tb_status[req.params["index_id"]][feq.params["label"]] !== undefined) {
		tb_status[req.params["index_id"]][req.params["label"]] = req.params["value"];
	} else {
		tb_status[req.params["index_id"]] = {req.params["label"]: req.params["value"]}
	}
    res.sendStatus(200);
});



router.get('/:index_id', function(req, res, next) {
    res.render('record', { title: "QuickLabel",
        neighbourhood_data: id_dict[set_array[Number(req.params["index_id"])]]["neighbourhood"],
        text_data: id_dict[set_array[Number(req.params["index_id"])]]["text"],
        index_id: Number(req.params["index_id"]), max_index: set_array.length,
        cur_id: set_array[Number(req.params["index_id"])],
        tb_status: labels[set_array[Number(req.params["index_id"])]]["tb_status"]
    });
});

router.get('/save', function(req,res,next){

    fs.writeFile('form-tracking/formList.csv', dataToWrite, 'utf8', function (err) {
        if (err) {
            res.sendStatus(err);
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else{
            console.log('It\'s saved!');
            res.sendStatus(200);
        }
    });

});
module.exports = router;

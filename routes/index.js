// node_modules\nodemon\bin\nodemon
var express = require('express');
var router = express.Router();
const parse = require('csv-parse/lib/sync');
var fs = require('fs');
var neighbourhood = fs.readFileSync("C:\\Users\\joshiu\\WebstormProjects\\QuickLabel\\data\\active_tb.csv", "utf-8");
var unique_ids = new Set([]);
var id_dict = {};
var tb_status = {};
var x = parse(neighbourhood, from=2);
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
unique_ids.forEach(function(item){
   tb_status[item] = "None";
});
delete(x);
delete(neighbourhood);
console.log("Finished neighbourhood");
/*
var text = fs.readFileSync("Z:\\LKS-CHART\\Projects\\NLP POC\\Study data\\TB\\dev\\Data_unlabeled(Clean).csv", "utf-8");
var y = parse(text, from=2);
y.forEach(function(item){
    unique_ids.add(item[0]);
    if (id_dict[item[0]] !== undefined) {
        id_dict[item[0]]["text"].push(item[2])
        }
});
delete(text);
delete(y);
*/
var set_array = Array.from(unique_ids);
console.log("READY");
// console.log(x);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('record', { title: "QuickLabel",
      neighbourhood_data: id_dict[set_array[0]]["neighbourhood"],
      text_data: id_dict[set_array[0]]["text"],
      index_id: 0, max_index: set_array.length,
      cur_id: set_array[0],
      tb_status: tb_status[set_array[0]]
  });
});

router.post('/:index_id/save', function(req, res, next) {

});


router.get('/:index_id', function(req, res, next) {
    res.render('record', { title: "QuickLabel",
        neighbourhood_data: id_dict[set_array[Number(req.params["index_id"])]]["neighbourhood"],
        //text_data: id_dict[set_array[Number(req.params["index_id"])]]["text"],
        index_id: Number(req.params["index_id"]), max_index: set_array.length,
        cur_id: set_array[Number(req.params["index_id"])],
        tb_status: tb_status[set_array[Number(req.params["index_id"])]]
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

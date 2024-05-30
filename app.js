//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const adminPassword = "Legacytt2";
mongoose.connect("mongodb+srv://iamtabson:"+adminPassword+"@cluster0.fnqadrh.mongodb.net/todolistDB");
const itemSchema = new mongoose.Schema(
  {
    name: String
  }
);

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find().then((foundItems) => {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then((message) => {
      }).catch((err) => {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch((err) => {
    console.log(err);
  });

});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then((foundList) => {

        if(!foundList){
          // create a new List
          const list = new List ({
            name: customListName,
            items: defaultItems
          });

          list.save();
          res.redirect("/"+customListName+"");
        } else {
          // Display an existing List
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }

  }).catch((err) => {
    console.log(err);
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName +"");
    });
  }


});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;

  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndDelete({_id: checkedItemId}).catch((err) => {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).catch((err) => {
      console.log(err);
    });
    res.redirect("/" + listName + "");
  }
});


app.get("/about", function(req, res){
  res.render("about");
});
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server has started Successfully");
});

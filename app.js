const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

mongoose.set('strictQuery',false);
main().catch(err=>console.log(err));

async function main(){
  await mongoose.connect('mongodb+srv://admin-asad:N0_passw0rd@cluster0.ascc5jd.mongodb.net/todolistdb');
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema={
  name:String
};

const Item=mongoose.model('Item',itemsSchema);

const item1=new Item({
  name: "welcome to your todolist"
});

const item2=new Item({
  name: "hit the + button to add new item"
});

const item3= new Item({
  name:"<-- hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const ListSchema={
    name:String,
    items:[itemsSchema]

};

const List=mongoose.model('list', ListSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err)
            console.log(err);
          else
            console.log("successfully saved");  
        });

        res.redirect("/");
      }
      else
      res.render("list", {listTitle: "Today", newListItems: foundItems});  
  });

});

app.get("/:customListName", function(req,res){
   const customListName=_.capitalize(req.params.customListName);

   List.findOne({name:customListName}, function(err,foundlist){
             
    if(!err){
      if(!foundlist){
        const list=new List({
          name: customListName,
          items: defaultItems
       });
    
       list.save();
       res.redirect("/"+customListName);
      }
      else{
        res.render("List",{listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
   });   
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item= new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
      res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();

        res.redirect("/"+listName);
      
    });
  }
});

app.post("/delete",function(req,res){
  
  const checkitem=req.body.checkbox;
  const listName=req.body.listName;
  

  if(listName === "Today"){
     Item.findByIdAndRemove(checkitem, function(err){
      if(!err){
        console.log(err);
        res.redirect("/");
      }
    });
  }
  else{
      List.findOneAndUpdate({name: listName},{$pull : {items:{_id: checkitem}}}, function(err,foundList){
        if(!err)
          res.redirect("/"+ listName);
      });
  }  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

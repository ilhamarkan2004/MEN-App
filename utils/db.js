const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/node");



// // Menambah satu data
// const contact1 = new Contact({ nama: "Zidny", nohp : "234234234234", email:"zidny@gmail.com" });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact));
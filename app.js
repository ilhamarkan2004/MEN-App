const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
require('./utils/db');
const Contact =  require('./model/contact');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const methodOverride = require("method-override");

const { body, validationResult, check } = require("express-validator");

const port = 3000;


// Menggunakan ejs
app.set('view engine', 'ejs');

// Third party middleware
app.use(expressLayouts);

app.use(methodOverride("_method"));


// Built In Middleware
app.use(express.static("public"));
app.use(express.urlencoded({
  extended: true
}));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: {
    maxAge: 6000
  },
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());


app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Ilham Arkan",
      email: "ilham@gmail.com",
    },
    {
      nama: "budi",
      email: "budi@gmail.com",
    },
    {
      nama: "joko",
      email: "joko@gmail.com",
    },
  ];

  res.render("index", {
    nama: "arkan",
    title: "home",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

app.get("/contact", async(req, res) => {
  // Contact.find().then((contact)=>{
  //   res.send(contact);
  // });

  const contacts = await Contact.find();

  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});


app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Tambah Data Contact",
  });
});


// Proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({nama: value});
      if (duplikat) {
        throw new Error('Nama contact sudah digunakan');
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "Nomor Handphone tidak valid").isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        layout: "layouts/main-layout",
        title: "Tambah Data Contact",
        errors: errors.array()
      });
    } else {
       Contact.insertMany([req.body])
         .then((result) => {
           // Kirimkan flash message
           req.flash("msg", "Data contact berhasil ditambahkan");
           res.redirect("/contact");
         })
    }
  }
);

// // Proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({nama : req.params.nama});

//   // Jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send('404');
//   } else {
//     Contact.deleteOne({_id : contact._id}).then((result) => {
//       req.flash("msg", "Data contact berhasil dihapus");
//       res.redirect("/contact");
//     });
//   }
// });


app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data contact berhasil dihapus");
    res.redirect("/contact");
  });
});


// Form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({nama : req.params.nama});
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Ubah Data Contact",
    contact
  });
});



// Proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async(value,{req}) => {
      const duplikat = await Contact.findOne({nama : value});
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "Nomor Handphone tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({
      //   errors: errors.array()
      // });
      res.render("edit-contact", {
        layout: "layouts/main-layout",
        title: "Edit Data Contact",
        errors: errors.array(),
        contact : req.body
      });
    } else {
      Contact.updateOne(
        {_id : req.body._id},
        {
          $set : {
            nama : req.body.nama,
            email : req.body.email,
            nohp : req.body.nohp
          }
        }

        ).then((result)=>{
          // Kirimkan flash message
          req.flash("msg", "Data contact berhasil diubah");
          res.redirect("/contact");
        })
    }
  }
);


app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({nama :req.params.nama});
  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail",
    contact,
  });
});

app.listen(port, () => {
    console.log(`MongoContact app, Listening port ${port}`);
})
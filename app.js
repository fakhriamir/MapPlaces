var https = require('https');
//var http = require('http');
var cookieSession = require('cookie-session');
var svgCaptcha = require('svg-captcha');
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var Tools = require("./middleware/tools");
var mongoose = require('./node_modules/mongoose');
const ItemSchema = require("./model/item");
const PhotoSchema = require("./model/photo");

const fs = require('fs')
const user = require("./routes/user");
const api = require("./routes/api");
const admin = require("./routes/admin");
const InitiateMongoServer = require("./config/db");


// Initiate Mongo Server
InitiateMongoServer();
//Sessen Management
app.use(cookieSession({
  name: 'session',
  keys: ['sessonkeyfornbx1', 'sessonkeyfornbx2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static("public"));

app.use("/user", user);
app.use("/api", api);

//app.use("/admin",);
app.use("/admin", admin);

//app.set("views", __dirname + "/public");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create();

  req.session.captcha = Tools.encriptText(captcha.text);
  //console.log("capt:"+req.session.captcha);
  res.type('svg');
  res.status(200).send(captcha.data);
});
app.get('/item/:id', async function (req, res) {

  var _id = req.params.id;
  if (_id == null || _id == undefined || _id == "" || !mongoose.Types.ObjectId.isValid(_id)) {
    //console.log(_id);
    return res.redirect('/');
  }
  let myitem = await ItemSchema.findOne({ _id });
  if (!myitem)
    res.redirect('/');
  await ItemSchema.updateOne({ _id }, { $set: { hit: (myitem.hit + 1) } }, function (err, res) {
    if (err) throw err;
  });
  let itemphoto = await PhotoSchema.find({ itemID: _id }, { _id: 1 });
  //console.log(JSON.stringify(itemphoto));
  //console.log("-----------------------------------");
  //console.log(JSON.parse(itemphoto));
  return res.render(__dirname + "/public/item.min.html", { token: Tools.GetToken(req),userid:myitem.userid,data: Tools.Item2HTML(myitem), lat: myitem.Lat, lon: myitem.Lon, typesale: myitem.typesale, shahr: myitem.shahr, id: myitem._id, photo: JSON.stringify(itemphoto),mobile:Tools.isMobile(req)?"mob":"" });
});
//عکس های ایتم
app.get('/pic/:id', async function (req, res) {
  //console.log(req.params.id);
  let photoschema = await PhotoSchema.findOne(
    { "_id": req.params.id }
  );
  if (photoschema == null) {
    res.status(200).send("");
  } else {
    res.setHeader('content-type', "image/jpg");
    res.status(200).send(photoschema.photo);
  }
});
app.post('/', async function (req, res) {
 
  //console.log(req.body);
  //console.log(req.headers.referer);
  if (req.headers.referer != "https://www.imencms.com/payback") {

  }
  var pay = req.body.pay;
  var refid = req.body.pay;
  var payid = req.body.payid;
  if (pay == 0) {
    //خرید تایید نشد
  }
  else if (pay == 1) {
    //TODO
    //xxxxxxxxxxxxxxxxxx
  }
  return res.render(__dirname + "/public/home.min.html", { token: Tools.GetToken(req), pay: pay });
});
app.get('/', function (req, res) {

  return res.render(__dirname + "/public/home.min.html", { token: Tools.GetToken(req), pay: -1,mobile:Tools.isMobile(req)?"mob":"" });
});
//.listen(options,3000);

//ssl
var credentials = {
  ca: fs.readFileSync('./config/ca.crt'),
  key: fs.readFileSync('./config/nbx.key'),
  cert: fs.readFileSync('./config/nbx.crt')
};
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);

var http = require('http');
http.createServer(app).listen(800);

/*var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://nbx.ir" });
  res.end();
}).listen(80);*/

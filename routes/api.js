const express = require("express");
const sharp = require("sharp");
const ItemSchema = require("../model/item");
const PhotoSchema = require("../model/photo");
const UserSchema = require("../model/user");
const AvatarSchema = require("../model/avatar");
const PaySchema = require("../model/pay");

const imgdb = require('../config/img');
const { check, validationResult } = require("express-validator");
const app = express();
var Tools = require("../middleware/tools");
const fileUpload = require('express-fileupload');

//var Jimp = require('jimp');//var fs = require("fs");//var base64 = require('base-64');
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.post('/userphoto', [check("postFile", "Please enter a valid email").isEmpty()], async function (req, res) {
    if (!Tools.checkToken(req)) {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }
    //console.log("ffff");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()[0]
        });
    }
    var mimetype = req.files.postFile.mimetype;
    //console.log(mimetype);
    if (mimetype != "image/jpeg" && mimetype != "image/png") {
        return res.status(400).json({
            errors: {
                msg: "لطفا فایل با پسوند jpg و یا png انتخاب نمایید."
            }
        });
    }
    const userid = Tools.decryptText(req.session.uid);
    const resizedImageBuf = await sharp(req.files.postFile.data)
        .resize(120, 120)
        .toFormat("jpeg")
        .jpeg({ quality: 50 })
        .toBuffer();
    let photo = resizedImageBuf;
    let user = await AvatarSchema.findOne({
        userid
    });
    if (user) {
        await AvatarSchema.updateOne({ userid: userid }, { $set: { photo: photo } }, function (err, res) {
            if (err) throw err;

            //db.close();
        });
    }
    else {
        let dbavatar = new AvatarSchema({
            userid, photo
        });
        await dbavatar.save();
    }
    /*var uid = Tools.decryptText(req.session.uid);
    let avatar = req.files.postFile;
    //console.log(avatar);
    var src = './public/img/ua/' + avatar.name;
    var des = './public/img/ua/' + uid + '.jpg';
    try {
        if (!req.files) {
            return res.status(400).json({
                errors: {
                    msg: "لطفا فایل با پسوند jpg و یا png انتخاب نمایید."
                }
            });
        } else {
            avatar.mv(src);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
    //console.log("uid:" + uid);

    Jimp.read(src, (err, lenna) => {
        if (err) throw err;
        lenna
            .resize(120, 120) // resize
            .quality(60) // set JPEG quality
            .background(0xFFFFFFFF)
            //.greyscale() // set greyscale
            .write(des); // save
    });
    fs.exists(src, function (exists) {
        if (exists) {
            fs.unlinkSync(src);
        }
    });
*/
    res.status(400).json({
        data: {
            src: './api/avatar'
        }
    });
    /*return res.status(200).json({
        data: {
            src: './img/ua/' + uid + '.jpg'
        }
    });*/
});
//let mres;let mreq;
app.post('/itemphoto', async function (req, res) {
   //console.log("itemp1");
    if (!Tools.checkToken(req)) {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }
    //console.log("itemp1");
    if (Tools.decryptText(req.session.uid) == "" || Tools.decryptText(req.session.uid) == null) {
        return res.status(400).json({
            errors: {
                msg: "شما باید در سیتم وارد شوید"
            }
        });
    }
    //console.log(req.files.itemfile);
    // try {
    if (req.files.itemfile == null || req.files.itemfile == undefined)
        return res.status(400).json({
            errors: {
                msg: "ارسال فایل با مشکل مواجه شده است"
            }
        });
    var files = req.files.itemfile;
    for (var i = 0; i < files.length; i++) {
        var mimetype = files[i].mimetype;
        if (mimetype != "image/jpeg" && mimetype != "image/png") {
            return res.status(400).json({
                errors: {
                    msg: "لطفا فایل با پسوند jpg و یا png انتخاب نمایید."
                }
            });
        }
    }
    //console.log("itemp4");
    const userid = Tools.decryptText(req.session.uid);
    const itemID = req.headers.itemid;
    //let buff = new Buffer(req.files.itemfile[0].buffer, '7bit');
    //console.log(req.files.itemfile[0]);
    // let photo = await base64.encode(req.files.itemfile[0].buffer);
    for (var i = 0; i < files.length; i++) {
        const resizedImageBuf = await sharp(req.files.itemfile[i].data)
            .resize(640, 420)
            .toFormat("jpeg")
            .jpeg({ quality: 50 })
            .toBuffer();
        let photo = resizedImageBuf;
        //console.log(photo);
        let dbphoto = new PhotoSchema({
            userid, itemID, photo
        });
        await dbphoto.save();

    }
    //console.log("itemp5");
    /* }
     catch (error) {
         console.error(error);
         res.status(400).json({
             errors: {
                 msg: "error"
             }
         });
     }*/
    //console.log("photend");
    //console.log("itemp6");
    res.status(408).json({
        data: {
            msg: 'کارتکس مورد نظر با موفقیت ذخیره شد'
        }
    });

});
app.post("/additem",
    [
        check("typesale", "نوع قرارداد را مشخص کنید").isNumeric(),
        check("type", "پست الکترونیک وارد شده معتبر نمی باشد").isNumeric(),
    ],
    async (req, res) => {
        //console.log(req.body);
        if (!Tools.checkToken(req)) {
            return res.status(400).json({
                errors: {
                    msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
                }
            });
        }
        var userid = Tools.decryptText(req.session.uid);
        if (userid == "") {
            return res.status(400).json({
                errors: {
                    msg: "شما باید در سیتم وارد شوید"
                }
            });
        }
        const errors = validationResult(req);
        //console.log("er:"+errors);
        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()[0]
            });
        }

        //const UserID = UserID
        const {
            name, meter, allMeter, old, monmeter, monkol, address, desc, Lat, Lon, AddID, type, typesale, melktakh, floorNo, shahr, Nofloor, floorcnt, bedNo, otherItem
        } = req.body;
        try {

            let myItem = new ItemSchema({
                name, userid, meter, allMeter, old, monmeter, monkol, address, desc, Lat, Lon, AddID, type, typesale, melktakh, floorNo, shahr, Nofloor, floorcnt, bedNo, otherItem
            });

            await myItem.save();

            const payload = {
                myItem: {
                    id: myItem.id
                }
            };
            return res.status(200).json({
                data: {
                    itemid: payload.myItem.id
                }
            });

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

app.get('/avatar', async function (req, res) {
    //console.log(req.params.id);
    if (req.session.uid == null || req.session.uid == "")
        return res.status(200).send();
    var userid = Tools.decryptText(req.session.uid);

    if (userid == null || userid == "") {
        res.setHeader('content-type', "image/png");
        return res.status(200).send();
    }
    let avatarSchema = await AvatarSchema.findOne(
        { "userid": userid }
    );
    if (avatarSchema == null) {
        //res.setHeader('content-type', "image/png");
        //res.status(200).send(new Buffer(imgdb.img.useravatar, 'base64'));
        res.status(400).send(null);
    } else {
        res.setHeader('content-type', "image/jpg");
        res.status(200).send(avatarSchema.photo);
    }
});
app.post("/getitem", [
    check("zoom", "نوع قرارداد را مشخص کنید").isNumeric()//,
    //check("evt", "پست الکترونیک وارد شده معتبر نمی باشد").isJSON()
],
    async (req, res) => {
        //console.log(req.body);
        if (!Tools.checkToken(req)) {
            return res.status(400).json({
                errors: {
                    msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
                }
            });
        }
        const errors = validationResult(req);
        //console.log("er:"+errors);
        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()[0]
            });
        }
        try {
            var zoom = req.body.zoom;
            if (zoom < 12) {
                return res.status(200).json({
                    data: {
                        count: -1
                    }
                });

            }
            var area = req.body.evt.toString().split(",");
            var count = await ItemSchema.find({ $and: [{ "Lat": { $gt: area[1], $lt: area[3] } }, { "Lon": { $gt: area[0], $lt: area[2] } }] }).countDocuments();

            let myitem = await ItemSchema.find({ $and: [{ "zoom": { $lte: zoom } }, { "Lat": { $gt: area[1], $lt: area[3] } }, { "Lon": { $gt: area[0], $lt: area[2] } }] },
                {
                    _id: 1,
                    Lat: 1,
                    Lon: 1,
                    zoom: 1,
                    typesale: 1,
                    otherItem: 1,
                    bedNo: 1,
                    floorNo: 1,
                    meter: 1,
                    monkol: 1,
                    type: 1,
                    monmeter: 1,
                    createdAt: 1
                });

            if (!myitem)
                return "";

            /*const payload = {
                myItem: {
                    id: myItem.id
                }
            };*/
            //console.log(myitem);
            return res.status(200).json({
                data: {
                    count: count, item: myitem
                }
            });

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);
/*app.post("/getitemcount", [
    check("zoom", "نوع قرارداد را مشخص کنید").isNumeric()//,
    //check("evt", "پست الکترونیک وارد شده معتبر نمی باشد").isJSON()
],
    async (req, res) => {
        if (!Tools.checkToken(req)) {
            return res.status(400).json({
                errors: {
                    msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
                }
            });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(403).json({
                errors: errors.array()[0]
            });
        }
        try {
            var zoom = req.body.zoom;
            if (zoom < 12) {
                return res.status(200).json({
                    data: {
                        item: 0
                    }
                });
            }
            var area = req.body.evt.toString().split(",");
            var count = await ItemSchema.find({ $and: [{ "Lat": { $gt: area[1], $lt: area[3] } }, { "Lon": { $gt: area[0], $lt: area[2] } }] }).count();
            return res.status(200).json({
                data: {
                    item: count
                }
            });

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);*/

app.post('/pay', async function (req, res) {
    if (!Tools.checkToken(req)) {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }

    if (req.body.id == null || req.body.id == undefined || req.body.id == "") {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }
    var userid = Tools.decryptText(req.session.uid);
    if (userid == "") {
        return res.status(400).json({
            errors: {
                msg: "شما باید در سیتم وارد شوید"
            }
        });
    }
    const itemid = req.body.id;
    const type = req.body.type;
    let myItem = new PaySchema({
        userid, itemid, type
    });

    await myItem.save();

    const payload = {
        myItem: {
            id: myItem.id
        }
    };
    //console.log(req.body);

    var mon = 50000;
    if (type == 2)
        mon = 70000;

    //res.redirect('http://www.p.com/pay?id='+myItem.id+'&m='+mon);

    res.status(400).send('https://www.imencms.com/pay?i=' + myItem.id + '&m=' + mon);


    /* request.post({
         url: 'http://www.p.com/pay',
         form: { id: myItem.id, mon:mon}
     }, function optionalCallback(err, httpResponse, body) {
         if (err) {
             return console.error('upload failed:', err);
         }
         console.log('Upload successful!  Server responded with:', body);
     });*/

});


//////ییییییییییییییییییییییییییییییییییییییی
app.post('/getnumber', [check("itemid", "توکن شما منقضی شده است لطفا صفحه را رفرش کنید").isMongoId()], async function (req, res) {
    //****** itemid is userid
    if (!Tools.checkToken(req)) {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({
            errors: errors.array()[0]
        });
    }
    if (req.body.itemid == null || req.body.itemid == undefined || req.body.itemid == "") {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }

    const userid = req.body.itemid;
    const user = await UserSchema.find({ _id: userid }, { name: 1, email: 1, mobile: 1 });
    return res.status(200).json({
        data: {
            user
        }
    });
});


module.exports = app;


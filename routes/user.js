const express = require("express");
const { check, validationResult } = require("express-validator");
//const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");
const app = express.Router();
const ItemSchema = require("../model/item");
const User = require("../model/user");
var Tools = require("../middleware/tools");
var fs = require("fs");
var GetUserInformation = async (_id, vc) => {

    if (_id == "")
        return "";
    //console.log(_id);
    let user = await User.findOne({
        _id
    });

    if (!user)
        return "";

    var ot = "";
    const payload = {
        user: {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            mobileActive: user.mobileActive,
            email: user.email
        }
    };
    //console.log(payload.user.id);
    ot += '"name":"' + payload.user.name + '"';
    ot += ',"mobile":"' + payload.user.mobile + '"';
    ot += ',"mobileActive":"' + payload.user.mobileActive + '"';
    ot += ',"email":"' + payload.user.email + '"';
    if (!payload.user.mobileActive)
        ot += ',"vc":"' + Tools.getSMSVC(payload.user.mobile) + '"';
    //ot += fs.exists('./public/img/ua/' + payload.user.id + '.jpg', function (exists) {
    //    if (exists) {
    ot += ',"ua":"/api/avatar"';
    //    }
    //   return ',"userphoto":""'
    //});
    //console.log(ot)
    ot += ',"ut":"' + Tools.encriptText(payload.user.id + '!' + Date.now()) + '"';



    return '{"data":{' + ot + '}}';
}
app.post(
    "/signup",
    [
        check("mobile", "شماره موبایل وارد شده صحیح نمی باشد").isMobilePhone('fa-IR', 'isMobilePhoneLocales'),
        check("email", "پست الکترونیک وارد شده معتبر نمی باشد").isEmail(),
        check("password", "رمز عبور حداقل باید 4 حرف باشد").isLength({ min: 4 }),
        check("captcha", "کد امنیتی را وارد کنید").isLength({ min: 4 })
    ],
    async (req, res) => {
        //console.log("reqbody"+req.body.name);
        //console.log("reqbody"+req.body.email);
        //console.log("reqbody"+req.body.password);
        //console.log("reqbody"+req.body.mobile);
        //console.log("signup token:"+req.headers["token"]);
        if (Tools.decryptText(req.session.captcha).toLowerCase() != req.body.captcha.toLowerCase()) {
            return res.status(400).json({
                errors: {
                    msg: "کد امنیتی صحیح نمی باشد"
                }
            });
        }
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

        const {
            name,
            mobile,
            email,
            password
        } = req.body;
        try {
            /*let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({errors:{
                    msg: "User Already Exists"}
                });
            }*/
            let user = await User.findOne({
                mobile
            });
            if (user) {
                return res.status(400).json({
                    errors: {
                        msg: "شماره موبایل وارد شده در لیست کاربران ما موجود است"
                    }
                });
            }

            user = new User({
                mobile,
                email,
                password,
                name
            });

            //const salt = await bcrypt.genSalt(10);password
            user.password = await Tools.encriptText(password);

            await user.save();

            /* const payload = {
                 user: {
                     id: user.id
                 }
             };*/

            req.session.uid = Tools.encriptText(user.id);
            //req.session.verifyCode = Tools.encriptText(Tools.getRandom());
            //Tools.sendSMS(Tools.decryptText(req.session.verifyCode));

            var uinfo = await GetUserInformation(user.id, 1);
            res.status(200).json(uinfo);

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);
app.post("/loginstate", async (req, res) => {
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
                msg: "not login"
            }
        });
    }
    var uinfo = await GetUserInformation(userid);
    res.status(200).json(uinfo);
});
app.post(
    "/login",
    [
        check("mobile", "Please enter a valid email").isMobilePhone(),
        check("password", "Please enter a valid password").isLength({ min: 4 }),
        check("captcha", "کد امنیتی را وارد کنید").isLength({ min: 4 })
    ],
    async (req, res) => {
        //console.log(req.session.captcha+"--"+Tools.decryptText(req.session.captcha));
        //console.log("req"+req.body.captcha);
        if (Tools.decryptText(req.session.captcha).toLowerCase() != req.body.captcha.toLowerCase()) {
            return res.status(400).json({
                errors: {
                    msg: "کد امنیتی صحیح نمی باشد"
                }
            });
        }
        //console.log(req.headers["token"]);
        if (!Tools.checkToken(req)) {
            return res.status(400).json({
                errors: {
                    msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
                }
            });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()[0]
            });
        }
        const { mobile, password } = req.body;
        try {
            let user = await User.findOne({
                mobile
            });
            if (!user) {
                return res.status(400).json({
                    errors: {
                        msg: "موبایل یا رمز وارد شده صحیح نمی باشد"
                    }
                });
            }
            //console.log(password);
            //console.log(Tools.decryptText(user.password));
            if (password != Tools.decryptText(user.password)) {
                return res.status(400).json({
                    errors: {
                        msg: "موبایل یا رمز وارد شده صحیح نمی باشد"
                    }
                });
            }

            req.session.uid = Tools.encriptText(user.id);
            var uinfo = await GetUserInformation(user.id);
            res.status(200).json(uinfo);
        } catch (e) {
            console.error(e);
            res.status(500).json({
                error: {
                    msg: "Server Error"
                }
            });
        }
    }
);
//verify robot 
app.post(
    "/verifysms",
    [
        check("verifyCode", "لطفا کد فعال سازی را وارد کنید").isNumeric()],
    async (req, res) => {
        var userid = Tools.decryptText(req.session.uid);
        if (Tools.decryptText(req.session.uid) == "" || Tools.decryptText(req.session.uid) == null) {
            return res.status(400).json({
                errors: {
                    msg: "کاربری شما شناسایی نشد"
                }
            });
        }
        if (!Tools.checkToken(req)) {
            return res.status(400).json({
                errors: {
                    msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
                }
            });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()[0]
            });
        }
        const { verifyCode } = req.body;
        let mobile = await User.findOne({ _id: userid }, { mobile: 1 });
        if (Tools.getTelegramVC(mobile.mobile) != verifyCode) {
            return res.status(400).json({
                errors: {
                    msg: "کد وارد شده صحیح نمی باشد"
                }
            });
        }
        try {
            let user = await User.updateOne({ _id: userid }, { $set: { mobileActive: 1 } }, function (err, res) {
                if (err) throw err;
                //onsole.log("1 document updated");
                //db.close();
            });
            var uinfo = await GetUserInformation(userid);
            //console.log(uinfo);
            res.status(200).json(uinfo);

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Server Error"
            });
        }

    }
);
app.get('/verifysmsauto/:id/:mob', async function (req, res) {
    //http://127.0.0.1:800/user/verifysmsauto/1157/989395510287
    //9830005785
    //https://nbx.ir/user/verifysmsauto/$TEXT/$FROM
    var vcode = parseInt(req.params.id.toEnglishDigits());
    var fromno = req.params.mob;
    fromno = fromno.substr(2);

    console.log("verify sms:"+vcode + "---" + Tools.getSMSVC(fromno)+"---"+fromno);
    if (Tools.getSMSVC(fromno) != parseInt(vcode)) {
        return res.status(400).send("bad request");
    }

    const user = await User.find({ mobile: "0" + fromno }, { _id: 1 });
    //console.log(user[0]._id);
    await User.updateOne({ _id: user[0]._id }, { $set: { mobileActive: true } });
    return res.status(200).json({ data: { ok: true } });

});
String.prototype.toEnglishDigits = function () {
    var num_dic = {
        '۰': '0',
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9',
    }

    return parseInt(this.replace(/[۰-۹]/g, function (w) {
        return num_dic[w]
    }));
}

app.post("/logout", function (req, res) {
    /*var userid = Tools.decryptText(req.session.uid);
    if (Tools.decryptText(req.session.uid) == "" || Tools.decryptText(req.session.uid) == null || Tools.decryptText(req.session.verifyCode) == "" || Tools.decryptText(req.session.verifyCode == null)) {
        return res.status(400).json({
            errors: {
                msg: "کاربری شما شناسایی نشد"
            }
        });
    }*/
    //req.session.destroy();
    req.session = null;
    //req.cookie.expires = new Date().getTime();
    res.status(200).json({
        data: {
            msg: "OK"
        }
    });

});
app.post("/getitem", async (req, res) => {
    //console.log(req.body);
    if (!Tools.checkToken(req)) {
        return res.status(400).json({
            errors: {
                msg: "توکن شما منقضی شده است لطفا صفحه را رفرش کنید"
            }
        });
    }
    var userid = Tools.decryptText(req.session.uid);
    if (userid == "" || userid == null) {
        return res.status(400).json({
            errors: {
                msg: "کاربری شما شناسایی نشد"
            }
        });
    }
    try {
        let myitem = await ItemSchema.find({ userid: userid },
            {
                _id: 1,
                zoom: 1,
                name: 1
            }).sort({ createdAt: -1 });

        if (!myitem)
            return "";

        //console.log(JSON.stringify(myitem));
        return res.status(200).send(JSON.stringify(myitem));
        /* return res.status(200).send({
            data: {
                item: JSON.stringify(myitem)
            }
        });*/

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
});
module.exports = app;
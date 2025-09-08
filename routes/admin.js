const express = require("express");
const app = express.Router();
var Tools = require("../middleware/tools");
const { detect } = require('detect-browser');
const browser = detect();
const AdminUser = require("../model/adminUser");
const Items = require("../model/item");

app.use(express.static("admin"));
app.post("/addUser", async function (req, res) {
    if (req.session.auid == null || req.session.auid == "")
     res.redirect("/");

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
        let user = await AdminUser.findOne({
            mobile
        });
        if (user) {
            return res.status(400).json({
                errors: {
                    msg: "شماره موبایل وارد شده در لیست کاربران ما موجود است"
                }
            });
        }

        user = new AdminUser({
            mobile,
            email,
            password,
            name
        });

        //const salt = await bcrypt.genSalt(10);password
        user.password = await Tools.encriptText(password);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        //req.session.uid = Tools.encriptText(payload.user.id);
        //req.session.verifyCode = Tools.encriptText(Tools.getRandom());
        //Tools.sendSMS(Tools.decryptText(req.session.verifyCode));

        //var uinfo = await GetUserInformation(user.id);
        //res.status(200).json(uinfo);
        res.status(200).json({ data: { msg: "با موفقیت ذخیره شد" } });

    } catch (err) {
        //console.log(err.message);
        res.status(500).send("Error in Saving");
    }
});
app.get("/login", function (req, res) {
    return res.render("../admin/login.html", { token: Tools.GetToken(browser.name, browser.version) });
});
app.post("/login", async function (req, res) {
   // console.log(req.body);
    const {
        email,
        password,
        captcha
    } = req.body;
    if (Tools.decryptText(req.session.captcha).toLowerCase() != captcha.toLowerCase()) {
        return res.status(400).json({
            errors: {
                msg: "کد امنیتی صحیح نمی باشد"
            }
        });
    }

    try {
        let user = await AdminUser.findOne({
            email
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

        req.session.auid = Tools.encriptText(user.id);
        //res.redirect("home.html")
        res.status(200).json({ data: { msg: "با موفقیت وارد شد" } });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: {
                msg: "Server Error"
            }
        });
    }
});
app.get("/home", function (req, res) {
    if (req.session.auid == null || req.session.auid == "")
        return res.render("../admin/login.html", { token: Tools.GetToken(browser.name, browser.version) });
    else
        return res.render("../admin/home.html", { token: Tools.GetToken(browser.name, browser.version) });
});
app.get("/item", async function (req, res) {
    if (req.session.auid == null || req.session.auid == "")
        res.redirect("/admin/login");

    let count = await Items.countDocuments();
    let data = await Items.find({}).sort({ createdAt: -1 });
    res.render('item.ejs', { records: data, count });
});
app.get("/logout", function (req, res) {
    req.session = null;
    res.redirect("/");
});
module.exports = app;
const Cryptr = require('cryptr');
const cryptr = new Cryptr('amirjoonikhan');
var parser = require('ua-parser-js');
module.exports = {

    getTelegramVC: function (phone) {
        return getverifyCode(phone)
    },
    getSMSVC: function (phone) {
        return getverifysmsCode(phone)
    },
    isMobile: function (req) {
        var ua = parser(req.headers['user-agent']);
        if (ua.device.type == "mobile")
            return true;
        return false;
    },
    GetToken: function (req) {
        var ua = parser(req.headers['user-agent']);
        return cryptr.encrypt(ua.browser.name + "!" + ua.browser.version + "!" + Date.now());
    },
    encriptText: function (intext) {
        if (intext == null || intext == "")
            return "";
        return cryptr.encrypt(intext);
    },
    decryptText: function (intext) {
        if (intext == null || intext == "")
            return "";
        return cryptr.decrypt(intext);
    },
    checkToken: function (req) {
        var token = req.headers["token"]
        var ua = parser(req.headers['user-agent']);
        if (token == null || token == "")
            return false;
        //console.log("token"+token);
        var tok = cryptr.decrypt(token);
        if (tok == "")
            return false;
        var array = tok.split('!');
        if (array.length != 3)
            return false;
        if (ua.browser.name != array[0])
            return false;
        if (ua.browser.version != array[1])
            return false;
        var diff = parseInt((Date.now() - parseFloat(array[2])) / 1000 / 60);
        if (diff > 20)
            return false;
        return true;
    },
    getRandom: function (max, min) {
        return Math.random() * (max - min) + min;
    },
    getRandom: function () {
        var max = 99999;
        var min = 11111;
        return parseInt(Math.random() * (max - min) + min);
    },
    sendSMS: function (number) {
        console.log(number);
    }
    ,
    Item2HTML: function (items) {
        return GetItems(items);
    }
}
var floorcnt = ["واحد در هر طبقه", "تک واحده", "دو واحده", "سه واحده", "چهار واحده", "پنج واحده", "شش واحده", "هفت واحده", "هشت واحده", "نه واحده", "ده واحده و بالاتر"];
var bedNo = ["اتاق خواب", "بدون خواب", "تک خوابه", "دو خوابه", "سه خوابه", "چهار خوابه", "پنج خوابه", "شش خوابه", "هفت خوابه", "هشت خوابه", "نه خوابه", "ده خوابه و بالاتر"];
var Nofloor = ["طبقات ساختمان", "یک طبقه", "دو طبقه", "سه طبقه", "چهار طبقه", "پنج طبقه", "شش طبقه", "هفت طبقه", "هشت طبقه", "نه طبقه", "ده طبقه و بالاتر"];
var floorNo = ["طبقه ملک", "زیر همکف", "همکف", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم و بالاتر"];
var melktakh = ["", "ساکن هستند", "تخلیه", "نوساز"];
var type = ["نوع ملک", "آپارتمان", "ویلایی", "زمین", "تجاری", "اداری", "مغازه", "باغ", "مزرعه"];
var typesale = ["", "کارتکس فروش", "کارتکس رهن و اجاره", "کارتکس معاوضه", "کارتکس پروژه ها","کارتکس مشاورین املاک"];
function GetItems(items) {
    var ot = "";
    ot += "<h1>" + typesale[items.typesale] + "</h1>";
    ot += "<h2>عنوان: " + items.name + "</h2>";
    if (items.typesale != 5) {
        if (items.typesale == 1) {
            if (items.monmeter != null && items.monmeter != "")
                ot += "<h2>مبلغ اجاره: " + items.monmeter + " تومان</h2>";
            if (items.monkol != null && items.monkol != "")
                ot += "<h2>مبلغ رهن: " + items.monkol + " تومان</h2>";
        }
        else {
            if (items.monmeter != null && items.monmeter != "")
                ot += "<h2>قیمت هر متر: " + items.monmeter + " تومان</h2>";
            if (items.monkol != null && items.monkol != "")
                ot += "<h2>قیمت کل: " + items.monkol + " تومان</h2>";
        }
        ot += "<h2>تاریخ: " + GetPDate(items.createdAt) + "</h2>";
        ot += "<h2>متراژ: " + items.meter + "</h2>";
        ot += "<h2>متراژ کل: " + items.allMeter + "</h2>";
        ot += "<h2>سن بنا: " + items.old + "</h2>";
        ot += "<h2>آدرس: " + items.address + "</h2>";
        ot += "<h2>توضیحات: " + items.desc + "</h2>";
        ot += "<h2>نوع ملک: " + type[items.type] + "</h2>";
        ot += "<h2>وضعیت ملک: " + melktakh[items.melktakh] + "</h2>";
        ot += "<h2>طبقه ملک: " + floorNo[items.floorNo] + "</h2>";

        ot += "<h2>طبقات ساختمان: " + Nofloor[items.Nofloor] + "</h2>";
        ot += "<h2>واحد در طبقه: " + floorcnt[items.floorcnt] + "</h2>";
        ot += "<h2>تعداد خواب: " + bedNo[items.bedNo] + "</h2>";
        ot += "<h2>شهر: #Shahr#</h2>";
        ot += "<h2>دیگر اطلاعات:";
        ot += getItem(items.otherItem);
    }
    else {
        var array = items.otherItem.split('#'); 
        ot += "<h2>همراه: " + array[0] + "</h2>";
        ot += "<h2>تلفن: " + array[1] + "</h2>";
        ot += "<h2>نمابر: " + array[2] + "</h2>";
        ot += "<h2>آدرس: " + items.address + "</h2>";
       
    }
    return ot;
}
function getItem(inItem) {
    var other = ["پارکینگ", "انباری", "بالکن", "گاز", "شوفاژ", "فن کوئل", "کولر گازی", "کولر آبی", "پکیج", "چیلر", "سونا", "استخر", "جکوزی", "حیاط", "حیات خلوت", "زیرزمین", "آسانسور", "پاسیو", "مستخدم", "شمالی", "جنوبی", "شرقی", "غربی"];
    var dl23 = ["نوع کابینت", "ام دی اف", "فلزی", "بدون کابینت", "چوبی مدرن"];
    var dl24 = ["نوع کفپوش", "سرامیک", "سنگ", "موکت", "موزاییک"];
    var dl25 = ["سرویس بهداشتی", "معمولی", "فرنگی", "معمولی و فرنگی"];
    var dl26 = ["نمای ساختمان", "سنگ", "آجر سه سانتی", "سیمان سفید", "رومی"];
    var ot = "";
    for (var i = 0; i < 23; i++) {
        if (inItem[i] == "1")
            ot += "، " + other[i];
    }
    if (inItem[23] != "0")
        ot += "، نوع کابینت:" + dl23[inItem[23]];
    if (inItem[24] != "0")
        ot += "، نوع کفپوش:" + dl24[inItem[24]];
    if (inItem[25] != "0")
        ot += "، سرویس بهداشتی:" + dl25[inItem[25]];
    if (inItem[26] != "0")
        ot += "، نمای ساختمان:" + dl26[inItem[26]];
    if (ot != "")
        ot = ot.substr(1);
    return ot;
}
function getverifyCode(phone) {

    if (phone.substr(0, 1) == "0")
        phone = phone.substr(1);
    if (phone.length == 13) {
        phone = phone.substr(3);
    }
    var sum = 0;
    //console.log(phone);
    for (var i = 0; i < phone.length; i++) {
        sum = sum + (parseInt(phone[i]) * 2);
    }
    return sum * 1360;
}
function getverifysmsCode(phone) {
    if (phone.substr(0, 1) == "0")
        phone = phone.substr(1);
    if (phone.length == 13) {
        phone = phone.substr(3);
    }
    var sum = 0;
    //console.log(phone);
    for (var i = 0; i < phone.length; i++) {
        sum = sum + (parseInt(phone[i]) + 4);
    }
    return sum * 13;
}
function GetPDate(indate) {
    var today = new Date(indate);//.toLocaleDateString('en-US');
    var gy = today.getFullYear();
    var gm = today.getMonth() + 1;
    var gd = today.getDate();
    //console.log(gd+"/"+gm);
    // function gregorian_to_jalali(gy,gm,gd){
    var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    var gy2 = (gm > 2) ? (gy + 1) : gy;
    var days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100))
        + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * (parseInt(days / 12053));
    days %= 12053;
    jy += 4 * (parseInt(days / 1461));
    days %= 1461;
    jy += parseInt((days - 1) / 365);
    if (days > 365) days = (days - 1) % 365;
    var jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
    var jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return jy + "/" + jm + "/" + jd;

}

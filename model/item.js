//{"meter":"","allMeter":"","old":"","monmeter":"","monkol":"","address":"","desc":"","AddLat":"","AddLon":"","AddID":"","type":"0","typesale":"0","melktakh":"0","floorNo":"0","AddOstanSel":"undefined","SubShahrSel":"undefined","Nofloor":"0","floorNo":"0","bedNo":"0","otherItem":"000000000000000000000000000"}
var GeoJSON = require('mongoose-geojson-schema');
const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema({
    userid: {
        type:mongoose.ObjectId,
        required: true
    },
    name:{
        type: String
    },
    meter: {
        type: Number,      
    },
    allMeter: {
        type: Number,     
    },
    old: {
        type: Number,       
    },
    monmeter: {
        type: Number,
      
    },
    monkol: {
        type: Number,
        default: 0
    },
    address: {
        type: String
    },
    desc: {
        type: String
    },
    Lat: {
        type:Number
    },
    Lon: {
        type: Number
    },
    point: {
        type:"point"
    },
    type: {
        type: Number

    },
    typesale: {
        type: Number

    },
    melktakh: {
        type: Number

    },
    floorNo: {
        type: Number

    },
    floorcnt: {
        type: Number

    },
    shahr: {
        type: Number

    },
    Nofloor: {
        type: Number

    },
    bedNo: {
        type: Number

    },
    otherItem: {
        type: String
    },
    hit: {
        type: Number
        , default: 0
    },
    zoom: {
        type: Number
        , default: 17
    },
    verify: {
        type: Boolean,
        default: false,
        require:true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        require:true
    }
}, { versionKey: false });

// export model user with UserSchema
module.exports = mongoose.model("item", ItemSchema);
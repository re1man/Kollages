var express = require('express');
var app = express();
var RedisStore = require('connect-redis')(express);
var redis = require("redis"),
postDb = redis.createClient();
var async = require('async');
var _= require('underscore');
var store = new RedisStore({db:3});


app.use("/assets", express.static(__dirname + '/assets'));
app.use("/app", express.static(__dirname + '/app'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'Amer1canBe@uty', store: store }));


app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.post('/save', function(req, res){
    var collection = JSON.stringify(req.body.collection);
    postDb.hmset(req.session.user.id, 'posts', collection, function(){
        res.send(200);
    });
});



app.post('/getSplash', function(req, res){
    if (!req.session.user){
        req.session.user = {};
        req.session.user.id = req.body.id;
    }
    postDb.hmget(req.session.user.id, 'posts', function(err, sections){
        var secs;
        if (sections[0] && sections[0] !== 'undefined'){
            secs = JSON.parse(sections);
            res.send(secs);
        } else {
           res.send(200); 
        }
    });
});

app.listen(8000);
console.log('starting server');

async.waterfall([
    function(callback){
    	postDb.select(0, callback(null));
    },
    function(callback){
        callback(null);
    }
], function (err, result) {
    console.log(err);
    
});








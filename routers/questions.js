var express = require('express');
var bodyParser = require('body-parser');
var uniqid = require("uniqid");
var router = express.Router();
var jsonParser = bodyParser.json()

router.post('/add',jsonParser,function(req,res){
    //var user = req.session.current_user
    var user = "####fakeUser####"
    var db = req.app.locals.db
    const qCollection = db.collection('questions')
    console.log(req.body)
    if(user == null){
        return res.json({'status':'error','error':'user not login'})
    }else{
        var data = {};
        var userReputation = 0
        /*db.collection('users').find({'username':user}).toArray(function(err,result){
            if(result.length!= 1){
                return res.json({'status':'error','error':'user not match'})
            }else{
                userReputation = result[0].reputation
            }
        })*/  
        data['id'] = uniqid.time();
        data['user'] = {'username':user,'reputation':userReputation}
        data['title'] = req.body.title
        data['body'] = req.body.body
        data['score'] = 0
        data['views'] = []
        data['answers'] = []
        data['timestamp'] = Date.now()/1000 |0
        data['media'] = []
        data['tags'] = []
        data['accepted_answer_id'] = null
        console.log(data)  
        qCollection.insertOne(data,function(err,res){
            if (err) {
                console.log(err);
            }else{
                console.log("1 question inserted");
            }
        })
        res.json({'status':"OK",'id':data.id})
    }
});

router.get('/:id',jsonParser,function(req,res){
    var qID = req.params.id
    var question = {}
    var db = req.app.locals.db
    db.collection('questions').find({'id':qID}).toArray(function(err,result){
        console.log(result.length)
        if(result.length != 1){
            return res.json({'status':'error','error':'question not found'})
        }
        else{
            question = result[0]
            
             //var user = req.session.current_user
        var user = "####FAKEUser!!!"
        if(user == null){ //count by IP
            user = req.connection.remoteAddress
        }
        var views = []
        console.log(question.views)
        for(var i in question.views){
            views.push(question.views[i])
        }
        var answers = []
        for(var i in question.answers){
            answers.push(question.answers[i])
        }
        if(!views.includes(user)){
            console.log("not included, views:"+views)
            views.push(user)
            db.collection('questions').updateOne({'id':qID }, { $set: {'views': views}}, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });
    }
    question['view_count'] = views.length
    delete question.views
    delete question._id
    question['answer_count'] = answers.length
    delete question.answers
    res.json({'status':'OK','question':question}) 
        }
    })
    
})


router.post('/:id/answers/add',jsonParser,function(req,res){
    var qID = req.params.id
    var user = req.session.current_user
    var db = req.app.locals.db
    const qCollection = db.collection('questions')
    var question = {}
    qCollection.find({'id':qID}).toArray(function(err,result){
        if(result.length!= 1){
            return res.json({'status':'error','error':'question not found'} )
        }
        else{
            question = result[0]
            var answer = req.body
            answer['id'] = uniqid.time("A")
            answer['score'] = 0
            answer['user'] = user
            answer['is_accepted'] = false
            answer['timestamp'] = Date.now()/1000 |0
            console.log(answer)
            var answers = []
            for(var i in question.answers){
                answers.push(question.answers[i])
            }
            answers.push(answer)
            qCollection.updateOne({'id':qID}, {$set:{'answers':answers}},function(err, res) {
                if (err) throw err;
                console.log("1 answer updated");
            });
            res.json({'status':'ok','id':answer.id})
        }
    })
    


})
router.get('/:id/answers',function(req,res){
    const qID = req.params.id
    var db = req.app.locals.db
    const qCollection = db.collection('questions')
    var question = {}
    qCollection.find({'id':qID}).toArray(function(err,result){
        if(result.length!= 1){
            return res.json({'status':'error','error':'question not found'} )
        }
        else{
            question = result[0]
            var answers = []
        for(var i in question.answers){
            answers.push(question.answers[i])
        }
        res.json({'status':'OK', 'answers':answers})
        }
    })
    
})





module.exports = router;
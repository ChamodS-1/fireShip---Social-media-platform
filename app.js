const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();

const bcryptjs =  require('bcryptjs');
const uuid = require('uuid');

const multer = require('multer');
const configStatus = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'images')
    },
    filename : function(req,file,cb){
        cb(null,Date.now()+'-'+ file.originalname)
    }
})

let id;

const upload  = multer({storage:configStatus });

const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

const db = require('./database/database');
 
app.use(express.static('public'))
app.use('/images',express.static('images'))
app.use('/user/images',express.static('images'));
app.use('/user/myposts/images',express.static('images'));
app.use('/user/all-post/images',express.static('images'));
app.use('/user/images',express.static('images'))

app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


app.get('/blog-home', function (req, res) {

    res.render('main');

});

app.get('/user/create-post/:id', async(req, res) => {

    const id = req.params.id;

    const user =  await db.DbConn().collection('users').find({userId:id}).toArray();

        const documents =   await db.DbConn().collection('author').find().toArray();
        res.render('post',{documents:documents,user:user});
});

app.post('/user/create-post/:id', upload.single('image'),async (req, res)=> {

    const userID = req.params.id;

    const fileUpload = req.file;
    const authorid = new ObjectId(req.body.select);

    const user =  await db.DbConn().collection('users').findOne({userId:userID});

    //console.log(user.userName);

    const newPost = {
        userID:userID,
        title : req.body.titlepost,
        postcontent : req.body.postcontent,
        hastags:req.body.hashTags,
        date : new Date().toDateString(),
        file : fileUpload.path,
        viewCount : 0,
        author : {
            authName : user.userName,
            authEmail : user.email,
            authorPic : user.file
        }
    }

    const postResults =  await db.DbConn().collection('posts').insertOne(newPost);
    res.redirect('/user/myposts/'+userID);

});

app.get('/user/myposts/:id', async(req, res) => {

    const data = req.query.data;
    const data2 = req.query.data2;
   // console.log(data);

    const id = req.params.id;

    const user =  await db.DbConn().collection('users').find({userId:id}).toArray();

    let devidedUserName = user[0].userName.split(' ').join('');
    const allUserPosts =  await db.DbConn().collection('posts').find({userID:id}).toArray();
    const ReverseallUserPosts=allUserPosts.reverse()
    res.render('userPage',{user:user,allPosts:ReverseallUserPosts,idOne:id,count:allUserPosts.length,count2:undefined,isUpdated:data,isDelete:data2,devidedUserName:devidedUserName});
    console.log(allUserPosts.length);
});

app.get('/sign-up', async(req, res) => {

    const emailstatus = req.query.emailstatus;
    const passwordstatus = req.query.passwordstatus;
    const emailpasswordstatus = req.query.emailpasswordstatus;
    const existing = req.query.existing;
    res.render('signup',{emailstatus:emailstatus,passwordstatus:passwordstatus,emailpasswordstatus:emailpasswordstatus,existing:existing});
});

app.post('/sign-up',upload.single('image1'),async(req, res) => {

    const fileUpload = req.file;

    const details = req.body;
    const email = details.email;
    const userName = details.userName;
    const confirmEmail = details.reemail;
    const password = details.password;

    //console.log(details);

    //console.log(email,confirmEmail,password)

    if(email!==confirmEmail && password.trim().length<4){
        return res.redirect('/sign-up?emailpasswordstatus=true');
    }

    if(email!==confirmEmail){
        return res.redirect('/sign-up?emailstatus=true');
    }

    if(password.trim().length<4){
        return res.redirect('/sign-up?passwordstatus=true');
    }

    if(!email || !confirmEmail || !password || password.trim().length<4 || email!==confirmEmail || !email.includes('@') || userName.trim()<6){
        console.log('invalid data');
        return res.redirect('/sign-up');
    }

    const existingUserEmail =  await db.DbConn().collection('users').findOne({email:email});
    if(existingUserEmail){
        console.log('user already exisiting!');
        return res.redirect('/sign-up?existing=true');
    }


    const hashedpass = await bcryptjs.hash(password,12);
    userIdURL = uuid.v4();

    const newUser = {

        userName:userName,
        email : email,
        password : hashedpass,
        file : fileUpload.path,
        userId : userIdURL
    }

    

    const userResult =  await db.DbConn().collection('users').insertOne(newUser);
    res.redirect('/login');
});

app.post('/login', async(req, res) => {

    const details = req.body;
    const userEmail = details.email;
    const userPass = details.password;

    const existingUser =  await db.DbConn().collection('users').findOne({email:userEmail});

    if(!existingUser){
        console.log('not found!');
        return res.redirect('/login?notUser=true')
    }

   const  passEqual = await bcryptjs.compare(userPass,existingUser.password);

   if(!passEqual){
    console.log('pass not match');
    return res.redirect('/login?password=true')
   }
  
   res.redirect('/user/'+existingUser.userId);
});

app.get('/login', async(req, res) => {

    const notUser = req.query.notUser;
    const password = req.query.password;
    const passreset = req.query.passreset;

    res.render('login',{notUser:notUser,password:password,passreset:passreset});
});

app.get('/reset', async(req, res) => {

    const notUser = req.query.notUser;
   
    
    
    res.render('reset',{notUser:notUser});
});

app.post('/reset', async(req, res) => {

    const details = req.body;
    const userEmail = details.email;
    const userPass = details.password;

    const existingUser =  await db.DbConn().collection('users').findOne({email:userEmail});

    if(!existingUser){
        console.log('not found!');
        return res.redirect('/reset?notUser=true')
    }

    const hashedpass = await bcryptjs.hash(userPass,12);


    const updatedPass = {
        password:hashedpass
    }

    try{
        const UpdatedCountresult =  await db.DbConn().collection('users').updateOne({email:userEmail}, {$set : updatedPass});
        console.log('updated!!');
    }catch(e){
        console.log(e.message);
    }
   

   res.redirect('/login?passreset=true');
});


app.get('/user/:id', async(req, res) => {

    const id = req.params.id;

    const user =  await db.DbConn().collection('users').find({userId:id}).toArray();

    let devidedUserName = user[0].userName.split(' ').join('');
    const allPosts =  await db.DbConn().collection('posts').find().toArray();

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
      
      // Shuffle the array
      shuffleArray(allPosts);
      
    const allUserPosts =  await db.DbConn().collection('posts').find({userID:id}).toArray();

    res.render('userPage',{user:user,allPosts:allPosts,idOne:id,count2:allUserPosts.length,count:undefined,isUpdated:false,isDelete:false,devidedUserName:devidedUserName});
});


// app.get('/user/redirect/:id1/:id2', function (req, res) {

//     const id = req.params.id1

//     res.render('successful');
//    // res.redirect('/user/myposts/'+id);

//     setTimeout(() => {
//         res.redirect('/user/myposts/'+id); // Redirect to the specific route after 2 seconds
//       }, 2000); // 2000 milliseconds = 2 seconds

// });

app.get('/updated', function (req, res) {

    res.render('updated');

});

app.get('/deleted', function (req, res) {

    res.render('deleted');

});

// app.get('/all-post',  async(req, res) => {

//     const allPosts =  await db.DbConn().collection('posts').find().toArray();
//     res.render('allpost',{allPosts:allPosts,length:allPosts.length});

// });



app.get('/user/all-post/:id',  async(req, res) => {

  //  id = req.params.id2;
  const receivedValue = req.query.value;
  //console.log(receivedValue);

    const postID = new ObjectId(req.params.id);
    const resultBefore =  await db.DbConn().collection('posts').findOne({_id : postID});
  
    const updatedCount = {
        viewCount:++resultBefore.viewCount
    }
    const UpdatedCountresult =  await db.DbConn().collection('posts').updateOne({_id : postID}, {$set : updatedCount});

    const result =  await db.DbConn().collection('posts').find({_id : postID}).toArray();
    let hastags;

    if(result[0].hastags===""){
        hastags = undefined;
    }else{
        hastags = result[0].hastags.split(',');
    }
    
    const Commentsresult =  await db.DbConn().collection('comments').find({postId : postID}).toArray();

    const user =  await db.DbConn().collection('users').find({userId:receivedValue}).toArray();

     res.render('viwpost', {user:user, result: result,length:Commentsresult.length,receivedValue:receivedValue,hastags:hastags});
});

app.get('/all-post/:id/comments',  async(req, res) => {

   const postID = new ObjectId(req.params.id);
   const Commentsresult =  await db.DbConn().collection('comments').find({postId : postID}).toArray();
   res.json(Commentsresult); 

});

//comments

app.post('/user/all-post/:id',  async(req, res) => {

    const value = req.query.value

    const commentID = new ObjectId(req.params.id);

    const user =  await db.DbConn().collection('users').findOne({userId:value});
    
    const newComment = {
        postId : commentID,
        comment : req.body.titlesummery,
        authorPost : user.userName,
        autherEmail : user.email,
        autherPic : user.file,
        date : new Date().toDateString()  
    }

    const commentResult =  await db.DbConn().collection('comments').insertOne(newComment);
    res.redirect('/user/all-post/'+req.params.id+'?value='+value);  
 });

app.get('/user/edite/:id2/:id', async (req, res)=>{

    const id = req.params.id2;
    const id2 = req.params.id;

   const editepostID = new ObjectId(req.params.id);
   const result =  await db.DbConn().collection('posts').find({_id : editepostID}).toArray();

        res.render('edite', { keys: result,id:id,id2:id2 });
});

app.post('/user/edite/:id2/:id', async (req, res) => {

    const id = req.params.id2;
    const id2 = req.params.id;

    const updatedPost = {

        title : req.body.titlepost,
        summary : req.body.titlesummery,
        postcontent : req.body.postcontent,
        date : new Date().toDateString(),
    }

    //let isUpdated = true

    const updatepostID = new ObjectId(req.params.id);
    try{
        const result =  await db.DbConn().collection('posts').updateOne({_id : updatepostID}, {$set : updatedPost});
        

        res.redirect('/user/myposts/'+id+'?data=true');
    }catch(e){
        console.log(e.message);
    }

});

app.get('/user/delete/:id2/:id', async (req, res) => {

    const id2 = req.params.id2;
    const deletepostID = new ObjectId(req.params.id);

    try{
        const result =  await db.DbConn().collection('posts').deleteOne({_id : deletepostID});
        const result2 =  await db.DbConn().collection('comments').deleteMany({postId : deletepostID});
        console.log(result2);
        res.redirect('/user/myposts/'+id2+'?data2=true');
    }catch(e){
        console.log(e.message);
    }
});

app.use(function (req, res) {

    res.render('404');
});

db.connectTo().then(() => {
    app.listen(3000);
}).catch((err) => console.log(err.message));


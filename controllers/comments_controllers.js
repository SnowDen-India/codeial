const Comment =require('../models/comment');
const Post =require('../models/post');
const commentsMailer = require('../mailers/comments_mailer');
const queue = require('../config/kue');
const commentEmailWorker = require('../workers/comment_Email_worker');


module.exports.create= async function(request,response){

    try{
        let post= await Post.findById(request.body.post);
       if(post){
         let comment = await  Comment.create({
               content:request.body.content,
               post:request.body.post,
               user:request.user._id
           });
          
             
              post.comments.push(comment);
              post.save();

              comment =await comment.populate('user','name email').execPopulate();
              //commentsMailer.newComment(comment);

           let job = queue.create('emails',comment).save(function(error){
              if(error){
                console.log('error in sending a queue',error);
                return;
              }
               console.log("job enqueued",job.id);

            });


              if(request.xhr){
                //Similar for comments to fetch the user's id!
              
                return response.status(200).json({
                         data:{
                           comment:comment
                         },
                         message:"Post created!"
                 
                });
              }
              request.flash('success', 'Comment Published! without ajaxxxx');
               return response.redirect('back');
            
           }
            
      }catch(error){
        console.log('Error',error);
          return;

         }
 



}

// above previous code

// Post.findById(request.body.post,function(error,post){
//     if(post){
//         Comment.create({
//             content:request.body.content,
//             post:request.body.post,
//             user:request.user._id
//         },function(error,comment){
//              if(error){
//              console.log('error in create the post');
//              return;
//          }
          
//            post.comments.push(comment);
//            post.save();
//            response.redirect('/');


//         });
//     }            



// });

//deleting a comment 

module.exports.destroy = async function(request,response){


          try{
            let comment= await Comment.findById(request.params.id);
              
            if(comment.user == request.user.id){

                let postId =comment.post;
                  comment.remove();
            let post =Post.findByIdAndUpdate(postId,{$pull:{comments:request.params.id}});
               
            // CHANGE :: destroy the associated likes for this comment
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});






                    // send the comment id which was deleted back to the views
            if (request.xhr){
              return response.status(200).json({
                  data: {
                      comment_id: request.params.id
                  },
                  message: "Post deleted"
              });
          }     

          request.flash('success', 'Comment deleted!');

          return response.redirect('/');
      }else{
          request.flash('error', 'Unauthorized');
          return response.redirect('back');
      }
          }catch(error){
            console.log('Error',error);
            return;
          }

           



}

// above previous code without async
// module.exports.destroy = function(request,response){
//     Comment.findById(request.params.id,function(error,comment){
      
//         if(comment.user == request.user.id){
//             let postId =comment.post;
//               comment.remove();
//              Post.findByIdAndUpdate(postId,{$pull:{comments:request.params.id}},function(error,post){
//                     return response.redirect('back');
//             });
//         }else{
//             return response.redirect('back');
//         }

//     });


// }
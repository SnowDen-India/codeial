const User=require('../models/user');
const fs = require('fs');
const path = require('path');



module.exports.profile = function(request, response){

          User.findById(request.params.id,function(error,user){
                return response.render('profile',{
                        title:'profile',
                        profile_user:user
           
                   });
           
          });
   
        // if(request.cookies.user_id){
        
        //         User.findById(request.cookies.user_id,function(error,user){

        //                    if(user){
        //                            return response.render('profile',{
        //                                    title:"user_profile",
        //                                    user:user
        //                            });
        //                    }
        //                    return response.redirect('/users/sign-in');


        //         });





        // }else{
      
        //                 return response.redirect('/users/sign-in');
                
        // }



        

}

module.exports.update = async function(request,response){

        // if(request.user.id== request.params.id){
        //         User.findByIdAndUpdate(request.params.id,request.body,function(error,user){
        //             return response.redirect('back');
        //         });
        // }else{
        //         return response.status(401).send('unauthorized');
        // }

            

        if(request.user.id==request.params.id){
                try{
                    let user =await User.findById(request.params.id);
            
                    User.uploadedAvatar(request,response,function(error){
                            if(error){
                              console.log('*****Multer Error!',error);      
                            }
                           // console.log(request.file);
                           user.name=request.body.name,
                           user.email=request.body.email
                           if(request.file){
                                   if(user.avatar){
                                      fs.unlinkSync(path.join(__dirname,'..',user.avatar));     
                                   }
                                //this is saving the path of the uploaded file into the avatar field in the user
                              user.avatar= User.avatarPath+'/'+request.file.filename;
                           }
                           user.save();
                           return response.redirect('back');

                    });

                }catch(error){
                        request.flash('Error',error);
                        return response.redirect('back');
                }

        }else{
                request.flash('error','unauthorized');
                return response.status(401).send('unauthorized'); 
        }




}





//rendering the sign up page
module.exports.signUp=function(request,response){

   if(request.isAuthenticated()){
        return   response.redirect('/users/profile');
   }


return response.render('user_sign_up',{
        title:"Codeial |  Sign Up"
});


}


//rendering the sign in page
module.exports.signIn=function(request,response){
        if(request.isAuthenticated()){
           return response.redirect('/users/profile');
        }
     
     
  return response.render("user_sign_in",{
          title:"Codeial | Sign IN"
  });


}
// get the sign up data
module.exports.create=function(request,response){

       // check password and confirm password are equal or not;
            console.log(request.body);
         if(request.body.password!=request.body.confirm_password){
                 return response.redirect('back');
         }

        User.findOne({email:request.body.email},function(error,user){

                if(error){
                        console.log("error in finding the user in signing up");
                        return;
                }

               if(!user){
                       User.create(request.body,function(error,user){
                               if(error){
                                console.log("error in creating the user while  signing up");
                                return; 
                               }
                               return response.redirect('/users/sign-in');
                       });

               }else{
                       return response.redirect('back');
               }



        });

           
}

//sign-in and session

module.exports.createSession=function(request , response){

request.flash('success','Logged in Successfully');
return response.redirect('/');
};



module.exports.destroySession=function(request,response){
        request.logout();
        request.flash('success',"You Have Logout SuccesFully!");
        return response.redirect('/');





        // let id=request.cookies.user_id;

        // User.findByIdAndDelete(id,function(error){
        //         if(error){
        //                 console.log('error in signout');
        //                 return;
        //         }
        //         return response.redirect('sign-in');
        // })
          
}

// module.exports.createSession=function(request , response){

//         request.flash('success','Logged in Successfully');
//         return response.redirect('/');
        
//         //stetps to authentication
        
//         //1.find the user
        
//         // User.findOne({email:request.body.email},function(error,user){
//         //         if(error){
//         //                 console.log('error in finding the user in signing in');
//         //                 return;
//         //         }
        
//         //         //2.handle user found
        
//         //        if(user){
//         //        //2.1 handle password mismatch
//         //        if(user.password!=request.body.password){
//         //                return response.redirect('back');
//         //        }
        
//         //        //2.2 handle session creation
        
//         //        response.cookie('user_id',user.id);
//         //        return response.redirect('/users/profile');
        
        
//         //        }else{
//         //            //3 handle user not found :(
        
//         //            return response.redirect('back');
        
//         //        }
        
        
        
//         //        });
        
        
        
        
//         };
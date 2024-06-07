

exports.userSessionNo = async (req, res, next) => {
    try{
         console.log('req.session.isUserLogin : ' + req.session.userIn );

         if (!req.session.userIn) {
             return res.redirect('/login');
         }
         next();
    }
    catch(error){
         console.log(error);
    }
 }
 
 
 
 
 exports.userSessionYes = async(req,res,next)=>{
     try{
         if(req.session.userIn){
             return res.redirect('/');
         }
         return next()
     }catch(error){
         console.error(error)
     }
 }




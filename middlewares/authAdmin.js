exports.adminSessionNo = async (req, res, next) => {
    try{
        console.log('req.session.admin inside adminSessionNo', req.session.admin);
        console.log('req.session : ' + req.session);
        if (!req.session.admin ) {
            console.log('admin in undefined inside adminSessionNo');
            return res.status(302).redirect('/admin/login');
        }
         next();
    }
    catch(error){
        console.log('error : ' + error );
    }
}




exports.adminSessionYes = async(req,res,next)=>{
    try{
        console.log('req.session.admin : ' + req.session.admin )
        if(req.session.admin){
            return res.redirect('/dashboard');
        }
        return next()
    }catch(error){
        console.error(error)
    }
}





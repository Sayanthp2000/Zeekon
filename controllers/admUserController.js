
const userModel = require('../models/user');



exports.adminUsersGet = async ( req, res ) => {
    try{
        const users = await userModel.find({ }).sort({ createdAt: -1 });
        res.render('admin-users.ejs', { users });
    }catch(err){
        console.log(`error in adminUsersGet : ${err}`);
    }
}




exports.userStatusPost = async ( req, res ) => {
    try{
        const { userId, status } = req.body;
        if(status === false ){
            const result = await userModel.findOneAndUpdate({ _id: userId }, { status: false });
            delete req.session.userIn;
            return res.json({ message: result });
        }else {
            const result = await userModel.findOneAndUpdate({ _id: userId }, { status: true });
            return res.json({ message: result });
        }
    }
    catch(err){
        console.log(`error in userStatusPost route : ${err}`);
    }
}
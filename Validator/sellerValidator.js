const userModel = require("../Models/UserModel");

const sellerValidator = async(req,res,next)=>{
try {
        const userId = req.id;
        const user = await userModel.findById(userId);
        if(user.role==='seller'){
            next();
        }
        else{
            return res.status(401).send("This route is only for sellers")
        }
} catch (error) {
        return res.status(502).send("Internal server error");
}
}

module.exports = {sellerValidator}
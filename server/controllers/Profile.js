const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course")

exports.updateProfile = async(req,res)=>{
    try{
            //get data
            const {dateOfBirth="",about = "",contactNumber,gender} = req.body;

            //get userId
            const id = req.user.id;

            //validation
            if(!contactNumber || !gender){
                return res.status(400).json({
                    success:false,
                    message : "All fields are required",
                })
            }

            //find profile
            const userDetails = await User.findById(id);
            const profileId  = userDetails.additionalDetails;
            const profileDetails  = await Profile.findById(profileId);

            //update profile
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about = about;
            profileDetails.gender = gender;
            profileDetails.contactNumber = contactNumber;
            await profileDetails.save();

            //return response
            return res.status(200).json({
                success : true,
                message : "profile updated successfully",
                profileDetails,
            });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message :"profile is NOT updated",
            error:error.message
        });
    }
};

//deleteAccount
exports.deleteAccount = async(req,res) =>{
    try{
            //get id
            const id = req.user.id;
            //validation
            const userDetails = await User.findById(id);
            if(!userDetails){
                return res.status(404).json({
                    success:false,
                    message : "User Not Found",
                });
            }
            //delete profile
            await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

            //TODO  :: HW UNenroll user from all the enrolled courses
            for (const courseId of User.courses) {
                await Course.findByIdAndUpdate(
                  courseId,
                  { $pull: { studentsEnroled: id } },
                  { new: true }
                )
              }

            //delete user 
            await User.findByIdAndDelete({_id:id});
          
            //return res
            return res.status(200).json({
                success : true,
                message : "User Deleted Successfully",
            })
    }
    catch(error){
            return res.status(400).json({
                success:false,
                message:"User cannot be deleted"
            });
    }
};


//getALLDetailsOfUser

exports.getUserAllDetails = async(req,res) =>{

        try{
                //get id
                const id = req.user.id;

                //validation
                const userDetails = await User.findById(id).populate("additionalDetails").exec();

                //return response
                return res.status(200).json({
                    success : true,
                    message : "User Data fetched Successfully",
                });
                

        }
        catch(error){   

            return res.status(400).json({
                success : false,
                message : "User Details cannot fetched "
            })

        }   
}
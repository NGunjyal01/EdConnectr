const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const cloudinary = require("cloudinary").v2;

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
             // agar middleware add nhi krenge toh code phat jayenga and req undefined aayega
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
            if(User.courses){
              for (const courseId of User.courses) {
                await Course.findByIdAndUpdate(
                  courseId,
                  { $pull: { studentsEnroled: id } },
                  { new: true }
                )
              }

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
      console.log(error);
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
                    data : userDetails
                });
                

        }
        catch(error){   

            return res.status(400).json({
                success : false,
                message : "User Details cannot fetched "
            })

        }   
}
async function uploadImageToCloudinary(file,folder,quality){
  const options = {folder};
  options.resource_type = "auto";
  if(quality){
      options.quality = quality;
  }
  console.log("temppath",file.tempFilePath);
 return await cloudinary.uploader.upload(file.tempFilePath,options);
}

// handler function to update display picture
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
//handler function to get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
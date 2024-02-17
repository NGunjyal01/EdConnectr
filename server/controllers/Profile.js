const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Profile = require("../models/Profile");
const User = require("../models/User");

// const cloudinary = require("cloudinary").v2;

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber } = req.body;
    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;

    // Save the updated profile
    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

//deleteAccount
exports.deleteAccount = async (req, res) => {
  try {
    //get id
    // agar middleware add nhi krenge toh code phat jayenga and req undefined aayega
    const id = req.user.id;


    //validation
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    //delete profile
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    //TODO  :: HW UNenroll user from all the enrolled courses
    //delete user 
    await User.findByIdAndDelete({ _id: id });

    //return res
    return res.status(200).json({

      success: true,
      message: "User Deleted Successfully",
    })
  }
  catch (error) {
    console.log(error);
    res.status(500).json({

      success: false,
      message: "User cannot be deleted"
    });
  }
};


//getALLDetailsOfUser

exports.getUserAllDetails = async (req, res) => {

  try {
    //get id
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id).populate("additionalDetails").exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "User Data fetched Successfully",
      data: userDetails
    });


  }
  catch (error) {

    return res.status(400).json({
      success: false,
      message: "User Details cannot fetched "
    })

  }
}
// async function uploadImageToCloudinary(file, folder, quality) {
//   const options = { folder };
//   options.resource_type = "auto";
//   if (quality) {
//     options.quality = quality;
//   }
//   console.log("temppath", file.tempFilePath);
//   return await cloudinary.uploader.upload(file.tempFilePath, options);
// }

// handler function to update display picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
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
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()


    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

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
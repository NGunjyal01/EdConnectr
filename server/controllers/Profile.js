const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
// const cloudinary = require("cloudinary").v2;

// Method for updating a profile
exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber ,gender} = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		profile.dateOfBirth = dateOfBirth;
		profile.about = about;
		profile.contactNumber = contactNumber;
    profile.gender = gender;

		// Save the updated profile
		const response = await profile.save();

    
		return res.status(200).json({
			success: true,
			message: "Profile updated successfully",
      response
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

// exports.instructorDashboard = async (req, res) => {
//   try {
//     const courseDetails = await Course.find({ instructor: req.user.id });

//     const courseData = courseDetails.map((course) => {
//       const totalStudentsEnrolled = course.studentsEnrolled.length
//       const totalAmountGenerated = totalStudentsEnrolled * course.price

//       //create an new object with the additional fields
//       const courseDataWithStats = {
//         _id: course._id,
//         courseName: course.courseName,
//         courseDescription: course.courseDescription,
//         totalStudentsEnrolled,
//         totalAmountGenerated,
//       }
//       return courseDataWithStats
//     })

//     res.status(200).json({ courses: courseData });

//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
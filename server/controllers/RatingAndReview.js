const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo,default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req,res)=>{
    try{

            //get userid
            const userId = req.userId;
            //fetch Data from req Body
            const {rating,review,courseId} = req.body;
            //check is user is enrolled or not
            const courseDetails = await Course.findOne(
                                                {
                                                    _id:courseId,
                                                    studentsEnrolled: {$elemMatch: {$eq:userId}},
                                                }
            );
            if(!courseDetails){
                return res.status(404).json({
                    success : false,
                    message : "student is not enrolled in the course",
                });
            }
            //check if user already reviewed the course
            const alreadyReviewed = await RatingAndReview.findOne({
                                            user:userId,
                                            course:courseId,
            });
            if(alreadyReviewed){
                return res.status(403).json({
                    success:false,
                    message : "User already reviewed the course",
                });
            }

            //create rating and review
            const ratingReview = await RatingAndReview.create({
                                            rating,
                                            review,
                                            course:courseId,
                                            user:userId,
            });
            //update course with this rating and review
            const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                            {
                                                $push:{
                                                    ratingAndReviews : ratingReview._id,
                                                }
                                            },
                                            {new:true})

            console.log(updatedCourseDetails);
            //return response
            return res.status(200).json({
                success : true,
                message : "Rating and Review updated in course"
            })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

//get average rating
exports.getAverageRating = async (req,res)=>{
    try{
            //getCourseId
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course:new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null, // will group all the ratings
                        averageRating: {$avg : "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0){
                return res.status(200).json({
                    success : true,
                    averageRating : result[0].averageRating,
                })
            }

            //if no rating review exists
            return res.status(200).json({
                success : true,
                message : "Average rating is 0",
                averageRating : 0,
            })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

//get all rating and review

exports.getAllRating = async (req,res) =>{
    try{   
            const allReviews = await RatingAndReview.find({})
                                        .sort({rating : "desc"})
                                        .populate({
                                            path:"user",
                                            select : "firtName lastName email image",
                                        })
                                        .populate({
                                            path:"course",
                                            select :"courseName",
                                        })
                                        .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data  : allReviews,
            });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

const Section = require("../models/Section");
const Course = require("../models/Course");


//CREATE HANDLER FUNCTION

exports.createSection = async (req,res)=>{
    try{

            //data fetch
            const {sectionName,courseId} = req.body;
            //data validation
            if(!sectionName || !courseId){
                return res.status(400).json({
                    success:false,
                    message : "All fields are required",
                });
            }
            //create section
            const newSection = await Section.create({sectionName});
            //update course with section ObjectId
            const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                    courseId,
                                                    {
                                                        $push:{
                                                            courseContent:newSection._id,
                                                        }
                                                    },
                                                    {new:true},
                                                    )
                                                    .populate({
                                                        path: "courseContent",
                                                        populate: {
                                                            path: "subSection",
                                                        },
                                                    })
                                                    .exec();
           // HW : use populate to replace section/subsection both in updatedCourseDetails above
           // return response
           return res.status(200).json({
                success : true,
                message : 'Section created successfully',
                updatedCourseDetails,
           })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message : 'unable to create section,try again later',
            error:error.message,
        });
    }
}

//UPDATE HANDLER FUNCTION

exports.updateSection = async (req,res) =>{
    try{
            //data input
            const {sectionName,sectionId} = req.body;
            //data validation
            if(!sectionName || !sectionId){
                return res.status(400).json({
                    success:false,
                    message : "All fields are required",
                });
            }
            //update data
            const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
               
            //return response

            return res.status(200).json({
                success : true,
                message : 'Section Updated Successfully',
            });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message : 'unable to update section,try again later',
            error:error.message,
        });
    }
}

//DELETE HANDLER FUNCTION
exports.deleteSection = async (req,res) => {
    try{

            //get ID - assuming that we are sending ID in params
            const {sectionId} = req.params
            //use findByIdAndDelete
            await Section.findByIdAndDelete(sectionId);
            //return response

            //TODO - DO WE NEED TO DELETE THE ObjectID OF Section FROM COURSE SCHEMA
            return res.status(200).json({
                success : true,
                message : 'Section Deleted Successfully',
            })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message : 'unable to delete section,try again later',
            error:error.message,
        });
    }
}
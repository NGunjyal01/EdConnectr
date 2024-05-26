const nodemailer = require("nodemailer");



// const mailSender = async(email,title,body)=>{
//     try{

//             let transporter = nodemailer.createTransport({

//                     host:process.env.MAIL_HOST,
//                     auth:{
//                         user: process.env.MAIL_USER,
//                         pass : process.env.MAIL_PAAS,
//                     }

//             })

//             let info = await transporter.sendMail({

//                     from: 'EdConnectr',
//                     to:`${email}`,
//                     subject:`${title}`,
//                     html: `${body}`,
//             })
//             console.log(info);
//             return info;
//     }
//     catch(error){
//         console.log(error.message);
//     }
// }



const mailSender = async(email,title,body)=>{
       
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.MAIL_USER,
            pass : process.env.MAIL_PASS 
        }
    })

    const mailOptions = {
        from :  `EdConnectr`,
        to : `${email}`,
        subject : `${title}`,
        html: `${body}`,

    }
    try{
            console.log(mailOptions);
            const result = await transporter.sendMail(mailOptions);
            console.log('Email Sent Successfully');
            console.log(result);
    }
    catch(error){
        console.log("Email send failed with an error :",error);
    }
 }

 const sendmail = async function sendVerificationEmail(email,title,body){

	try{
            
			const mailResponse   = await mailSender(email,title,body);
			console.log("Email Sent Successfully");
	}
	catch{

		console.log("error occured while sending mails: ",error);
		throw error;

	}
	//pre-post middleware

}



// const mailSender = async function sendVerificationEmail(email,otp){

// 	try{
// 			const mailResponse   = await mailSender(email,"Verification Email From EdConnectr",otp);
// 			console.log("Email Sent Successfully",mailResponse);
// 	}
// 	catch{

// 		console.log("error occured while sending mails: ",error);
// 		throw error;

// 	}
// 	//pre-post middleware
// OTPSchema.pre("save",async function(next){
// 	await sendVerificationEmail(this.email,this.otp);
// 	next();
// 	})
	
// }

module.exports  = sendmail;
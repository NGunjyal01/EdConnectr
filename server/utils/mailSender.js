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
            const result = await transporter.sendMail(mailOptions);
            console.log('Email Sent Successfully');
    }
    catch(error){
        console.log("Email send failed with an error :",error);
    }
    }


module.exports  = mailSender;
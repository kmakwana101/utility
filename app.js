require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');   //  Cross-Origin Resource Sharing
const helmet = require('helmet') // secure HTTP headers returned by your Express apps
const http = require('http');
const moment = require('moment'); // require
const { mongodbConnection } = require('./Database/mongodbConnect');
const mongoose = require('mongoose')
const { constants } = require('./config')
// const { createClient } = require('redis')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('MyPDFDoc.pdf'));
doc.end();
doc.text("Coding is Easy!")
doc.text('Coding is Easy!', 100, 100)
doc.moveDown(3);

doc.moveUp();  
doc.font('Times-Roman')
   .text('Coding is Easy!');
   doc.fillColor('red')
   .fontSize(8)
   .text('Coding is Easy!');

   
   function* fetchData() {
    const user = yield fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json());
    const posts = yield fetch(`https://jsonplaceholder.typicode.com/todos/2`).then(res => res.json());
    return [user,posts]
  }
  
  const gen = fetchData();
  
  gen.next().value.then(user => {
    console.log(user)
    gen.next(user).value.then(posts => {
      console.log(posts);
    });
  });

// const client = createClient();

// client.on('error', err => console.log('Redis Client Error', err));
// let demo = async (req, res) => {
// await client.connect();
// await client.set('key', 'value');
// const value = await client.get('key');
// }
// demo()

// how to check my heap Limit;
const v8 = require('v8');

const heapStatistics = v8.getHeapStatistics();
console.log('V8 Heap Statistics:', heapStatistics);
console.log(`Heap Total: ${Math.round(heapStatistics.total_heap_size / 1024 / 1024)} MB`);
console.log(`Heap Limit: ${Math.round(heapStatistics.heap_size_limit / 1024 / 1024)} MB`);

const otpGenerator = require('otp-generator'); // otp-generator package
console.log(otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , digits:true, lowerCaseAlphabets: false}))

var app = express(); // create app

function generateUUIDv4LikeNumberString(minLength, maxLength) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let randomNumberString = '';
  for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      randomNumberString += randomNumber.toString();
  }
  return randomNumberString;
}
// Example usage:
const uuidv4LikeNumberString = generateUUIDv4LikeNumberString(14, 16);
console.log(uuidv4LikeNumberString); // random number generater


function removeKeys(obj, keys) {
  obj = JSON.parse(JSON.stringify(obj))
  keys = JSON.parse(JSON.stringify(keys))

  if (typeof obj !== 'object' || obj === null) {
      return obj;
  }
  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
      if (obj.hasOwnProperty(key) && !keys.includes(key)) {
          newObj[key] = removeKeys(obj[key], keys);
      }
  }
  return newObj;
}

function compareObjects(obj1, obj2, keysToIgnore) {
  console.log('enter')

  const cleanObj1 = removeKeys(obj1, keysToIgnore);
  const cleanObj2 = removeKeys(obj2, keysToIgnore);

  const sortedCleanObj1 = {};
  const sortedCleanObj2 = {};


  Object.keys(cleanObj1).sort().forEach(key => {
      sortedCleanObj1[key] = cleanObj1[key];
  });

  Object.keys(cleanObj2).sort().forEach(key => {
      sortedCleanObj2[key] = cleanObj2[key];
  });

  console.log(JSON.parse(JSON.stringify(sortedCleanObj1)), "compare one")
  console.log(JSON.parse(JSON.stringify(sortedCleanObj2)),"compare two")   

  return JSON.stringify(sortedCleanObj1) === JSON.stringify(sortedCleanObj2);
}

let obj1 = {
  one : true,
  two1 : {
    one : true,
    two : true
  }
}

let obj2 = {
  one : true,
  two1 : {
    one : true,
    two : true
  }
}

const keysToIgnore = ["two"];

const areEqual = compareObjects(obj1, obj2, keysToIgnore);
console.log(areEqual , "areEqual")

// ---------- without Socket.io Events ----------------------

// const EventEmitter = require('events');
// const myEmitter = new EventEmitter();
// // Register an event listener
// myEmitter.on('myEvent', (arg) => {
//   console.log('Event occurred:', arg);
// });
// // Emit an event
// myEmitter.emit('myEvent', 'Hello, world!');

// ---------------------------------------------------------


// ------------- Cron Job --------------

// const cron = require('node-cron');

// cron.schedule('*/10 * * * * *',async () => {
//   console.log('running a task every 10 second');
//   // await createZip()
// }); // node-crone run every 10 seconds

//-------------------------------------- 


// ------------- mongodb Connection -------------------

mongodbConnection();

// app.use((req, res, next) => {
//   if (mongoose.connection.readyState !== 1) {
//     res.status(500).send('MongoDB connection is not available');
//   } else {
//     // MongoDB connection is established, continue with the request
//     next();
//   }
// });

// ----------------------------------------------------- 

// ---------- set Template Engine ---------

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// -------------------------------------------

// ------------------ middlewares ---------------------- 

app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------

// ------ all routes -------- 

let authRouter = require('./routes/auth.router');
let usersRouter = require('./routes/users');
let zipRouter = require('./routes/zip.router');

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/zip', zipRouter);

// ---------------------------

// server.use('/assets', express.static('./assets'));//static path set for files

// ------------  MOMENT.js ------------

// console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))

// console.log(moment().get('year'),
//   moment().get('month'),  // 0 to 11
//   moment().get('date'),
//   moment().get('hour'),
//   moment().get('minute'),
//   moment().get('second'),
//   moment().get('millisecond'))

// console.log(moment().calendar({
//   sameDay: '[Today]',
//   nextDay: '[Tomorrow]',
//   nextWeek: 'dddd',
//   lastDay: '[Yesterday]',
//   lastWeek: '[Last] dddd',
//   sameElse: 'DD/MM/YYYY'
// }))

// ---------------------------------------- 

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  next(err); // Pass the error to the next middleware (error handling middleware)
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// ------------ Socket.io ----------------

const server = http.createServer(app 
  // {
  // Certificate
  // }
  );

const io = require('socket.io')(server, { // this.app (second option)
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {

  console.log(`a user connected ! ${socket.id}`);
  socket.broadcast.emit('welcome', `${socket.id} user connect !`);

  // Room Create
  // socket.join('newRoom');
  // io.to('newRoom').emit('hello', 'world');

  // --------- Socket Events ----------

  // socket.on('message', (message) => {
  //   socket.broadcast.emit('message', ` ${socket.id} this user new message ==> ${message}`);
  // })

  socket.on('message', ({ userid, message }) => {
    console.log(userid, "userid");
    socket.to(userid).emit('message', ` ${socket.id} this user new message ==> ${message}`);
  }) // specific user with userid

  socket.on('disconnect', () => {
    console.log(`user disconnected ${socket.id}`);
    socket.broadcast.emit('welcome', `${socket.id} user Disconnect`);
  });
});

let port = constants.SOCKET_PORT;

server.listen(port, () => {
  console.log(`socket listening for ${port}`);
});

// ----------------------------------------

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// stripe Payment Gateway start

// STRIPE_SECRET_KEY = 'sk_test_10JUfvR1PKjcDJa01K8RUEzH00hOEVEQdd'
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// exports.helloWorld = functions.https.onRequest(async (req, res) => {
//     cors(req, res, async () => {
//         try {
//             const { amount, currency, card_number, exp_month, exp_year, cvc,name } = req.body;

//             if(!amount){
//                 throw new Error('amount is required.');
//             }else if(!currency){
//                 throw new Error('currency is required.');
//             }else if(!card_number){
//                 throw new Error('card_number is required.');
//             }else if(!exp_month){
//                 throw new Error('exp_month is required.');
//             }else if(!exp_year){
//                 throw new Error('exp_year is required.');
//             }else if(!cvc){
//                 throw new Error('cvc is required.');
//             }else if(!name){
//                 throw new Error('name is required.');
//             }

//             // Create a Stripe token
//             const tokenResponse = await stripe.tokens.create({
//                 card: {
//                     number : card_number,
//                     exp_month,
//                     exp_year,
//                     cvc,
//                     name
//                 },
//             });

//             const tokenId = tokenResponse.id;

//             if(!tokenId) throw new Error('Token Generate Error.');
//             // Create a charge
//             const charge = await stripe.charges.create({
//                 amount: amount, // amount in cents
//                 currency: currency,
//                 source: tokenId
//             });

//             console.log(charge, " paymentIntent response");

//             res.status(200).json({
//                 status: 'success',
//                 message: 'Payment has been charged successfully.',
//                 charge,
//             });
//         } catch (error) {
//             res.status(500).json({
//                 status: 'fail',
//                 message : error.message,
//             });
//         }
//     });
// });

// ----- Stripe end -------- 



// ----------- YesFincare Payment Gateway APIs ------------

// const GenerateToken = async (req, res, next) => {
//   try {
//       const email = process.env.YES_FINCARE_EMAIL
//       const password = process.env.YES_FINCARE_PASSWORD

//       const data = {
//           email,
//           password
//       }

//       const response = await axios.post(`${process.env.YES_FINCARE_LOGIN_URL}`, data, {
//           headers: {
//               'web_code': 'YES_FINCARE'
//           }
//       })
//       const responseData = response.data.data

//       console.log("TokenGenerate Response : ", response.data.data ,responseData._id)

//       const tokenGeneratedData = {
//           paymentGateway_id: responseData._id || null,
//           main_wallat: responseData.main_wallat,
//           pos_wallat: responseData.pos_wallat,
//           aeps_wallat: responseData.aeps_wallat,
//           firstname: responseData.firstname || null,
//           lastname: responseData.lastname || null,
//           email: responseData.email || null,
//           phone: responseData.phone || null,
//           name: responseData.name || null,
//           username: responseData.username || null,
//           token: responseData.token || null,
//           user_type: responseData.user_type || null,
//       };
      
//       await TOKEN_GENERATED_DATA.create(tokenGeneratedData)

//       if (response && response.data && response.data.data && response.data.data.token) {
//           return response.data.data.token
//       } else {
//           throw new Error('Token Generate Error')
//       }

//   } catch (error) {
//       res.status(400).json({
//           status: 'fail',
//           message: error.message
//       })
//   }
// }

// exports.createPayment = async (req, res) => {
//   try {
//       const { amount } = req.body

//       if (!amount) {
//           throw new Error('please provide amount.')
//       }

//       const data = { amount: amount }

//       const Token = await GenerateToken(req, res)

//       const response = await axios.post(`${process.env.YES_FINCARE_API_URL}`, data, {
//           headers: {
//               web_code: 'YES_FINCARE',
//               Authorization: 'Bearer ' + Token
//           }
//       })
//       // console.log(response)
//       const responseData = response?.data?.data?.data;

//       console.log('LinkGenerate Response : ', responseData)

//       const linkData = {
//           status: responseData?.status,
//           message: responseData?.message,
//           code: responseData?.code,
//           order_token: responseData?.order_token,
//           order_id: responseData?.order_id,
//           order_status: responseData?.order_staus || responseData?.order_status,
//           paymentLink: responseData?.paymentLink
//       };

//       await LINK_GENERATED_DATA.create(linkData);

//       let redirectData;
//       if (response && responseData) {
//           redirectData = responseData
//       } else {
//           throw new Error('Please try again.')
//       }

//       res.status(200).json({
//           status: 'success',
//           message: redirectData
//       })
//   } catch (error) {
//       res.status(400).json({
//           status: 'fail',
//           message: error.message
//       })
//   }
// }

// exports.confirmPayment = async (req, res) => {
//   try {
//       console.log('first')
//       const order_id = req.body.order_id

//       if (!order_id) {
//           throw new Error('order_id is required.')
//       }

//       const paymentResponse = await YES_FINCARE_RESPONSE.findOne({ 'order_id': order_id })

//       if (!paymentResponse) {
//           throw new Error('order_id is not a valid.')
//       }

//       // let response;
//       // if (paymentResponse.status === "SUCCESS") {
//       //     response = paymentStatus
//       // } else {
//       //     throw new Error('please try again.')
//       // }

//       res.status(200).json({
//           status: 'success',
//           data: paymentResponse
//       })

//   } catch (error) {
//       res.status(400).json({
//           status: 'fail',
//           message: error.message
//       })
//   }
// }

// exports.paymentResponse = async (req, res) => {
//   try {
//       let responseData = req.body

//       let paymentResponseData = {
//           status: responseData.status || null,
//           amount: responseData.amount,
//           remark: responseData.remark || null,
//           api_user_charges: responseData.api_user_charges,
//           total_amount: responseData.total_amount,
//           transaction_no: responseData.transaction_no || null,
//           previous_balance: responseData.previous_balance,
//           balance: responseData.balance,
//           rrn_no: responseData.rrn_no || null,
//           order_id: responseData.order_id || null,
//       }
      
//       const response = await YES_FINCARE_RESPONSE.create( paymentResponseData )

//       res.status(200).json({
//           status: 'success',
//           message: 'response sent successfully',
//           response: response.response
//       })
//   } catch (error) {
//       res.status(400).json({
//           status: 'fail',
//           message: error.message
//       })
//   }
// }


// file filter

// const multer = require('multer')
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/images')
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, uniqueSuffix + file.originalname)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     // Allowed mimetype
//     const allowedMimetype = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/svg+xml'];

//     if (allowedMimetype.includes(file.mimetype)) {
//         // Accept the file
//         cb(null, true);
//     } else {
//         // Reject the file
//         cb(new Error('Invalid file type. Only JPEG, JPG, WebP, PNG, and SVG files are allowed.'));
//     }
// };

// const upload = multer({ storage: storage , fileFilter: fileFilter })


// ------- FIREBASE CLOUD FUNCTIONS ----------- 

// ONLY PUSH NOTIFICATION 
// exports.helloWorld = functions.https.onRequest(async (req, res) => {
//   console.log('Sending message...');
//   const registrationToken = 'f040pUZ0hUdGpxol1fWCEG:APA91bHOb-mSQ22DwRW43MH-0RRwgVF7_scfMHsPGY5DxzJG3jyp5POIeS-a_0lGN-G-pe65V2L5YWFFu9sE0pwkxweJ_AvokEYiuQYSrKKK5zcFONNE5Pv8tJaqLKUYk07SaEyzcuw7';
//   try {

//       const message = {
//           notification: {
//               title: 'Hello from Firebase!',
//               body: 'This is a push notification from Firebase.'
//           },
//           token: registrationToken
//       };

//       admin.messaging().send(message)
//           .then((response) => {
//               console.log('Notification sent successfully:', response);
//           })
//           .catch((error) => {
//               console.error('Error sending notification:', error);
//           });

//       const response = await messaging.send(message);
//       console.log('Message sent successfully:', response);
//       res.status(200).send({
//           message: "Message sent successfully",
//           token: registrationToken
//       });
//       res.status(200).send({
//           message: "Message sent success"
//       });
//   } catch (error) {
//       console.error('Error sending message:', error);
//       res.status(400).send({
//           message: "Message sent failed",
//           errorMessage: error.message
//       });
//   }
// })



// WEEKLY JOB WITH PUSH NOTIFICATION 
// exports.helloWorldDemo = functions.https.onRequest(async (req, res) => {
//     try {
//         const weeklyJob = 'weeklyJob';
//         const parent = 'parent';
//         const child = 'child';

//         const weeklyJobCollectionRef = db.collection(weeklyJob)
//         const parentCollectionRef = db.collection(parent)
//         const childCollectionRef = db.collection(child)

//         const weeklyJobQuerySnapshot = await weeklyJobCollectionRef.get();

//         let notificationSentArray = []

//         for (const docSnapshot of weeklyJobQuerySnapshot.docs) {
//             const val = docSnapshot.data();
//             console.log('>>>>>', val.key)
//             if (val.jobs && val.jobs.length > 0) {
//                 for (const jobItem of val.jobs) {
//                     if (jobItem.jobStatus && jobItem.jobStatus.length > 0) {

//                         let jobStatus = Array.from(jobItem.jobStatus);

//                         for (let index = 0; index < jobStatus.length; index++) {
//                             const statusItem = jobStatus[index];
//                             const timestamp = Math.floor(statusItem.date);  //1712188800
//                             console.log(timestamp)
//                             const date = new Date(timestamp * 1000).getDate();

//                             const options = { timeZone: 'Europe/London' };
//                             const currentDate = new Date().getDate('en-US', options);

//                             console.log(`weeklyJobDate : ${typeof date, date}`);
//                             console.log('todayDate', currentDate)

//                             if (date === currentDate) {

//                                 console.log('enter')
//                                 let now = new Date();
//                                 let options = {
//                                     hour12: true,
//                                     timeZone: 'Europe/London' // Asia/Kolkata
//                                 };
//                                 let formattedTime = now.toLocaleString('en-US', options); // 4/8/2024, 8:13:53 AM
//                                 let currentTime = new Date(formattedTime)

//                                 let match = formattedTime.split(',');
//                                 match[1] = val.deadlineTime; /// "08:00 PM"
//                                 let parentDeadlineString = match.join(',');
//                                 let parentDeadlineSetSecond = new Date(parentDeadlineString).setSeconds(0); // Convert to Date object
//                                 let parentDeadlineTime = new Date(parentDeadlineSetSecond)

//                                 console.log(currentTime.toLocaleString(), parentDeadlineTime.toLocaleString(), '$$$$$$', currentTime, "&&", parentDeadlineTime) // >  4/8/2024, 6:09:47 AM 4/8/2024,04:00 AM fff

//                                 let isSameAMPM = (currentTime.getHours() >= 12) === (parentDeadlineTime.getHours() >= 12);
//                                 let isSameHour = currentTime.getHours() === parentDeadlineTime.getHours();
//                                 let isSameMinutes = currentTime.getMinutes() === parentDeadlineTime.getMinutes();

//                                 let advancedWarning = val.advancedWarning
//                                 if (advancedWarning.length > 0) {
//                                     let advancedWarningInHour = parseInt(advancedWarning[0])
//                                     console.log(currentTime.getHours(), parentDeadlineTime.getHours(), advancedWarningInHour, "*******@@@@@")
//                                     if (!isNaN(advancedWarningInHour) && currentTime.getHours() === parentDeadlineTime.getHours() - advancedWarningInHour) {
//                                         isSameHour = true
//                                         console.log(isSameAMPM, isSameHour, isSameMinutes, '*******')
//                                     }
//                                 }

//                                 if (isSameAMPM && isSameHour && isSameMinutes) {

//                                     if (statusItem.childStatus && statusItem.childStatus.length > 0) {

//                                         let parentUId = val.parentUId
//                                         let fcmTokensArray = []
//                                         let childArray = []
//                                         let childStatus = statusItem.childStatus

//                                         for (let index = 0; index < childStatus.length; index++) {
//                                             if (childStatus[index].status === 'pending' && childStatus[index].childId) {
//                                                 let singleChild = await childCollectionRef.doc(childStatus[index].childId).get()
//                                                 if (singleChild.exists) {
//                                                     let childData = singleChild.data();
//                                                     childArray.push({
//                                                         firstName: childData.firstName,
//                                                         lastName: childData.lastName,
//                                                         childId: childData.key
//                                                     })
//                                                 }
//                                             }
//                                         }

//                                         const parentQuerySnapshot = await parentCollectionRef.where("parentUId", "==", parentUId).get();

//                                         parentQuerySnapshot.forEach(async (doc) => {
//                                             const parentData = doc.data();
//                                             // console.log("Parent data:", parentData);
//                                             let fcmTokens = parentData.fcmTokens
//                                             fcmTokensArray.push(...fcmTokens)
//                                         });

//                                         if (parentUId && fcmTokensArray && childArray) {
//                                             let obj = {
//                                                 parentUId: parentUId,
//                                                 fcmTokens: fcmTokensArray,
//                                                 childArray,
//                                                 weeklyJob: jobItem
//                                             }
//                                             notificationSentArray.push(obj)
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         for (const notificationItem of notificationSentArray) {
//             let tokens = notificationItem.fcmTokens;
//             let childs = notificationItem.childArray
//             for (const child of childs) {
//                 for (const token of tokens) {
//                     console.log(child, `${child.firstName} ${child.lastName} Task is Pending`)
//                     const message = {
//                         data: {
//                             message: `${child.firstName} ${child.lastName} Task is Pending`
//                         },
//                         token: token
//                     };
//                     try {
//                         // const response = await admin.messaging().send(message);
//                         console.log('\x1b[33m', 'Notification sent successfully:', `${child.firstName} Task is Pending`);
//                     } catch (error) {
//                         console.log('Error sending notification:', error);
//                         continue;
//                     }
//                 }
//             }
//         }

//         res.status(200).json({
//             status: 'success',
//             response: notificationSentArray
//         });

//     } catch (error) {
//         console.error('Error fetching data from Firestore:', error);
//         res.status(500).json({
//             status: 'fail',
//             message: error?.message ?? 'Error fetching data from Firestore'
//         });
//     }
// });


// if alreadyLiked so alreadyLiked = true else false using some method

// var alreadyLiked = find.some(
//   (like) =>
//     like.likedBy.toString() === req.body.user_blocked_by.toString()
// );

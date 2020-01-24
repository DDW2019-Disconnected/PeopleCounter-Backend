import { Response, Request } from "express";
var firebase = require("firebase-admin");

exports.addPeople = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method == "OPTIONS") return handleOptions(res, req);
  if (firebase.apps.length === 0) firebase.initializeApp();


  const data = {
    startTime: Date.now() - (1000*10),
    endTime: Date.now(),
    visitors: req.body
  }

  const arduinoId = req.header("ArduinoID");

const arduinoDocReference = firebase.firestore().collection('arduinos').doc(arduinoId);
await arduinoDocReference.get().then(doc => {
  if (!doc.exists) {
    console.info("Document for Arduino " + arduinoId + " does not exist, creating doc...");
     arduinoDocReference.set({
      totalVisitors: data.visitors
    });
  } else {
    const docData = doc.data();
    docData.totalVisitors = parseInt(docData.totalVisitors) + parseInt(data.visitors);
  
    arduinoDocReference.set({
      totalVisitors: docData.totalVisitors
    });
  }
});


arduinoDocReference.collection('visits').doc().set(data);


  res.status(200).end();
}


exports.addNumber = async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method == "OPTIONS") return handleOptions(res, req);
  if (firebase.apps.length === 0) firebase.initializeApp();


  const data = {
    timePressed: Date.now(),
    numberPressed: req.body
  }

  const phoneId = req.header("PhoneID"); //idk hoeveel telefoons er in milaan komen ;)

const phoneDocRef = firebase.firestore().collection('phones').doc(phoneId);
const numberDocRef = phoneDocRef.collection('numbers').doc(req.body);
  numberDocRef.get().then(numberDoc => {
    if (!numberDoc.exists) {
      numberDocRef.set({
        totalPresses: 1
      })
    } else {
      const data = numberDoc.data();
      numberDocRef.set({
        totalPresses: parseInt(data.totalPresses) + 1,
      })
    }
  });

phoneDocRef.collection('presses').doc().set(data);
numberDocRef.collection('presses').doc().set({timePressed: data.timePressed}); // its doubled because A. in nosql thats kinda normal when it makes sense (and it kind of does ) and B you might thank me for this once you query it.

  res.status(200).end();
}
async function handleOptions(res: Response, req: Request) {
  res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
  res.header('Access-Control-Allow-Methods', req.header('Access-Control-Request-Method'));

  res.status(204).end();
}

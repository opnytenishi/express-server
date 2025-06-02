const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:1234@cluster0.tqwhgvc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Global for general use
var userCollection;
var jobCollection;
var hourCollection;

async function connectDB() {
	try {
		await client.connect();
		console.log("Connected to MongoDB Atlas\n");
		db = client.db("hourstracker"); 	
		userCollection = db.collection("users"); 
		jobCollection = db.collection("jobs");
		hourCollection = db.collection("hours");
    } catch (error) {
		console.error("MongoDB connection error:", error + "\n");
    }
}

connectDB();

app.get('/', (req, res) => {
  	res.send('<h3>Welcome to Hours Tracker server app!</h3>')
})

app.post('/verifyUserCredential', async (req, res) => {
	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
	try {  
		const doc = await userCollection.findOne({
			email:req.body.email, 
			password:req.body.password
		}, {projection:{_id:0}});
		
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
		if (doc) {
			console.log("Login success - User found:\n", doc, "\n");
		} else {
			console.log("Login failed - Invalid credentials\n");
		}
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
	
});

// GET request to check whether email address already exists or not
app.get('/verifyNewUserEmail', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.email) + "\n"); 
	try {  
		const doc = await userCollection.findOne({email:req.query.email}, {projection:{_id:0}});
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
		if (JSON.stringify(doc) != null) {
			console.log("Verification success - Email available:\n");
		} else {
			console.log("Verification failed - Email not Available:\n", doc, "\n");
		}
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// POST request to save new user record
app.post('/insertUserData', async (req, res) => {
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
	const userData = req.body; 	
	try {
		const result = await userCollection.insertOne(userData);
		console.log("User record with ID "+ result.insertedId + " has been inserted\n");
		res.status(200).send(result);
	} catch (err) {	
		console.log("Server error" + err + "\n");	
		res.status(500).json({ message: "Server error", error: err });
	}  
});

// GET request to check whether job name already exists or not
app.get('/verifyNewJobName', async (req, res) => {
	const { userEmail, jobName } = req.query;
	console.log("GET request received : " + JSON.stringify(userEmail) + 
		", " + JSON.stringify(jobName) + "\n"); 
		
	try {  
		const doc = await jobCollection.findOne({ name: jobName, userEmail });
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
		if (JSON.stringify(doc) != null) {
			console.log("Verification success - Name available:\n");
		} else {
			console.log("Verification failed - Name not Available:\n", doc, "\n");
		}
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// POST request to save new job record
app.post('/insertJobData', async (req, res) => {
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
	const jobData = req.body; 	
	try {
		const result = await jobCollection.insertOne(jobData);
		console.log("Job record with ID "+ result.insertedId + " has been inserted\n");
		res.status(200).send(result);
	} catch (err) {	
		console.log("Server error" + err + "\n");	
		res.status(500).json({ message: "Server error", error: err });
	}  
});

// GET request to load All Job data for logged in user
app.get('/getJobs', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.userEmail) + "\n"); 
	try {
		const docs = await jobCollection.find({userEmail: req.query.userEmail}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send(docs); 
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// POST request to save new hour record
app.post('/insertHourData', async (req, res) => {
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
	const hourData = req.body; 	
	hourData.hoursWorked = parseFloat(hourData.hoursWorked);
	try {
		const result = await hourCollection.insertOne(hourData);
		console.log("Job record with ID "+ result.insertedId + " has been inserted\n");
		res.status(200).send(result);
	} catch (err) {	
		console.log("Server error" + err + "\n");	
		res.status(500).json({ message: "Server error", error: err });
	}  
});

// GET request to load hour data for logged in user for given job
app.get('/getHours', async (req, res) => {
	const { userEmail, jobName } = req.query;
	console.log("GET request received : " + JSON.stringify(req.query.userEmail) + 
		", " + JSON.stringify(req.query.jobName) + "\n"); 
	try {
		const docs = await hourCollection.find({
            userEmail: userEmail,
            jobName: jobName
        }).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send(docs); 
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// GET request to load hour data for logged in user
app.get('/getHoursForAllJobs', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.userEmail) + "\n"); 
	try {
		const docs = await hourCollection.find({userEmail: req.query.userEmail}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send(docs); 
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

app.get("/getHourRecordsForUser", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: "Missing email" });

  try {
    const records = await hourCollection.find({ userEmail: email }).toArray();
    res.status(200).json(records);
  } catch (err) {
    console.log("Error fetching user hour records:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});



app.listen(port, () => {
  	console.log(`Hours Tracker server app listening at http://localhost:${port}`) 
});

const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
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

// POST request to check user login credentials
app.post('/verifyUserCredential', async (req, res) => {
	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
	try {  
		const doc = await userCollection.findOne({
			email:req.body.email, 
			password:req.body.password
		}, {projection:{_id:0}});
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err });
	}
	
});

// GET request to check whether email address already exists or not
app.get('/verifyNewUserEmail', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.email) + "\n"); 
	try {  
		const doc = await userCollection.findOne({email:req.query.email}, {projection:{_id:0}});
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
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
		const doc = await userCollection.insertOne(userData);
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc);
	} catch (err) {	
		console.log("Server error" + err + "\n");	
		res.status(500).json({ message: "Server error", error: err });
	}  
});

// PUT request to update allowed hours
app.put('/updateAllowedHours', async (req, res) => {
	const { email, allowedHours } = req.body;
    console.log("PUT request received : " + JSON.stringify(email) + ", " + JSON.stringify(allowedHours) +"\n"); 
	try {
		const doc = await userCollection.updateOne(
			{ email },
			{ $set: { allowedHours: allowedHours } }
		);
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc);
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
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
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
		const doc = await jobCollection.insertOne(jobData);
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc);
	} catch (err) {	
		console.log("Server error" + err + "\n");	
		res.status(500).json({ message: "Server error", error: err });
	}  
});

// GET request to load All Job data for logged in user
app.get('/getJobs', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.userEmail) + "\n"); 
	try {
		const doc = await jobCollection.find({userEmail: req.query.userEmail}).toArray();
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
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
		const doc = await hourCollection.insertOne(hourData);
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc);
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
		const doc = await hourCollection.find({
            userEmail: userEmail,
            jobName: jobName
        }).toArray();
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// GET request to load all hour data for logged in user
app.get('/getHoursForAllJobs', async (req, res) => {
	console.log("GET request received : " + JSON.stringify(req.query.userEmail) + "\n"); 
	try {
		const doc = await hourCollection.find({userEmail: req.query.userEmail}).toArray();
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).send(doc); 
	} catch (err) {
		console.log("Server error" + err + "\n");
		res.status(500).json({ message: "Server error", error: err });
	}
});

// DELETE request to selected job and hours
app.delete('/deleteJobAndHours', async (req, res) => {
	const { userEmail, jobName } = req.body;
	console.log("DELETE request received : " + JSON.stringify(userEmail) +
		", " + JSON.stringify(jobName) + "\n"); 
	try {
		const jobDel = await jobCollection.deleteOne({ userEmail, name: jobName });
		const hourDel = await hourCollection.deleteMany({ userEmail, jobName });
		console.log("Request Outcome: " + JSON.stringify(jobDel) + ", " + JSON.stringify(hourDel));
		res.status(200).json(jobDel);
	} catch (err) {
		console.error("Delete error:", err);
		res.status(500).json({ message: "Server error", error: err });
	}
});

// DELETE request to selected hour record
app.delete('/deleteHourRecord/:id', async (req, res) => {
	const recordId = req.params.id;
	console.log("DELETE request received : " + JSON.stringify(recordId) + "\n"); 
	try {
		const doc = await hourCollection.deleteOne({ _id: new ObjectId(recordId) });
		console.log("Request Outcome: " + JSON.stringify(doc));
		res.status(200).json(doc);
	} catch (err) {
		console.error("Error deleting hour record:", err);
		res.status(500).json({ message: "Server error", error: err });
	}
});


app.listen(port, () => {
  	console.log(`Hours Tracker server app listening at http://localhost:${port}`) 
});

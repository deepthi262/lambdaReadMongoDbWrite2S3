const AWS = require('aws-sdk');
const {MongoClient} = require('mongodb')

const s3 = new AWS.S3();
const uri = "mongodb://root:example@localhost:27017";
const myDB = "testdb";
const myCollection = "testCollection";

const bucketName = "bucket-mongodb-output";
const s3Key = "output.json"; // The key (filename) in S3
const s3KeyEmpty = "write.complete";

//connect to db
async function dbConnect(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
    return client; 
} 

//read from db collection, fetch records
async function fetchRecords(client, myDB, myCollection) {
    const database = client.db(myDB);
    const collection = database.collection(myCollection);
    const cursor = collection.find({});
    console.log("Records fetched from the database");
    const records = await cursor.toArray();
    return records;
}

//write to s3bucket
async function writeToS3(records, bucketName, s3Key){
    const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: JSON.stringify(records, null, 2), // Convert records to a pretty-printed JSON string
        ContentType: "application/json"
    };

    const paramsEmpty = {
        Bucket: bucketName,
        Key: s3KeyEmpty,
        Body: " ", // Convert records to a pretty-printed JSON string
        ContentType: "application/json"
    };

    try {
        const result1 = await s3.putObject(params).promise();

        console.log("First object uploaded:", result1);

        // Upload the .complete file (after the first one completes)
        const result2 = await s3.putObject(paramsEmpty).promise();
        console.log(".complete file uploaded:", result2);
                        
        // console.log("Data written to S3:", result);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data written successfully to S3 and .complete file created", s3Key: s3Key })
        };
    } catch (error) {
        console.error("Error writing to S3:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error writing to S3", error: error.message })
        };
    }
}

exports.handler = async (event) => {
    let client;
    try {
        client = await dbConnect(uri);

        const records = await fetchRecords(client, myDB, myCollection);

        const result = await writeToS3(records, bucketName, s3Key);

// //close the connection
//         await client.close();

        return result;

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving data", error: error.message })
        };
    } finally {
        if (client) {

            await client.close();
        }
    }
};



const { MongoClient } = require("mongodb");
const fs = require("fs");
const os = require("os");
const path = require("path");

exports.handler = async (event) => {
    const uri = "mongodb://root:example@localhost:27017"; // Replace <Docker-Host-IP> with the IP address of your Docker host
    const client = new MongoClient(uri);

    try {
        console.log("Connect to MongoDB");
        await client.connect();
        const database = client.db("testdb");
        const collection = database.collection("testCollection");

        // Query MongoDB
        const cursor = collection.find({});
        console.log(`cursor data : ${cursor}.toArray()`)
        // Define the file path
        // const filePath = path.join(os.tmpdir(), "output.json");
        const filePath = path.join('./', "output.json");
        console.log(`filepath is : ${filePath}`);
        // Write to a file in the /tmp directory
        const writeStream = fs.createWriteStream(filePath);

        await cursor.forEach(doc => {
            writeStream.write(JSON.stringify(doc) + "\n");
        });

        writeStream.end();

        console.log("Data written to", filePath);

        // Return the file path
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data written successfully", filePath: filePath })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving data", error: error.message })
        };
    } finally {
        await client.close();
    }
};


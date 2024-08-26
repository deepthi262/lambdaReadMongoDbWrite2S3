const { MongoClient } = require("mongodb");
const fs = require("fs");
const os = require("os");
const path = require("path");


const uri = "mongodb://root:example@localhost:27017"; // Replace <Docker-Host-IP> with the IP address of your Docker host
const myDB = "testdb";
const myCollection = "testCollection";


async function dbConnect(uri){
                    const client = new MongoClient(uri);
                    await client.connect();
                    console.log("connected to mongodb ");
                    return client;
                    
}

async function fetchRecords(client,myDB,myCollection){
    const database = client.db(myDB);
        const collection = database.collection(myCollection);
        // Query MongoDB
        const cursor = collection.find({});
        console.log(`cursor data : ${cursor}.toArray()`)
        return cursor;
}

async function writeToFile(cursor){
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
}


exports.handler = async (event) => {
    
    try {
        const client =await dbConnect(uri);

        const cursor = await fetchRecords(client,myDB,myCollection);

        await writeToFile(cursor);
        
        await client.close();
       
        return "successfully reading"

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving data", error: error.message })
        };
    } 
    // finally {
    //     // await client.close();
    // }
};


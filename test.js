//  const { handler } = require('./index');
//const {handler} = require('./readWriteToFile');
// const { handler } = require('./recursive');
const {handler} =require('./readWriteToS3');
const event = {test: "true"}; // Simulate the event object your Lambda function would receive

handler(event).then(response => {
    console.log('Lambda Response:', response);
}).catch(error => {
    console.error('Error:', error);
});

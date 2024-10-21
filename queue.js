const Queue = require("bull");
const fs = require("fs");
const util = require("util");
const redisConfig = {
  host: "127.0.0.1",
  port: 6379,
};

// Task queue for each user
const taskQueue = new Queue("taskQueue", { redis: redisConfig });

// Promisify fs.appendFile for cleaner async/await syntax
const appendFile = util.promisify(fs.appendFile);

// Task function to log task completion
async function task(user_id) {
  const logMessage = `${user_id} - task completed at - ${new Date().toLocaleString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      hour12: false, // 24-hour format
    }
  )}\n`;

  // Log to console
  console.log(logMessage);

  // Append log to a file
  await appendFile("task-log.txt", logMessage);
}

// Queue processor
taskQueue.process(async (job, done) => {
  const { userId } = job.data;

  try {
    await task(userId); // Call the task function
    done();
  } catch (error) {
    console.error("Error processing task:", error);
    done(new Error("Failed to process task"));
  }
});

module.exports = taskQueue;

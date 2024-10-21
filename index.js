const express = require("express");
const { taskRateLimiter, userRequests } = require("./RateLimit");
const taskQueue = require("./queue");

const app = express();
const port = 3000;

//parse json object
app.use(express.json());

//handle request
// Task Route with Rate Limiting and Queuing
app.post("/api/v1/task", taskRateLimiter, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID   are required" });
  }

  // Check if the request was queued
  const currentTime = Date.now();
  const userRequestData = userRequests[userId];
  const timeElapsed = currentTime - userRequestData.lastRequestTime;

  if (timeElapsed < 1000 && userRequestData.count > 1) {
    // If the  was rate limited, add to the queue
    await taskQueue.add({ userId });
    return res.status(202).json({ message: `Task for user ${userId} queued.` });
  }

  // Process the  immediately
  await taskQueue.add({ userId });
  res
    .status(202)
    .json({ message: `Task for user ${userId} added to the queue` });
});

//listen to the server
app.listen(port, () => {
  console.log(`listening to the server on port ${port}`);
});

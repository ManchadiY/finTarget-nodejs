const rateLimit = require("express-rate-limit");
const taskQueue = require("./queue");

// In-memory storage for user task counts and timestamps
const userRequests = {};

const taskRateLimiter = async (req, res, next) => {
  const userId = req.body.userId;
  const currentTime = Date.now();

  // Initialize the user if not exists
  if (!userRequests[userId]) {
    userRequests[userId] = { count: 0, lastRequestTime: currentTime };
  }

  //exisiting data
  const userData = userRequests[userId];

  // Check the time elapsed since the last request
  const timeElapsed = currentTime - userData.lastRequestTime;

  // Reset count if time window has passed
  if (timeElapsed > 60 * 1000) {
    userData.count = 0;
  }

  // Increment task count
  userData.count++;

  // Rate limit check
  if (userData.count > 20) {
    // Add to queue and delay execution to preserve the task
    await taskQueue.add({ userId }, { delay: 60000 }); // Delay by 1 minute
    return res
      .status(202)
      .json({ message: `Task for user ${userId} queued due to minute limit.` });
  }

  // Check for per-second rate limiting
  if (timeElapsed < 1000 && userData.count > 1) {
    // Queue the task if the per-second limit is reached
    return res.status(202).json({
      message: `Rate limit exceeded. Task will be queued for user ${userId}.`,
    });
  } else {
    userData.lastRequestTime = currentTime; // Update last request time
  }

  next();
};

module.exports = { taskRateLimiter, userRequests };

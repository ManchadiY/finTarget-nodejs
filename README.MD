# API Rate Limiting with Queuing Documentation

## Overview

This document describes the implementation of a Node.js API that processes user tasks with rate limiting and queuing mechanisms. The API ensures that no user exceeds a predefined limit of tasks per second and per minute, while also preserving requests that exceed these limits for later processing.

## Objectives

- **Rate Limiting**: Enforce a limit of 1 task per second and 20 tasks per minute per user.
- **Queueing**: Ensure that no requests are dropped. If the rate limit is exceeded, requests are queued and executed after the appropriate delays.
- **Logging**: Track task completion in a log file.

## Implementation

### Technologies Used

- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web framework for building the API.
- **Bull**: A Redis-based queue for handling delayed tasks.
- **Redis**: In-memory data structure store for managing task queues.

### Key Components

1. **API Endpoints**:

   - `POST /api/v1/task`: Endpoint to accept user tasks. This endpoint is protected by rate limiting.

2. **Rate Limiting Logic**:

   - Maintains a record of user requests to determine if the current request exceeds the allowed limits.
   - Each user is tracked with the number of requests made and the timestamps of those requests.

3. **Task Queuing**:

   - When a request exceeds the per-second or per-minute limits, it is queued using Bull with an appropriate delay.
   - Tasks in the queue are processed asynchronously to maintain performance.

4. **Logging**:
   - Each task completion is logged with a user ID and timestamp.

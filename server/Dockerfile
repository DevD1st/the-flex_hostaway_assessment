# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# install typescript to build
RUN npm install -g typescript

# Copy package files
COPY package*.json ./

# Install dependencies
# we can optimize with multi stage build, but for this project, we can leave it like this for now
RUN npm i

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

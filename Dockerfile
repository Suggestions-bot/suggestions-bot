# Use the LTS version of Node.js
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["node", "index.js"]
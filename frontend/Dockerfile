# Use the official Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000, which is the default for the React dev server
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "start"]

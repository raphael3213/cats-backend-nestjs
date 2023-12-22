# Use Node.js image as the base image
FROM node:latest

# Create and set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your NestJS application runs on
EXPOSE 3000

# Set environment variables for SQLite database file path

VOLUME /usr/src/app/data/db

VOLUME /usr/src/app/data/cats

ENV SQLITE_DB_PATH=/usr/src/app/data/db/sqlite.db

# (Optional) Create SQLite database file
RUN touch $SQLITE_DB_PATH
# Start the NestJS application
CMD ["npm", "run", "start:prod"]
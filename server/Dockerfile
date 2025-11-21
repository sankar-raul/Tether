# Use Node.js LTS
FROM node:18-alpine

# Set work directory
WORKDIR /usr/src/tether

# Copy dependencies first
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy all files
COPY . .

# Expose port (Cloud Run will ignore this, but good practice)
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images uploads/documents uploads/templates

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "run", "server:watch"]

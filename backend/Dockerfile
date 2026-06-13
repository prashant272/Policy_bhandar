FROM node:20-alpine

# Install system-wide ffmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

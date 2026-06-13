FROM node:20-alpine

# Install system-wide ffmpeg, fontconfig, and system fonts
RUN apk add --no-cache ffmpeg fontconfig font-noto ttf-dejavu && fc-cache -fv

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

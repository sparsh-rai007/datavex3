FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all dependencies for development)
# For production, use: RUN npm install --omit=dev
RUN npm install

# Copy source code
COPY . .

# Build TypeScript (only needed for production)
# For development with volumes, this is handled by tsx watch
# RUN npm run build

# Expose port
EXPOSE 5000

# Start server (development mode)
# For production, use: CMD ["npm", "start"]
CMD ["npm", "run", "dev"]


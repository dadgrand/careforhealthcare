FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Replace npm ci with npm install
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application if needed (uncomment if using production build)
# RUN npm run build

EXPOSE 3000

# Default command
CMD ["npm", "start"]
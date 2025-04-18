
# Build stage
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serve to host the app
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist /app/dist

# Script to generate config.js with environment variables
RUN echo '#!/bin/sh' > /app/generate-config.sh && \
    echo 'CONFIG_FILE=/app/dist/config.js' >> /app/generate-config.sh && \
    echo 'echo "window.ENV = {" > $CONFIG_FILE' >> /app/generate-config.sh && \
    echo 'if [ ! -z "$SUPABASE_URL" ]; then echo "  SUPABASE_URL: \"$SUPABASE_URL\"," >> $CONFIG_FILE; fi' >> /app/generate-config.sh && \
    echo 'if [ ! -z "$SUPABASE_ANON_KEY" ]; then echo "  SUPABASE_ANON_KEY: \"$SUPABASE_ANON_KEY\"," >> $CONFIG_FILE; fi' >> /app/generate-config.sh && \
    echo 'echo "};" >> $CONFIG_FILE' >> /app/generate-config.sh && \
    echo 'serve -s dist -l 80' >> /app/generate-config.sh && \
    chmod +x /app/generate-config.sh

# Create directory for logs
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Expose port 80
EXPOSE 80

# Run the generate-config script and then serve the app
CMD ["/bin/sh", "/app/generate-config.sh"]

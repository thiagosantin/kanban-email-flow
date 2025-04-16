
# Build stage
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script to generate config.js with environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-generate-config.sh && \
    echo 'CONFIG_FILE=/usr/share/nginx/html/config.js' >> /docker-entrypoint.d/40-generate-config.sh && \
    echo 'echo "window.ENV = {" > $CONFIG_FILE' >> /docker-entrypoint.d/40-generate-config.sh && \
    echo 'if [ ! -z "$SUPABASE_URL" ]; then echo "  SUPABASE_URL: \"$SUPABASE_URL\"," >> $CONFIG_FILE; fi' >> /docker-entrypoint.d/40-generate-config.sh && \
    echo 'if [ ! -z "$SUPABASE_ANON_KEY" ]; then echo "  SUPABASE_ANON_KEY: \"$SUPABASE_ANON_KEY\"," >> $CONFIG_FILE; fi' >> /docker-entrypoint.d/40-generate-config.sh && \
    echo 'echo "};" >> $CONFIG_FILE' >> /docker-entrypoint.d/40-generate-config.sh && \
    chmod +x /docker-entrypoint.d/40-generate-config.sh

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

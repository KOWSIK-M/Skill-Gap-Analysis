# Build stage
FROM node:18 AS build
WORKDIR /app

# Accept build-time environment variables
ARG VITE_BACKEND_URL
ARG VITE_SERVICE_URL

# Make them available to Vite
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SERVICE_URL=$VITE_SERVICE_URL

# copy package json first for caching
COPY package*.json ./
RUN npm ci

# copy rest
COPY . .

# build Vite production bundle
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Remove default nginx site
RUN rm -rf /etc/nginx/conf.d/default.conf

# Add custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

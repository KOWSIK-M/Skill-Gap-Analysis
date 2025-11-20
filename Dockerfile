# skill-gap-analysis/Dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app

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

COPY --from=build /app/dist /usr/share/nginx/html

# Optional: copy a custom nginx conf if you want (not required)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

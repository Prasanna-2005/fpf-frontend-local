# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Build output
COPY --from=build /app/dist /usr/share/nginx/html

# SSL folder (used only in prod)
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

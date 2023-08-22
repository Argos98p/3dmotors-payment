FROM node:16.17.1-alpine3.16 as build


# Set the working directory to /app
WORKDIR /usr/app
# Copy package.json and package-lock.json to the container
COPY package*.json ./
# Install dependencies
RUN npm install --force
# Copy the rest of the application code to the container
COPY . .
# Build the production version of the application
RUN npm run build



#COPY . /usr/app
#RUN npm ci --force
#RUN npm run build


FROM nginx:1.23.1-alpine
EXPOSE 80
COPY ./docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/build /usr/share/nginx/html/payment

CMD ["nginx", "-g", "daemon off;"]

FROM node:latest

WORKDIR /home/docter-backend

COPY . ./

RUN npm install

EXPOSE 8000

CMD [ "node", "app.js" ]


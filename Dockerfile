FROM node

RUN npm i -g babel-cli

COPY . /app

RUN cd /app && npm install

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

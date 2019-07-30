## orange chat backend

### install
- `git clone https://github.com/Board2675/orange-chat-backend`
- `cd` to directory
- `npm install`
- you will need to add a `.env` file to the root dir. this is how it should look:
	 ```
	 KEY=<your-private-key>
	 MONGO_URI=mongodb+srv://<the-database-uri-with-password>?retryWrites=true&w=majority
	 PORT=5000
	 ORIGIN=<the-frontend-url>
	```

### run
- `nodemon server.js`
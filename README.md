<div align="center">
  <h1>tech-trainer-server</h1>
  <strong> "One machine can do the work of fifty ordinary men. No machine can do the work of one extraordinary man." - Elbert Hubbard</strong>
</div>

### Getting Started

To run the server on your machine, you would need to do the following:

- `git clone https://github.com/Board2675/orange-chat-backend`
- `cd` to directory
- `npm install`
- You will need to add a `.env` file to the root dir.  It should look this:
	 ```
	 KEY=<your-private-key>
	 MONGO_URI=mongodb+srv://<the-database-uri-with-password>?retryWrites=true&w=majority
	 PORT=5000
	 ORIGIN=<the-frontend-url>
	```
	If you wish to use our `KEY` and `MONGO_URI` please contact me @zvikarp
- to run the server locally run `nodemon server.js`


### Want to Help?

So you want to contribute and make an impact, we are glad to hear it. :heart_eyes:
There are some [guidelines](https://github.com/zvikarp/tech-trainer-server/blob/master/CONTRIBUTING.md), if you have time to briefly read them - it would make it easier for everyone.

## License
The code is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
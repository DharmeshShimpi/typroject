# typroject

# project logs

1. tanuja built register, login and landing pages. also wrote landing.css and style.css in frontend folder. push date: 9/8/2026

2. //comments by Dharmesh
// in dev Access-Control-Allow-Origin: * is by default which means any frontend can access our backend. But during prod. we will restrict it to https://our-project-name.vercel.app
// code for it will be like this:
//app.use(cors({origin: 'https://our-project-name.vercel.app'}));
//this is basic browser level security. we should not only rely on this because anyone can use cURL or Postman to bypass CORS.
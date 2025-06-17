Queuing System docs
Written in HTML CSS ReactJs as frontend and NodeJs as backend
Uses mssql as database

this project uses REST API and follows symmetrical encryption for security 


steps to install:

first we need to install the dependencies so we need to navigate to our backend and frontend folders

open terminal 

from the root folder do: 
cd backend
npm install 

next is frontend

from the root folder do: 
cd frontend/queuing
npm install 

after installing the dependencies now we need to host our backend and frontend 
respectively navigate to the backend folder then do

node api.js

next is on the frontend/queuing
npm start 


if you want to build the project simply do

navigate to the frontend/queuing then do

npm run build
serve -s build
import express from 'express';
import morgan from 'morgan';
import cors from 'cors'

const app = express();

const PORT = 8080

//Middleware: Might need some of these
app.use(morgan("dev"));
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({extended: true}))

//routes...





app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

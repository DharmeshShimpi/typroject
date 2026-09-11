import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabaseClient.js' ;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: "Backend running"});
})

app.post('/api/auth/register', async(req, res) => {
    try{
    const {name, email, password, role, rollno} = req.body;

    // validation start
    if(!name || !email || !role || !password) {
        return res.status(400).json({
            success: false,
            message: 'All field (name, email, roll and password) are required.'
        });
    }

    if(role === 'student' && !rollno) {
        return res.status(400).json({
            success: false,
            message: 'Roll number is required for students.'
        });
    }
    // validation end

    // supabase create user
    const {data, error} = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
                role: role,
                rollno: rollno || null
            }
        }
    });

    //supabase error on create user if any
    if(error) {
        return res.status(400).json({
            message: error.message
        });
    }

    //success message from supabase if registration is successful
    return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        user: data.user
    });

    } catch (err) {
        console.error('Server error', err);
        return res.status(500).json({
            success:false,
            message: 'Internal server error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
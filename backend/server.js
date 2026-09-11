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


// register user
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

//user login
app.post('/api/auth/login', async (req,res) => {
    try {
        const {email, password} = req.body;

        //validation
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        const{data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if(error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login Success!',
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name,
                role: data.user.user_metadata?.role,
                rollno: data.user.user_metadata?.rollno
            }
        });
    } catch(err) {
        console.error('Login error', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
    });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
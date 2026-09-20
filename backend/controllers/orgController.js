import { supabase } from '../supabaseClient.js';

// generate random 4 digit number

const generateJoinCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};  // explanation:

// we strictly need a 4 digit code (here between 1000 and 9999). It can't be 3 digit or 2 digit. Strictly 4 digit so..
// 1. Math.random(): this always gives a random decimal number between 0 (inclusive, means the number could be 0) to 1 (exclusive, means the number could not be 1, it could be something like 0.9999). example: 0.0000.... (from smallest value like 0), to 0.9999... (largest possible value, but not 1).
// 2. why multiply with 9000?
// see, lowest value: 0*9000 = 0 (still zero)
// highest value: 0.9999... * 9000 = approx ~ 8999.99
// so now the range is 0 to 8999.99
// 3. we add 1000 to it. 1000 + Math.random() * 9000
// now lowsest value = 1000 + 0 = 1000
// Highest value = 8999.99 = 9999.99
// 4. Math.floor() removes all decimals and gives whole number.
// eg. Math.floor(9999.99) = 9999
//Hence now it's guranteed to be a 4 digit number between 1000 to 9999
// .toString() convert number to string: 3443 to "3443" because datatype in our db for code is text not numberic. becase we're not performing any arithematic operations on this code. String makes it wasy to store in db.

//create organization into supabase

export const createOrganization = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { name, description, department, academicYear, minMembers, maxMembers } = req.body;

        // validation
        if(!name || !description || !department || !academicYear || !minMembers || !maxMembers) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields"
            });
        }

        // generate join code 4 digit!
        const joinCode = generateJoinCode();

        // insert into supabase database
        const { data, error } = await supabase.from('organizations').insert([{
            teacher_id: teacherId,
            name: name.trim(),
            description: description.trim(),
            department: department,
            academic_year: academicYear,
            min_members: Number(minMembers), // because HTML sen values as text strings. eg "2"
            max_members: Number(maxMembers),
            join_code: joinCode
        }]).select().single() // .select() returns the newly created roganization details and .single() unpacks it from list [] to object {} because supabase sends the data as list [{...}]

        if(error) {
            console.error("Supabase insert error:", error);
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization: data
        });


    } catch (err) {
        console.error("Create organization error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
};

// get organizations from supabase

export const getMyOrganizations = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // calling supabase here...
        const { data, error } = await 
        supabase // the keyword supabase gives up to call it
        .from('organizations') // selecting the table
        .select('*') // selecting all rows
        .eq('teacher_id', teacherId) // adding some condition
        .order('created_at', {ascending: false}); // order by latest first

        if(error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            organizations: data
        });
    } catch (err) {
        console.error("Get organizations error:", err);
        return res.status(500).json({
            success: false,
            message: "Intsernal server error"
        });
        
    }
};


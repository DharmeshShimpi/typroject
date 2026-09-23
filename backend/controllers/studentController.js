import { supabase } from '../supabaseClient.js';

//1. join organization using join code
export const joinOrganization = async (req, res) => {
    try {
        const studentId = req.user.id;//login id from auth middleware
        const { orgCode } = req.body;//code by student
        const normalizedOrgCode = String(orgCode).trim();//clean input
        if (!orgCode) {//validate for code not entered
            return res.status(400).json({
                success: false,
                message: "Organization code is required"
            });
        }
        //only student can join
        if (req.user.user_metadata?.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: "Only students can join organizations"
            });
        }
        //look organization by join_code
        const { data: organization, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('join_code', normalizedOrgCode)
            .maybeSingle();
        if (orgError) {
            return res.status(400).json({
                success: false,
                message: orgError.message
            });
        }
        //if no found any organization match
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }
        //check whether student is already in organization
        const { data: existingMembership, error: memberCheckError } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', organization.id)
            .eq('student_id', studentId)
            .maybeSingle();
        if (memberCheckError) {
            return res.status(400).json({
                success: false,
                message: memberCheckError.message
            });
        }
        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this organization"
            });
        }
        //check max member limit
        const { count, error: countError } = await supabase
            .from('organization_members')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organization.id);
        if (countError) {
            return res.status(400).json({
                success: false,
                message: countError.message
            });
        }
        if (count >= organization.max_members) {
            return res.status(400).json({
                success: false,
                message: "Organization has reached its maximum member limit"
            });
        }
        //insert student into organization member table
        const { data: membership, error: insertError } = await supabase
            .from('organization_members')
            .insert([{
                organization_id: organization.id,
                student_id: studentId
            }])
            .select()
            .single();
        if (insertError) {
            return res.status(400).json({
                success: false,
                message: insertError.message
            });
        }
        //return success res
        return res.status(200).json({
            success: true,
            message: "Successfully joined the organization",
            organization: organization,
            membership: membership
        });
    } catch (err) {
        console.error("Join organization error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
//2. show all organization joined by currrent student
export const getMyOrganizations = async (req, res) => {
    try {
        const { data: memberships, error } = await supabase
            .from('organization_members')
            .select(`id,joined_at,organizations(id,name,description,department,academic_year,join_code)`)
            .eq('student_id', req.user.id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        //convert result into clean array
        const organizations = memberships.map((membership) => ({
            ...membership.organizations,
            joined_at: membership.joined_at
        }));
        return res.status(200).json({
            success: true,
            organizations
        });

    } catch (error) {
        console.error("get organization error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });

    }
};
export const createGroup = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { organization_id, name, max_members } = req.body;
        if (!organization_id || !name || !name.trim()) {//validate fields
            return res.status(400).json({
                success: false,
                message: "Organization ID and group name are required"
            });
        }
        //chck student is member of this organization
        const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', organization_id)
            .eq('student_id', student_id)
            .maybeSingle();
        if (membershipError) {
            return res.status(400).json({
                success: false,
                message: membershipError.message
            });
        }
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "You must join the organization"
            });
        }
        //create group in organization
        const { data: group, error: groupError } = await supabase
            .from('student_groups')
            .insert([{
                organization_id: organization_id,
                name: name.trim(),
                created_by: student_id,
                max_members: max_members || null
            }])
            .select().single();
        if (groupError) {
            return res.status(400).json({
                success: false,
                message: groupError.message
            });
        }
        //add creator as first member of group
        const { error: memberError } = await supabase
            .from('group_members').insert([{
                group_id: group.id,
                student_id: student_id
            }]);
        if (memberError) {
            return res.status(400).json({
                success: false,
                message: memberError.message
            });
        }
        return res.status(201).json({
            success: true,
            message: "group created successfully",
            group
        });

    } catch (error) {
        console.error("create group error:", error);
        return res.status(500).json({
            success: false,
            message: "internal server error"
        });
    }
};
//show full details of one organization for student
export const getOrganizationDetails = async (req, res) => {

    try {
        const studentId = req.user.id;
        const { organizationId } = req.params;
        if (!organizationId) {//validate organizaion id exists
            return res.status(400).json({
                success: false,
                message: "Organization id is required"
            });
        }
        //check loggin user student is member of this organization
        const { data: membership, error: membershipError } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('student_id', studentId)
            .maybeSingle();
        if (membershipError) {
            return res.status(400).json({
                success: false,
                message: membershipError.message
            });
        }
        //if student not member of organization
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "you are not member of this organization"
            });
        }
        //fetch organization details
        const { data: organization, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();
        if (orgError) {
            return res.status(404).json({
                success: false,
                message: orgError.message
            });
        }
        //fetch alll member in this organiztion
        const { data: members, error: memberError } = await supabase
            .from('organization_members')
            .select('student_id,joined_at')
            .eq('organization_id', organizationId);
        if (memberError) {
            return res.status(404).json({
                seccess: false,
                message: memberError.message
            });
        }
        return res.status(200).json({
            success: true,
            organization,
            members
        });
    }
    catch (error) {
        console.error("get organization details error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error "
        });
    }
};
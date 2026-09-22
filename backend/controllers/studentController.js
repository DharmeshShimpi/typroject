import { supabase } from '../supabaseClient.js';

// join organization using join code
export const joinOrganization = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { orgCode } = req.body;
        const normalizedOrgCode = String(orgCode).trim();
        if (!orgCode) {
            return res.status(400).json({
                success: false,
                message: "Organization code is required"
            });
        }

        if (req.user.user_metadata?.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: "Only students can join organizations"
            });
        }

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
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }
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
export const getMyOrganizations = async (req, res) => {
    try {
        const { data: memberships, error } = await supabase.from('organization_members').select(`id,joined_at,organizations(id,name,description,department,academic_year,join_code)`)
            .eq('student_id', req.user.id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
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
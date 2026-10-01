import { supabase } from '../supabaseClient.js';

export const joinOrganization = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { orgCode } = req.body;
        const normalizedOrgCode = String(orgCode)
        if (!orgCode) {
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
        const { organization_id, project_title, name, group_name, description } = req.body;
        const finalGroupName = (name || group_name || '').trim();
        const finalProjectTitle = (project_title || '').trim();

        if (!organization_id || !finalProjectTitle || !finalGroupName) {
            return res.status(400).json({
                success: false,
                message: "Organization ID, project title, and group name are required"
            });
        }

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

        // check if student has already created a group in this organization
        const { data: existingGroup, error: existingGroupError } = await supabase
            .from('student_groups')
            .select('id')
            .eq('organization_id', organization_id)
            .eq('created_by', student_id)
            .maybeSingle();

        if (existingGroupError) {
            return res.status(400).json({
                success: false,
                message: existingGroupError.message
            });
        }
        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: "You have already created a project in this organization"
            });
        }
 
        const { data: group, error: groupError } = await supabase
            .from('student_groups')
            .insert([{
                organization_id: organization_id,
                name: finalGroupName,
                project_title: finalProjectTitle,
                description: description ? description.trim() : null,
                created_by: student_id
            }])
            .select().single();
        if (groupError) {
            return res.status(400).json({
                success: false,
                message: groupError.message
            });
        }
 
        // add leader to group_members table
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
            message: "Project created successfully",
            group,
            isLeader: true,
            members: [{
                id: student_id,
                name: req.user.user_metadata?.name || 'Student',
                rollno: req.user.user_metadata?.rollno || '',
                isLeader: true
            }]
        });

    } catch (error) {
        console.error("create group error:", error);
        return res.status(500).json({
            success: false,
            message: "internal server error"
        });
    }
};

export const getMyProject = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { organizationId } = req.params;

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID is required"
            });
        }

        const { data: group, error: groupError } = await supabase
            .from('student_groups')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('created_by', student_id)
            .maybeSingle();

        if (groupError) {
            return res.status(400).json({
                success: false,
                message: groupError.message
            });
        }

        if (group) {
            const { data: memberRows } = await supabase
                .from('group_members')
                .select('student_id')
                .eq('group_id', group.id);

            let members = [];
            if (memberRows && memberRows.length > 0) {
                const studentIds = memberRows.map(m => m.student_id);
                const { data: profiles } = await supabase
                    .from('student_profiles')
                    .select('id, name, rollno')
                    .in('id', studentIds);

                members = (profiles || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    rollno: p.rollno,
                    isLeader: p.id === group.created_by
                }));
            } else {
                members = [{
                    id: student_id,
                    name: req.user.user_metadata?.name || 'Student',
                    rollno: req.user.user_metadata?.rollno || '',
                    isLeader: true
                }];
            }

            return res.status(200).json({
                success: true,
                hasProject: true,
                project: group,
                isLeader: true,
                members
            });
        }

        return res.status(200).json({
            success: true,
            hasProject: false,
            project: null
        });

    } catch (error) {
        console.error("get my project error:", error);
        return res.status(500).json({
            success: false,
            message: "internal server error"
        });
    }
};

export const getOrganizationDetails = async (req, res) => {

    try {
        const studentId = req.user.id;
        const { organizationId } = req.params;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization id is required"
            });
        }
  
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
   
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: "you are not member of this organization"
            });
        }
   
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
    
        const { data: members, error: memberError } = await supabase
            .from('organization_members')
            .select('student_id,joined_at')
            .eq('organization_id', organizationId);
        if (memberError) {
            return res.status(404).json({
                success: false,
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
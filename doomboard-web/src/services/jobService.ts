import { supabase } from "./supabase";
import type { Job } from "@/types";

export const getCollectedJobs = async () => {
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .in("status", ["collected", "processing", "finalized", "error"])
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Job[];
};

export const getTrashJobs = async () => {
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_deleted", true)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Job[];
};

export const getDashboardJobs = async () => {
    const { data, error } = await supabase
        .from("jobs")
        .select("*, resumes(name, file_url, created_at)")
        .not("status", "in", "('collected','processing','finalized','error')")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as (Job & { resumes: { name: string; file_url: string; created_at: string } | null })[];
};

export const updateJobStatus = async (id: string, status: string) => {
    const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", id);

    if (error) throw error;
};

export const softDeleteJob = async (id: string) => {
    const { error } = await supabase
        .from("jobs")
        .update({ is_deleted: true })
        .eq("id", id);

    if (error) throw error;
};

export const restoreJob = async (id: string) => {
    const { error } = await supabase
        .from("jobs")
        .update({ is_deleted: false })
        .eq("id", id);

    if (error) throw error;
};

export const deleteJobForever = async (id: string) => {
    const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

    if (error) throw error;
};

export const applyJob = async (id: string, resumeId: string) => {
    const { error } = await supabase
        .from("jobs")
        .update({
            status: 'applied',
            resume_used_id: resumeId
        })
        .eq("id", id);

    if (error) throw error;
};

export const updateJobNotes = async (id: string, notes: string) => {
    const { error } = await supabase
        .from("jobs")
        .update({ notes })
        .eq("id", id);

    if (error) throw error;
};

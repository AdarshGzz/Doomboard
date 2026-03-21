import { supabase } from "./supabase";
import type { Resume } from "@/types";

export const getResumes = async () => {
    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Resume[];
};

export const uploadResume = async (file: File, name: string) => {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Create record in resumes table
    const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            name,
            file_url: publicUrlData.publicUrl
        })
        .select()
        .single();

    if (error) throw error;
    return data as Resume;
};

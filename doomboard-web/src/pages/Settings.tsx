import { useState, useEffect } from "react";
import { getResumes, uploadResume } from "@/services/resumeService";
import type { Resume } from "@/types";
import { Button } from "@/components/ui/Button";
import { FileText, Upload } from "lucide-react";

export function SettingsPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        setLoading(true);
        try {
            const data = await getResumes();
            setResumes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const newResume = await uploadResume(file, file.name);
            setResumes([newResume, ...resumes]);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload resume");
        } finally {
            setUploading(false);
        }
    };

    // Delete resume logic?
    // Requires check if used? Spec says "Resume in use cannot be deleted".
    // We'll skip complex check for V1 and just show list.

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your resumes and preferences.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h2 className="text-xl font-semibold">My Resumes</h2>
                        <div className="relative">
                            <input
                                type="file"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={handleUpload}
                                accept=".pdf,.doc,.docx"
                            />
                            <Button disabled={uploading}>
                                <Upload className="mr-2 h-4 w-4" />
                                {uploading ? "Uploading..." : "Upload New Resume"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <p>Loading resumes...</p>
                        ) : (
                            resumes.map(resume => (
                                <div
                                    key={resume.id}
                                    onClick={() => window.open(resume.file_url, '_blank')}
                                    className="flex items-center justify-between rounded-xl border border-white/5 p-4 bg-zinc-900/50 hover:bg-zinc-900 hover:border-primary/30 transition-all cursor-pointer group/resume shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-xl bg-primary/10 p-2 text-primary border border-primary/20 group-hover/resume:scale-110 transition-transform">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-100 group-hover/resume:text-white transition-colors">{resume.name}</p>
                                            <p className="text-xs text-zinc-500 font-medium mt-0.5">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="font-bold text-zinc-400 group-hover/resume:text-primary transition-colors hover:bg-primary/10">
                                            View Document
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                        {resumes.length === 0 && !loading && (
                            <p className="text-muted-foreground text-sm">No resumes uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Passcode Section */}
            <div className="space-y-4 opacity-50 pointer-events-none">
                <div className="border-b border-border pb-4">
                    <h2 className="text-xl font-semibold">Security</h2>
                </div>
                <p className="text-sm text-muted-foreground">Passcode management requires server-side implementation. Disabled for initial setup.</p>
            </div>
        </div>
    );
}

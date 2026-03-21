import { useState, useEffect } from "react";
import { X, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getResumes, uploadResume } from "@/services/resumeService";
import type { Resume } from "@/types";
import { cn } from "@/lib/utils";

interface ResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (resumeId: string) => Promise<void>;
}

export function ResumeModal({ isOpen, onClose, onConfirm }: ResumeModalProps) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadResumes();
        }
    }, [isOpen]);

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
            // Immediately update list and select the new one
            setResumes(prev => [newResume, ...prev]);
            setSelectedId(newResume.id);
        } catch (err: any) {
            console.error("Upload failed", err);
            alert(`Upload failed: ${err.message || "Unknown error"}`);
        } finally {
            setUploading(false);
            // Reset input so same file can be uploaded again if needed
            e.target.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!selectedId) return;
        setLoading(true);
        try {
            await onConfirm(selectedId);
            onClose();
        } catch (err) {
            console.error("Confirm failed", err);
            alert("Failed to confirm application");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Select Resume</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select the resume you used for this application.</p>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                className={cn(
                                    "flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer transition-colors hover:bg-muted",
                                    selectedId === resume.id && "border-primary bg-muted"
                                )}
                                onClick={() => setSelectedId(resume.id)}
                            >
                                <div className={cn("h-4 w-4 rounded-full border border-primary", selectedId === resume.id ? "bg-primary" : "bg-transparent")} />
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium">{resume.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(resume.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(resume.file_url, '_blank');
                                    }}
                                    className="p-2 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-all group/preview"
                                    title="Preview in new tab"
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {resumes.length === 0 && !loading && (
                            <p className="text-center text-sm text-muted-foreground py-4">No resumes found.</p>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={handleUpload}
                            accept=".pdf,.doc,.docx"
                        />
                        <Button variant="outline" className="w-full" disabled={uploading}>
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Uploading..." : "Upload New Resume"}
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selectedId || loading}>
                        {loading ? "Confirming..." : "Confirm & Apply"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

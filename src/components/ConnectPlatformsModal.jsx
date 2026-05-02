import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";  // assuming this exists or use Input for now
import api from "../lib/api";
import { PlatformLogo } from "./PlatformLogo";
import { Plus, Trash2, Briefcase, Code, User, Share2 } from "lucide-react";

export const ConnectPlatformsModal = ({ isOpen, onClose, user, onUpdate, onSync }) => {
    const [activeTab, setActiveTab] = useState("general");
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        handles: {},
        work: [],
        projects: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                bio: user.bio || "",
                handles: user.handles || {},
                work: user.work || [],
                projects: user.projects || []
            });
        }
    }, [user, isOpen]);

    const platforms = ["leetcode", "codeforces", "codechef", "gfg", "hackerrank", "atcoder", "hackerearth", "spoj", "github"];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleHandleChange = (platform, value) => {
        // Helper to extract username from URL if user pastes a link
        let cleanValue = value.trim();
        if (cleanValue.includes("http") || cleanValue.includes("www.")) {
            try {
                const url = new URL(cleanValue.startsWith("http") ? cleanValue : `https://${cleanValue}`);
                const pathParts = url.pathname.split("/").filter(p => p);

                // Common patterns:
                // leetcode.com/u/username or leetcode.com/username
                // codeforces.com/profile/username
                // codechef.com/users/username
                // geeksforgeeks.org/user/username
                // hackerrank.com/profile/username
                // github.com/username

                if (platform === "leetcode") {
                    if (pathParts[0] === "u") cleanValue = pathParts[1];
                    else cleanValue = pathParts[0];
                } else if (platform === "codeforces") {
                    if (pathParts[0] === "profile") cleanValue = pathParts[1];
                } else if (platform === "codechef") {
                    if (pathParts[0] === "users") cleanValue = pathParts[1];
                    else cleanValue = pathParts[0]; // fallback
                } else if (platform === "gfg") {
                    if (pathParts[0] === "user") cleanValue = pathParts[1];
                } else if (platform === "hackerrank") {
                    if (pathParts[0] === "profile") cleanValue = pathParts[1];
                    else cleanValue = pathParts[0]; // fallback (often /username directly works or is default)
                } else if (platform === "atcoder") {
                    if (pathParts[0] === "users") cleanValue = pathParts[1];
                } else if (platform === "github") {
                    cleanValue = pathParts[0];
                } else {
                    // Generic fallback: take the last part of path
                    cleanValue = pathParts[pathParts.length - 1];
                }
            } catch (e) {
                // If URL parsing fails, keep original value (might be just a username with special chars)
            }
        }

        setFormData(prev => ({ ...prev, handles: { ...prev.handles, [platform]: cleanValue } }));
    };

    // Work Experience Helpers
    const addWork = () => {
        setFormData(prev => ({ ...prev, work: [...prev.work, { company: "", role: "", dateRange: "", description: "" }] }));
    };
    const removeWork = (index) => {
        setFormData(prev => ({ ...prev, work: prev.work.filter((_, i) => i !== index) }));
    };
    const updateWork = (index, field, value) => {
        const newWork = [...formData.work];
        newWork[index][field] = value;
        setFormData(prev => ({ ...prev, work: newWork }));
    };

    // Project Helpers
    const addProject = () => {
        setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: "", description: "", techStack: [], link: "" }] }));
    };
    const removeProject = (index) => {
        setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
    };
    const updateProject = (index, field, value) => {
        const newProjects = [...formData.projects];
        if (field === "techStack") {
            newProjects[index][field] = value.split(",").map(t => t.trim());
        } else {
            newProjects[index][field] = value;
        }
        setFormData(prev => ({ ...prev, projects: newProjects }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data } = await api.put("/users/profile", formData);
            onUpdate(data.user);

            // Automatically sync stats if handles were updated
            if (onSync) {
                // Show some feedback or just wait? user will see loading on profile
                await onSync();
            }

            onClose();
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === id ? "bg-purple-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5"}`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto border-slate-800 bg-slate-950/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Edit Profile</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Update your personal details and connections.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4 border-b border-black/5 dark:border-white/5 pb-2 overflow-x-auto">
                    <TabButton id="general" label="General" icon={User} />
                    <TabButton id="platforms" label="Platforms" icon={Share2} />
                    <TabButton id="work" label="Experience" icon={Briefcase} />
                    <TabButton id="projects" label="Projects" icon={Code} />
                </div>

                <div className="py-4 space-y-6">
                    {activeTab === "general" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="bg-slate-900 border-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleChange("bio", e.target.value)}
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "platforms" && (
                        <div className="grid gap-4">
                            {platforms.map((platform) => (
                                <div key={platform} className="grid grid-cols-4 items-center gap-4">
                                    <div className="flex items-center gap-2 col-span-1">
                                        <PlatformLogo platform={platform} className="h-5 w-5" />
                                        <span className="capitalize text-slate-700 dark:text-slate-300 text-sm">{platform}</span>
                                    </div>
                                    <Input
                                        placeholder={`${platform} username`}
                                        className="col-span-3 bg-slate-900 border-slate-800 text-slate-900 dark:text-white"
                                        value={formData.handles[platform] || ""}
                                        onChange={(e) => handleHandleChange(platform, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "work" && (
                        <div className="space-y-4">
                            {formData.work.map((job, index) => (
                                <div key={index} className="p-4 rounded-lg bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-3 relative group">
                                    <button onClick={() => removeWork(index)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="Company" value={job.company} onChange={(e) => updateWork(index, "company", e.target.value)} className="bg-slate-950 border-slate-800" />
                                        <Input placeholder="Role" value={job.role} onChange={(e) => updateWork(index, "role", e.target.value)} className="bg-slate-950 border-slate-800" />
                                    </div>
                                    <Input placeholder="Date Range (e.g. 2022 - Present)" value={job.dateRange} onChange={(e) => updateWork(index, "dateRange", e.target.value)} className="bg-slate-950 border-slate-800" />
                                    <textarea placeholder="Description" value={job.description} onChange={(e) => updateWork(index, "description", e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-900 dark:text-white" />
                                </div>
                            ))}
                            <Button onClick={addWork} variant="outline" className="w-full border-dashed border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-800">
                                <Plus className="h-4 w-4 mr-2" /> Add Experience
                            </Button>
                        </div>
                    )}

                    {activeTab === "projects" && (
                        <div className="space-y-4">
                            {formData.projects.map((proj, index) => (
                                <div key={index} className="p-4 rounded-lg bg-slate-900/50 border border-black/5 dark:border-white/5 space-y-3 relative group">
                                    <button onClick={() => removeProject(index)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(index, "title", e.target.value)} className="bg-slate-950 border-slate-800" />
                                        <Input placeholder="Link (e.g. GitHub/Live)" value={proj.link} onChange={(e) => updateProject(index, "link", e.target.value)} className="bg-slate-950 border-slate-800" />
                                    </div>
                                    <Input placeholder="Tech Stack (comma separated)" value={proj.techStack ? proj.techStack.join(", ") : ""} onChange={(e) => updateProject(index, "techStack", e.target.value)} className="bg-slate-950 border-slate-800" />
                                    <textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(index, "description", e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-900 dark:text-white" />
                                </div>
                            ))}
                            <Button onClick={addProject} variant="outline" className="w-full border-dashed border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-800">
                                <Plus className="h-4 w-4 mr-2" /> Add Project
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

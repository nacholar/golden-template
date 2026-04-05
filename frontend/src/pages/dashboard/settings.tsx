import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GithubIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/auth/update-user", { name });
      await refresh();
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" />

      {/* Profile Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-4">Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-slate-800 text-slate-300 text-xl">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white max-w-md"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Email</label>
            <Input
              value={user?.email ?? ""}
              disabled
              className="bg-slate-950 border-slate-700 text-slate-400 max-w-md"
            />
          </div>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Connected Accounts */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-4">
          Connected Accounts
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GithubIcon className="w-5 h-5 text-slate-300" />
            <div>
              <p className="text-white text-sm font-medium">GitHub</p>
              <p className="text-slate-400 text-xs">Not connected</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-200"
          >
            Connect
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <h3 className="text-white font-semibold text-lg mb-2">Danger Zone</h3>
        <p className="text-slate-300 text-sm mb-4">
          Permanently delete your account and all data.
        </p>
        <Button
          className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
          onClick={() => setDeleteOpen(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Account</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action is irreversible. All your data, API keys, and
              subscription will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

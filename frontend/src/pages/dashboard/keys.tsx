import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, ShieldAlert, Copy, Check, Plus } from "lucide-react";
import { useApiKeys } from "@/hooks/use-api-keys";
import { timeAgo } from "@/lib/utils";
import type { CreatedKey } from "@/lib/types";

export default function KeysPage() {
  const { keys, loading, error, createKey, revokeKey } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setActionError(null);
    try {
      const result = await createKey(newKeyName);
      setCreatedKey(result);
      setCreateOpen(false);
      setNewKeyName("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    setActionError(null);
    try {
      await revokeKey(revokeId);
      setRevokeId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to revoke key");
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <PageHeader title="API Keys">
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </PageHeader>

      {/* Security banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-400 text-sm">
          Keep your API keys secure. They grant full access to your account. Do
          not share them in public repositories.
        </p>
      </div>

      {(error || actionError) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {actionError || error}
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800 rounded" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-12 text-center">
          <Key className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium">No API keys yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">
            Create your first key to start making requests
          </p>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => setCreateOpen(true)}
          >
            Create API Key
          </Button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Key</TableHead>
                <TableHead className="text-slate-400">Last Used</TableHead>
                <TableHead className="text-slate-400 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">
                    {key.name}
                  </TableCell>
                  <TableCell className="font-mono text-slate-300 text-sm">
                    {key.keyPrefix}...
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {timeAgo(key.lastUsedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => setRevokeId(key.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Give your key a name to identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-slate-200 block mb-1.5">
                Key Name
              </label>
              <Input
                placeholder="e.g., Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
            >
              {creating ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Key Created Success Dialog */}
      <Dialog
        open={!!createdKey}
        onOpenChange={() => {
          setCreatedKey(null);
          setCopied(false);
        }}
      >
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">API Key Created</DialogTitle>
            <DialogDescription className="text-slate-400">
              Copy your key now — it won't be shown again.
            </DialogDescription>
          </DialogHeader>
          {createdKey && (
            <div
              className="bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-sm text-emerald-300 flex items-center justify-between gap-2 cursor-pointer"
              onClick={handleCopyKey}
            >
              <span className="truncate">{createdKey.key}</span>
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => {
                setCreatedKey(null);
                setCopied(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Revoke API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will immediately invalidate the key. Any requests using it
              will fail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200"
              onClick={() => setRevokeId(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleRevoke}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * SpawnStandaloneDialog — minimal dialog for launching a Standalone Session.
 *
 * A standalone session shares the same agent identity as the parent but runs
 * in an isolated context with no completion report injected back to the root.
 *
 * Deliberately kept simple: task + label only. Model/thinking/cleanup inherit
 * from the root; cleanup is intentionally absent (silent + delete unsupported).
 *
 * NOTE: This file is intentionally separate from SpawnAgentDialog.tsx so that
 * upstream merges to the existing dialog don't conflict with our additions.
 */
import { useState, useCallback, useEffect } from 'react';
import { Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSessionContext, type SpawnSessionOpts } from '@/contexts/SessionContext';
import { getSessionKey } from '@/types';
import {
  getRootAgentSessionKey,
  getSessionDisplayLabel,
  getTopLevelAgentSessions,
} from './sessionKeys';

interface SpawnStandaloneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSpawn: (opts: SpawnSessionOpts) => Promise<void | boolean>;
}

/** Minimal spawn dialog for standalone sessions (isolated context, no parent report). */
export function SpawnStandaloneDialog({ open, onOpenChange, onSpawn }: SpawnStandaloneDialogProps) {
  const { sessions, currentSession, agentName: defaultAgentName } = useSessionContext();

  const [task, setTask] = useState('');
  const [label, setLabel] = useState('');
  const [selectedParentKey, setSelectedParentKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rootSessions = getTopLevelAgentSessions(sessions);

  // Default parent to the root that owns the current session (or first root).
  useEffect(() => {
    if (!open) return;
    const currentRoot = getRootAgentSessionKey(currentSession);
    if (currentRoot) {
      setSelectedParentKey(currentRoot);
    } else if (rootSessions.length > 0) {
      setSelectedParentKey(getSessionKey(rootSessions[0]));
    }
  }, [open, currentSession, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = useCallback(() => {
    setTask('');
    setLabel('');
    setError(null);
    setSubmitting(false);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  }, [onOpenChange, resetForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setError('Task is required.');
      return;
    }
    if (!selectedParentKey) {
      setError('No parent agent found. Create a top-level agent first.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSpawn({
        kind: 'standalone',
        task: trimmedTask,
        label: label.trim() || undefined,
        parentSessionKey: selectedParentKey,
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spawn standalone session.');
      setSubmitting(false);
    }
  }, [task, label, selectedParentKey, onSpawn, resetForm, onOpenChange]);

  const showParentSelect = rootSessions.length > 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-info font-mono text-sm tracking-wider uppercase flex items-center gap-2">
            <Layers size={16} aria-hidden="true" />
            New standalone session
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Same agent identity as the parent. Isolated context. No reports back to the parent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Task */}
          <div className="flex flex-col gap-1">
            <label htmlFor="standalone-task" className="text-[0.733rem] text-muted-foreground uppercase tracking-wider">
              Task <span className="text-red">*</span>
            </label>
            <textarea
              id="standalone-task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What should this session do?"
              rows={3}
              disabled={submitting}
              className="bg-background border border-border/60 text-foreground text-xs font-mono px-3 py-2 resize-none focus:outline-none focus:border-info/60 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Label */}
          <div className="flex flex-col gap-1">
            <label htmlFor="standalone-label" className="text-[0.733rem] text-muted-foreground uppercase tracking-wider">
              Label <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              id="standalone-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Display name in the panel"
              disabled={submitting}
              className="bg-background border border-border/60 text-foreground text-xs font-mono px-3 py-2 focus:outline-none focus:border-info/60 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Parent selector — only shown when multiple root agents exist */}
          {showParentSelect && (
            <div className="flex flex-col gap-1">
              <label htmlFor="standalone-parent" className="text-[0.733rem] text-muted-foreground uppercase tracking-wider">
                Parent agent
              </label>
              <select
                id="standalone-parent"
                value={selectedParentKey}
                onChange={(e) => setSelectedParentKey(e.target.value)}
                disabled={submitting}
                className="bg-background border border-border/60 text-foreground text-xs font-mono px-3 py-2 focus:outline-none focus:border-info/60"
              >
                {rootSessions.map((s) => {
                  const key = getSessionKey(s);
                  return (
                    <option key={key} value={key}>
                      {getSessionDisplayLabel(s, defaultAgentName)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {error && (
            <p className="text-red text-xs font-mono">{error}</p>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !task.trim()}
              className="font-mono text-xs bg-info text-background hover:bg-info/90"
            >
              {submitting ? 'Spawning…' : 'Spawn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

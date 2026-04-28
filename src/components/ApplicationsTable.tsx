import { useState } from 'react';
import type { TrialApplication } from '../services/types';

interface ApplicationsTableProps {
  rows: TrialApplication[];
  onTogglePaid: (app: TrialApplication, paid: boolean) => Promise<void>;
  onDelete: (applicationIds: string[]) => Promise<void>;
  deleting?: boolean;
}

const getPlayer = (app: TrialApplication) => {
  if (!app.player) return null;
  return Array.isArray(app.player) ? app.player[0] : app.player;
};

const formatDob = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  const date = typeof value === 'number' ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-surface p-6 shadow-2xl">
        <h3 className="mb-2 font-kashafBold text-xl text-white">{title}</h3>
        <p className="mb-6 text-subtle">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-white transition hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-error px-4 py-2.5 font-kashafBold text-white transition hover:opacity-90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsTable({ rows, onTogglePaid, onDelete, deleting = false }: ApplicationsTableProps) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleToggle = async (app: TrialApplication, paid: boolean) => {
    setPendingIds((prev) => new Set(prev).add(app.objectId));
    try {
      await onTogglePaid(app, paid);
    } catch (e) {
      console.error('Failed to update payment status', e);
    } finally {
      setPendingIds((prev) => { const s = new Set(prev); s.delete(app.objectId); return s; });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.objectId)));
    }
  };

  const openDeleteConfirm = (ids: string[], title: string, message: string) => {
    setIdsToDelete(ids);
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (idsToDelete.length === 0) return;
    try {
      await onDelete(idsToDelete);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });
    } catch (e) {
      console.error('Failed to delete applications', e);
    }
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < rows.length;

  const headerCheckboxClass = someSelected
    ? 'accent-primary indeterminate'
    : allSelected
      ? 'accent-primary'
      : 'accent-primary';

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-kashafBold text-xl text-white">Applied Players</h3>
        {selectedIds.size > 0 && (
          <button
            onClick={() =>
              openDeleteConfirm(
                Array.from(selectedIds),
                `Delete ${selectedIds.size} Application${selectedIds.size > 1 ? 's' : ''}`,
                `Are you sure you want to delete ${selectedIds.size} selected application${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`
              )
            }
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-kashafBold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="text-subtle">
              <th className="pb-3 pl-2">
                <input
                  type="checkbox"
                  className={`h-5 w-5 cursor-pointer ${headerCheckboxClass}`}
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={rows.length === 0}
                />
              </th>
              <th className="pb-3"></th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">DOB</th>
              <th className="pb-3">City</th>
              <th className="pb-3">Height</th>
              <th className="pb-3">Weight</th>
              <th className="pb-3">Foot</th>
              <th className="pb-3">Position</th>
              <th className="pb-3">Paid</th>
              <th className="pb-3 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((app) => {
              const player = getPlayer(app);
              const user = player?.user as { email?: string } | undefined;
              const isSelected = selectedIds.has(app.objectId);
              return (
                <tr
                  key={app.objectId}
                  className={`border-t border-white/10 transition ${isSelected ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                >
                  <td className="py-3 pl-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer accent-primary"
                      checked={isSelected}
                      onChange={() => toggleSelection(app.objectId)}
                    />
                  </td>
                  <td className="py-3">
                    {player?.profileImageUrl ? (
                      <img src={player.profileImageUrl} alt={player.fullName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-subtle">-</div>
                    )}
                  </td>
                  <td className="py-3">{player?.fullName || '-'}</td>
                  <td className="py-3">{user?.email || '-'}</td>
                  <td className="py-3">{formatDob(player?.dateOfBirth)}</td>
                  <td className="py-3">{player?.city || '-'}</td>
                  <td className="py-3">{player?.height || '-'}</td>
                  <td className="py-3">{player?.weight || '-'}</td>
                  <td className="py-3">{player?.preferredFoot || '-'}</td>
                  <td className="py-3">{player?.position || '-'}</td>
                  <td className="py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer accent-primary disabled:opacity-50"
                        checked={app.paymentStatus === 'paid'}
                        disabled={pendingIds.has(app.objectId)}
                        onChange={(e) => handleToggle(app, e.target.checked)}
                      />
                      <span className={app.paymentStatus === 'paid' ? 'text-primary' : 'text-subtle'}>
                        {app.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </label>
                  </td>
                  <td className="py-3 pr-2">
                    <button
                      onClick={() =>
                        openDeleteConfirm(
                          [app.objectId],
                          'Delete Application',
                          `Are you sure you want to delete the application for "${player?.fullName || 'Unknown'}"? This action cannot be undone.`
                        )
                      }
                      disabled={deleting}
                      className="rounded-lg p-2 text-subtle transition hover:bg-error/20 hover:text-error disabled:opacity-50"
                      title="Delete application"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}


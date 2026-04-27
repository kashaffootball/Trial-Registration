import { useState } from 'react';
import type { TrialApplication } from '../services/types';

interface ApplicationsTableProps {
  rows: TrialApplication[];
  onTogglePaid: (app: TrialApplication, paid: boolean) => Promise<void>;
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

export default function ApplicationsTable({ rows, onTogglePaid }: ApplicationsTableProps) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

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

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6">
      <h3 className="mb-4 font-kashafBold text-xl text-white">Applied Players</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="text-subtle">
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
            </tr>
          </thead>
          <tbody>
            {rows.map((app) => {
              const player = getPlayer(app);
              const user = player?.user as { email?: string } | undefined;
              return (
                <tr key={app.objectId} className="border-t border-white/10">
                  <td className="py-3">
                    {player?.profileImageUrl ? (
                      <img src={player.profileImageUrl} alt={player.fullName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      '-'
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

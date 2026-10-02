// Ticket 0107 - Shared-dossier import banner for /my dashboard.
//
// Dismissible banner that renders at the top of /my when the mount-time
// hydrator decoded a non-empty `#dossier=...` URL fragment. The banner
// names (a) how many artifacts were imported, (b) when the import
// happened (YYYY-MM-DD, same UTC format as the dossier download
// filename), and (c) two action buttons: "Keep imported data" (plain
// dismiss) and "Restore your own" (clear every imported key then
// refresh the dashboard).
//
// Styling mirrors the ticket 0045 dashboard-card shell: rounded-2xl,
// border, dark: variants on every color class. Copy is hyphen-only
// per the 2026-05-07 em-dash Hard NO. Em-dash grep in the spec scopes
// to this component's visible text, not every DOM node, so the
// homepage Organization JSON-LD's legitimate em-dash is not swept up
// (2026-09-08 lesson).

import React from 'react';
import { Link2, X } from 'lucide-react';

interface SharedDossierImportBannerProps {
  importedCount: number;
  importedOnUtcDate: string;
  onKeep: () => void;
  onRestore: () => void;
}

const SharedDossierImportBanner: React.FC<SharedDossierImportBannerProps> = ({
  importedCount,
  importedOnUtcDate,
  onKeep,
  onRestore,
}) => {
  const artifactsLabel = importedCount === 1 ? 'artifact' : 'artifacts';
  return (
    <section
      data-testid="dashboard-shared-link-import-banner"
      aria-labelledby="dashboard-shared-link-import-heading"
      className="rounded-2xl border border-primary/40 dark:border-primary/60 bg-primary/5 dark:bg-primary/10 p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
          <Link2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="dashboard-shared-link-import-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            This dashboard was imported from a shared link
          </h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {`${importedCount} ${artifactsLabel}, imported ${importedOnUtcDate}.`}
            {' '}
            Keep imported data or restore your own.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-testid="dashboard-shared-link-keep"
              onClick={onKeep}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <X size={16} />
              Keep imported data
            </button>
            <button
              type="button"
              data-testid="dashboard-shared-link-restore"
              onClick={onRestore}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary transition-colors"
            >
              Restore your own
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SharedDossierImportBanner;

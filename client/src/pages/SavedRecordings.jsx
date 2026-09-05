import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Loader2,
  MonitorPlay,
  PlayCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui";

import { API_URL } from "../config/api";
import { getToken } from "../utils/auth";

/*
 * Safe recording-URL check before ever mounting a <video>.
 * Only http(s) URLs are accepted; anything else is treated
 * as missing/unavailable so we never render a dead player.
 */
const isPlayableUrl = (url) => {
  if (typeof url !== "string") return false;

  const trimmed = url.trim();

  return (
    trimmed.length > 0 &&
    /^https?:\/\//i.test(trimmed)
  );
};

const formatDate = (value) => {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDuration = (seconds) => {
  if (
    !Number.isFinite(Number(seconds)) ||
    Number(seconds) <= 0
  ) {
    return "Duration not available";
  }

  const total = Math.round(Number(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

function SavedRecordings() {
  const token = useMemo(() => getToken(), []);

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeRecording, setActiveRecording] =
    useState(null);

  /* Delete-related state */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ==========================================================
     Fetch the authenticated user's saved recordings.
     The server derives the user from the JWT — the client
     never sends a userId for this endpoint.
     ========================================================== */
  const fetchRecordings = async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/recordings/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecordings(
        response.data?.recordings || []
      );
    } catch (err) {
      console.error(
        "Saved recordings load error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your recordings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectRecording = (recording) => {
    if (!isPlayableUrl(recording.recordingUrl)) {
      setError(
        "This recording is missing a valid video link and cannot be played."
      );

      setActiveRecording(null);
      return;
    }

    setError("");
    setActiveRecording(recording);
  };

  const closePlayer = () => {
    setActiveRecording(null);
    setError("");
  };

  /* ==========================================================
     Delete flow
     ========================================================== */
  const openDeleteDialog = (recording) => {
    setDeleteError("");
    setSuccessMessage("");
    setDeleteTarget(recording);
  };

  const closeDeleteDialog = () => {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const dismissSuccess = () => {
    setSuccessMessage("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !token || deletingId) return;

    const recordingId = deleteTarget._id;

    setDeletingId(recordingId);
    setDeleteError("");

    try {
      await axios.delete(
        `${API_URL}/api/recordings/${recordingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from the list immediately (no reload needed).
      setRecordings((prev) =>
        prev.filter((recording) => recording._id !== recordingId)
      );

      // Close the player if the deleted recording was selected.
      if (activeRecording?._id === recordingId) {
        setActiveRecording(null);
      }

      setDeleteTarget(null);
      setSuccessMessage("Recording deleted.");
    } catch (err) {
      console.error(
        "Delete recording error:",
        err.response?.data || err.message
      );

      // Keep the recording in the list so the user can retry.
      setDeleteError(
        err.response?.data?.message ||
          "Unable to delete this recording. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const deleteDialog = (
    <Dialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => {
        if (!open) closeDeleteDialog();
      }}
    >
      <DialogContent
        onClose={deletingId ? undefined : closeDeleteDialog}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Delete this recording?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <p className="mt-4 rounded-lg border border-[rgba(240,95,100,0.28)] bg-[rgba(240,95,100,0.09)] px-3 py-2 text-sm text-[var(--error)]">
            {deleteError}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={closeDeleteDialog}
            variant="secondary"
            disabled={Boolean(deletingId)}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="danger"
            disabled={Boolean(deletingId)}
          >
            {deletingId ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* ----------------------------------------------------------
     Loading state
     ---------------------------------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            Your learning library
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Saved Recordings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Recordings you saved during video study sessions.
          </p>
        </section>

        <LoadingState
          label="Loading your recordings..."
        />
      </div>
    );
  }

  /* ----------------------------------------------------------
     Error state
     ---------------------------------------------------------- */
  if (error && recordings.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            Your learning library
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Saved Recordings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Recordings you saved during video study sessions.
          </p>
        </section>

        <ErrorState
          title="Couldn't load your recordings"
          description={error}
          actionLabel="Retry"
          onAction={fetchRecordings}
        />
      </div>
    );
  }
/* ----------------------------------------------------------
     Player view (contained in this page only)
     ---------------------------------------------------------- */
  if (activeRecording) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            Playing recording
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {activeRecording.roomName || "Study Room"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            {formatDate(activeRecording.createdAt)} ·{" "}
            {formatDuration(activeRecording.duration)}
          </p>
        </section>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <video
              className="aspect-video w-full bg-black"
              controls
              preload="metadata"
              src={activeRecording.recordingUrl}
            >
              Your browser does not support video playback.
            </video>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0 text-sm text-[var(--text-secondary)]">
              <p className="truncate font-medium text-[var(--text-primary)]">
                {activeRecording.roomName || "Study Room"}
              </p>
              <p className="truncate text-xs">
                {activeRecording.fileName ||
                  "Session recording"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                aria-label="Delete this recording"
                onClick={() => openDeleteDialog(activeRecording)}
                variant="ghost"
                disabled={Boolean(deletingId)}
                className="text-[var(--error)] hover:bg-[rgba(240,95,100,0.1)] hover:text-[var(--error)]"
              >
                <Trash2 size={16} />
                Delete
              </Button>
              <Button
                onClick={closePlayer}
                variant="secondary"
              >
                <ChevronLeft size={16} />
                Back to recordings
              </Button>
            </div>
          </CardFooter>
        </Card>

        {deleteDialog}
      </div>
    );
  }

  /* ----------------------------------------------------------
     Empty state
     ---------------------------------------------------------- */
  if (recordings.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-8 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            Your learning library
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Saved Recordings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Recordings you saved during video study sessions.
          </p>
        </section>

        {successMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[rgba(40,199,111,0.28)] bg-[rgba(40,199,111,0.09)] px-4 py-3 text-sm text-[var(--success)]">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={dismissSuccess}
              className="shrink-0 font-semibold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        <EmptyState
          icon={MonitorPlay}
          title="No saved recordings yet"
          description="When you record a study session and save it, the recording will appear here so you can watch it again anytime."
        />

        {deleteDialog}
      </div>
    );
  }
/* ----------------------------------------------------------
     Recording list
     ---------------------------------------------------------- */
  return (
    <div className="mx-auto w-full max-w-[1200px] py-8 sm:py-10">
      <section className="mb-8 sm:mb-10">
        <p className="mb-2 text-sm font-medium text-[var(--accent)]">
          Your learning library
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Saved Recordings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
          Recordings you saved during video study sessions.
          Select a recording to watch it again.
        </p>
      </section>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[rgba(240,95,100,0.28)] bg-[rgba(240,95,100,0.09)] px-4 py-3 text-sm text-[var(--error)]">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-semibold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[rgba(40,199,111,0.28)] bg-[rgba(40,199,111,0.09)] px-4 py-3 text-sm text-[var(--success)]">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={dismissSuccess}
            className="shrink-0 font-semibold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recordings.map((recording) => {
          const playable = isPlayableUrl(
            recording.recordingUrl
          );

          return (
            <Card
              key={recording._id || recording.recordingUrl}
              className="flex flex-col overflow-hidden transition duration-200 hover:border-[var(--border-strong)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                    <MonitorPlay size={20} />
                  </div>
                  {playable ? (
                    <Button
                      onClick={() => selectRecording(recording)}
                      size="sm"
                      variant="secondary"
                    >
                      <PlayCircle size={15} />
                      Play
                    </Button>
                  ) : (
                    <span className="rounded-full bg-[var(--surface-hover)] px-3 py-1 text-[11px] font-medium text-[var(--text-muted)]">
                      Unavailable
                    </span>
                  )}
                </div>

                <CardTitle className="mt-4 line-clamp-1">
                  {recording.roomName || "Study Room"}
                </CardTitle>

                <CardDescription className="line-clamp-1">
                  {recording.fileName ||
                    "Session recording"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-2 text-sm text-[var(--text-secondary)]">
                <p className="flex items-center gap-2">
                  <CalendarDays
                    size={15}
                    className="text-[var(--accent)]"
                  />
                  {formatDate(recording.createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock
                    size={15}
                    className="text-[var(--accent)]"
                  />
                  {formatDuration(recording.duration)}
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between gap-3 pt-0">
                <div className="min-w-0">
                  {!playable && (
                    <p className="text-xs leading-5 text-[var(--text-muted)]">
                      This recording is missing a valid video link.
                    </p>
                  )}
                </div>
                <Button
                  aria-label={`Delete ${recording.roomName || "this recording"}`}
                  onClick={() => openDeleteDialog(recording)}
                  size="sm"
                  variant="ghost"
                  disabled={deletingId === recording._id}
                  className="shrink-0 text-[var(--error)] hover:bg-[rgba(240,95,100,0.1)] hover:text-[var(--error)]"
                >
                  {deletingId === recording._id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {recordings.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button onClick={fetchRecordings} variant="ghost">
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        </div>
      )}

      {deleteDialog}
    </div>
  );
}

export default SavedRecordings;
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  MonitorPlay,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
            <Button
              onClick={closePlayer}
              variant="secondary"
            >
              <ChevronLeft size={16} />
              Back to recordings
            </Button>
          </CardFooter>
        </Card>
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

        <EmptyState
          icon={MonitorPlay}
          title="No saved recordings yet"
          description="When you record a study session and save it, the recording will appear here so you can watch it again anytime."
        />
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

              {!playable && (
                <CardFooter className="pt-0">
                  <p className="text-xs leading-5 text-[var(--text-muted)]">
                    This recording is missing a valid video link.
                  </p>
                </CardFooter>
              )}
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
    </div>
  );
}

export default SavedRecordings;
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  CircleDot,
  MonitorUp,
  Maximize2,
  Minimize2,
  PhoneOff,
  Square,
  Users,
  Wifi,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import socket from "../socket/socket";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Timestamps are only ever created from event/async callbacks
// (never during a render pass), so they go through a small
// module-scope helper instead of calling Date.now inline.
const getNow = () => Date.now();

function VideoCall({ roomId, userName = "You" }) {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const containerRef = useRef(null);

  const peerConnectionsRef = useRef({});
  const remoteStreamsRef = useRef({});

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingStartRef = useRef(0);

  // Recording persistence state
  // "idle" | "saving" | "saved" | "failed"
  const [recordingStatus, setRecordingStatus] =
    useState("idle");
  const [roomRecordings, setRoomRecordings] = useState([]);
  const pendingRecordingRef = useRef(null);

  const buildRecordingStream = () => {
    const streams = [
      localStreamRef.current,
      ...Object.values(remoteStreamsRef.current),
    ];

    const tracks = [];

    streams.forEach((stream) => {
      if (!stream) return;

      stream.getTracks().forEach((track) => {
        if (!tracks.some((existing) => existing === track)) {
          tracks.push(track);
        }
      });
    });

    if (tracks.length === 0) return null;

    return new MediaStream(tracks);
  };

  const formatRecordingTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const generateRecordingFilename = (mimeType) => {
    const now = new Date();

    const pad = (value) => String(value).padStart(2, "0");

    const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const extension = mimeType?.includes("mp4") ? "mp4" : "webm";

    return `SkillUp-StudySession-${datePart}.${extension}`;
  };

  // MediaRecorder's mimeType often includes codec parameters, e.g.
  // "video/webm;codecs=vp9,opus". For the upload FormData part we must
  // send a clean base MIME - some multipart parsers drop the whole
  // value when it carries parameters.
  const getBaseMimeType = (mimeType) =>
    String(mimeType || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

  const finalizeRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setRecordingTime(0);
    setIsRecording(false);
    mediaRecorderRef.current = null;
    recordingStreamRef.current = null;
  };

  const startRecording = () => {
    if (isRecording) return;

    if (typeof MediaRecorder === "undefined") {
      setError("Recording is not supported in this browser.");
      return;
    }

    const recordingStream = buildRecordingStream();

    if (!recordingStream || recordingStream.getTracks().length === 0) {
      setError("There is no active audio/video to record right now.");
      return;
    }

    const supportedTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    const mimeType = supportedTypes.find(
      (type) =>
        typeof MediaRecorder.isTypeSupported === "function" &&
        MediaRecorder.isTypeSupported(type)
    );

    recordedChunksRef.current = [];
    recordingStreamRef.current = recordingStream;

    try {
      const recorder = mimeType
        ? new MediaRecorder(recordingStream, {
            mimeType,
            videoBitsPerSecond: 2_500_000,
          })
        : new MediaRecorder(recordingStream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try recording again.");
        finalizeRecording();
      };

      recorder.onstop = () => {
        const duration = Math.max(
          1,
          Math.round(
            (getNow() - recordingStartRef.current) / 1000
          )
        );

        finalizeRecording();

        const recordingBlob = new Blob(recordedChunksRef.current, {
          // Send a clean base MIME (no codec parameters) so the server
          // can validate and ingest the container type reliably.
          type: getBaseMimeType(recorder.mimeType) || "video/webm",
        });

        recordedChunksRef.current = [];

        if (recordingBlob.size === 0) {
          setError(
            "Recording finished, but no media was captured. Please try again."
          );
          return;
        }

        saveRecording(
          recordingBlob,
          recordingBlob.type || "video/webm",
          duration
        );
      };

      recorder.start(1000);

      recordingStartRef.current = getNow();
      setError("");
      setRecordingTime(0);
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(
          Math.floor((getNow() - recordingStartRef.current) / 1000)
        );
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);

      setError("Unable to start recording. Please try again.");
      mediaRecorderRef.current = null;
      recordingStreamRef.current = null;
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      finalizeRecording();
      return;
    }

    try {
      recorder.stop();
    } catch (err) {
      console.error("Stop recording error:", err);
      finalizeRecording();
    }
  };

  const fetchRoomRecordings = async () => {
    if (!roomId) return;

    const token = getToken();

    if (!token) return;

    try {
      const { data } = await axios.get(
        `${API_URL}/api/recordings/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoomRecordings(data?.recordings || []);
    } catch (err) {
      console.error(
        "Load recordings error:",
        err.response?.data || err.message
      );
    }
  };

  // Uploads the recording Blob to the backend, which stores it
  // securely on Cloudinary and saves the reference in MongoDB.
  // The Blob is reused from the live call streams - no new capture.
  const saveRecording = async (blob, mimeType, duration = 0) => {
    const token = getToken();

    if (!token) {
      pendingRecordingRef.current = { blob, mimeType, duration };
      setRecordingStatus("failed");
      return;
    }

    pendingRecordingRef.current = { blob, mimeType, duration };
    setError("");
    setRecordingStatus("saving");

    try {
      const formData = new FormData();

      formData.append("recording", blob, generateRecordingFilename(mimeType));
      formData.append("roomId", roomId || "");
      formData.append("duration", String(Math.max(0, duration)));

      const { data } = await axios.post(
        `${API_URL}/api/recordings`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!data?.success) {
        throw new Error("Recording could not be saved.");
      }

      pendingRecordingRef.current = null;
      setRecordingStatus("saved");
      setError("");

      // Refresh the room's recording list (includes the new one),
      // then collapse the success message again.
      fetchRoomRecordings();

      setTimeout(() => {
        setRecordingStatus((current) =>
          current === "saved" ? "idle" : current
        );
      }, 3000);
    } catch (err) {
      console.error(
        "Recording upload error:",
        err.response?.data || err.message
      );

      // Blob stays in pendingRecordingRef for a same-session retry.
      // The inline panel surfaces the failure (with a Retry action);
      // the generic error banner is left untouched.
      setRecordingStatus("failed");
    }
  };

  const retrySaveRecording = () => {
    const pending = pendingRecordingRef.current;

    if (!pending) return;

    saveRecording(
      pending.blob,
      pending.mimeType,
      pending.duration
    );
  };

  const createPeerConnection = (targetSocketId, shouldCreateOffer) => {
    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId];
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peerConnectionsRef.current[targetSocketId] = peer;

    const localStream = localStreamRef.current;

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit("iceCandidate", {
        target: targetSocketId,
        candidate: event.candidate,
      });
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;

      if (!stream) return;

      remoteStreamsRef.current[targetSocketId] = stream;

      setRemoteStreams((prev) => {
        const exists = prev.some(
          (item) => item.id === targetSocketId
        );

        if (exists) {
          return prev.map((item) =>
            item.id === targetSocketId
              ? { ...item, stream }
              : item
          );
        }

        return [
          ...prev,
          {
            id: targetSocketId,
            stream,
          },
        ];
      });
    };

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed"
      ) {
        removePeer(targetSocketId);
      }
    };

    if (shouldCreateOffer) {
      peer
        .createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", {
            target: targetSocketId,
            offer: peer.localDescription,
          });
        })
        .catch((err) => {
          console.error("Offer error:", err);
        });
    }

    return peer;
  };

  const removePeer = (socketId) => {
    const peer = peerConnectionsRef.current[socketId];

    if (peer) {
      peer.close();
      delete peerConnectionsRef.current[socketId];
    }

    delete remoteStreamsRef.current[socketId];

    setRemoteStreams((prev) =>
      prev.filter((item) => item.id !== socketId)
    );
  };

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    const startCamera = async () => {
      try {
        setError("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit("joinVideoRoom", roomId);
        setJoined(true);
      } catch (err) {
        console.error("Camera/Microphone error:", err);

        setError(
          "Camera or microphone permission is required to join the video room."
        );
      }
    };

    const handleExistingUsers = (users) => {
      users.forEach((targetSocketId) => {
        createPeerConnection(targetSocketId, true);
      });
    };

    const handleUserJoined = (targetSocketId) => {
      createPeerConnection(targetSocketId, true);
    };

    const handleOffer = async ({ sender, offer }) => {
      try {
        const peer = createPeerConnection(sender, false);

        await peer.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        socket.emit("answer", {
          target: sender,
          answer,
        });
      } catch (err) {
        console.error("Offer handling error:", err);
      }
    };

    const handleAnswer = async ({ sender, answer }) => {
      try {
        const peer =
          peerConnectionsRef.current[sender];

        if (!peer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Answer handling error:", err);
      }
    };

    const handleIceCandidate = async ({
      sender,
      candidate,
    }) => {
      try {
        const peer =
          peerConnectionsRef.current[sender];

        if (!peer || !candidate) return;

        await peer.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    };

    const handleUserLeft = (socketId) => {
      removePeer(socketId);
    };

    socket.on("existingUsers", handleExistingUsers);
    socket.on("userJoined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("userLeft", handleUserLeft);

    startCamera();

    return () => {
      mounted = false;

      socket.off(
        "existingUsers",
        handleExistingUsers
      );
      socket.off(
        "userJoined",
        handleUserJoined
      );
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off(
        "iceCandidate",
        handleIceCandidate
      );
      socket.off("userLeft", handleUserLeft);

      stopRecording();

      socket.emit("leaveVideoRoom", roomId);

      Object.values(
        peerConnectionsRef.current
      ).forEach((peer) => peer.close());

      peerConnectionsRef.current = {};
      remoteStreamsRef.current = {};

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      setRemoteStreams([]);
    };
  }, [roomId]);

  // Load this room's saved recordings so they are reachable
  // from the existing video-call UI. Matches the one-time
  // room data load pattern used elsewhere in the app.
  useEffect(() => {
    // set-state-in-effect suppressed: mirrors the existing
    // one-time room data loads (e.g. StudyRoom/StudyPartners).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoomRecordings();
    // fetchRoomRecordings is recreated per-render; running
    // this effect only on roomId change is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleMicrophone = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    const audioTracks = stream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicEnabled(
      audioTracks.some((track) => track.enabled)
    );
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setCameraEnabled(
      videoTracks.some((track) => track.enabled)
    );
  };

  const toggleScreenShare = async () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    if (!screenSharing) {
      try {
        const displayStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });

        const screenTrack =
          displayStream.getVideoTracks()[0];

        Object.values(
          peerConnectionsRef.current
        ).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find(
              (item) =>
                item.track?.kind === "video"
            );

          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            displayStream;
        }

        setScreenSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.log("Screen sharing cancelled.");
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    try {
      const cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      const cameraTrack =
        cameraStream.getVideoTracks()[0];

      Object.values(
        peerConnectionsRef.current
      ).forEach((peer) => {
        const sender = peer
          .getSenders()
          .find(
            (item) =>
              item.track?.kind === "video"
          );

        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      });

      const currentStream =
        localStreamRef.current;

      if (currentStream) {
        const oldVideoTracks =
          currentStream.getVideoTracks();

        oldVideoTracks.forEach((track) => {
          track.stop();
          currentStream.removeTrack(track);
        });

        currentStream.addTrack(cameraTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            currentStream;
        }
      }

      setScreenSharing(false);
      setCameraEnabled(true);
    } catch (err) {
      console.error(
        "Unable to restore camera:",
        err
      );
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (err) {
      console.error(
        "Fullscreen error:",
        err
      );
    }
  };

  const leaveRoom = () => {
    stopRecording();
    socket.emit("leaveVideoRoom", roomId);

    Object.values(
      peerConnectionsRef.current
    ).forEach((peer) => peer.close());

    peerConnectionsRef.current = {};

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    localStreamRef.current = null;

    setRemoteStreams([]);
    setJoined(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-black shadow-[var(--shadow-lg)]"
    >
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold text-white">
            Study Room
          </p>

          <div className="mt-0.5 flex items-center gap-2 text-xs text-white/55">
            <Wifi
              size={12}
              className="text-[var(--success)]"
            />
            {joined ? "Connected" : "Connecting..."}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/70">
          <Users size={13} />
          {remoteStreams.length + 1}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute left-1/2 top-20 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-center text-sm text-[var(--error)] backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Video Area */}
      <div className="relative min-h-[520px] bg-[#08090d] p-3 pt-16">
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute left-3 top-14 z-10 flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--error)] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--error)]" />
            </span>
            REC · {formatRecordingTime(recordingTime)}
          </div>
        )}

        {/* Recording status + saved playback */}
        {(recordingStatus !== "idle" ||
          roomRecordings.length > 0) && (
          <div className="absolute left-3 top-32 z-30 flex w-72 max-w-[calc(100%-24px)] flex-col gap-3 rounded-lg border border-white/10 bg-black/85 p-3 text-white backdrop-blur-md">
            {recordingStatus === "saving" && (
              <p className="flex items-center gap-2 text-xs text-white/80">
                <Loader2 size={13} className="animate-spin" />
                Saving recording...
              </p>
            )}

            {recordingStatus === "saved" && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
                <CheckCircle size={13} />
                Recording saved
              </p>
            )}

            {recordingStatus === "failed" && (
              <div className="text-xs">
                <p className="flex items-center gap-1.5 text-[var(--error)]">
                  <AlertCircle size={13} />
                  Recording could not be saved.
                </p>
                <button
                  type="button"
                  onClick={retrySaveRecording}
                  className="mt-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/15"
                >
                  Retry Save
                </button>
              </div>
            )}

            {roomRecordings.length > 0 && (
              <div className="border-t border-white/10 pt-2">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/55">
                  Session Recordings
                </p>

                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {roomRecordings.map((recording) => (
                    <video
                      key={recording._id}
                      src={recording.recordingUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full rounded-md bg-black"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className={`grid h-full min-h-[440px] gap-3 ${
            remoteStreams.length === 0
              ? "grid-cols-1"
              : remoteStreams.length === 1
                ? "md:grid-cols-2"
                : "grid-cols-2"
          }`}
        >
          {/* Local Video */}
          <div className="group relative min-h-[220px] overflow-hidden rounded-lg border border-white/10 bg-[#101117]">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full min-h-[220px] w-full object-cover"
            />

            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#101117]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xl font-semibold text-[var(--accent)]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/55 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
              {userName}
              <span className="text-white/45">
                You
              </span>
            </div>
          </div>

          {/* Remote Videos */}
          {remoteStreams.map((remote) => (
            <RemoteVideo
              key={remote.id}
              stream={remote.stream}
              socketId={remote.id}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 border-t border-white/10 bg-black/65 px-4 py-4 backdrop-blur-md">
        <ControlButton
          active={micEnabled}
          onClick={toggleMicrophone}
          label={
            micEnabled
              ? "Mute microphone"
              : "Unmute microphone"
          }
        >
          {micEnabled ? (
            <Mic size={19} />
          ) : (
            <MicOff size={19} />
          )}
        </ControlButton>

        <ControlButton
          active={cameraEnabled}
          onClick={toggleCamera}
          label={
            cameraEnabled
              ? "Turn camera off"
              : "Turn camera on"
          }
        >
          {cameraEnabled ? (
            <Video size={19} />
          ) : (
            <VideoOff size={19} />
          )}
        </ControlButton>

        <ControlButton
          active={screenSharing}
          onClick={toggleScreenShare}
          label={
            screenSharing
              ? "Stop sharing"
              : "Share screen"
          }
        >
          <MonitorUp size={19} />
        </ControlButton>

        <ControlButton
          active={fullscreen}
          onClick={toggleFullscreen}
          label={
            fullscreen
              ? "Exit fullscreen"
              : "Fullscreen"
          }
        >
          {fullscreen ? (
            <Minimize2 size={19} />
          ) : (
            <Maximize2 size={19} />
          )}
        </ControlButton>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`ml-2 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
            isRecording
              ? "bg-[var(--error)] text-white hover:opacity-90"
              : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {isRecording ? (
            <>
              <Square size={15} />
              <span className="hidden sm:inline">
                Stop Recording
              </span>
            </>
          ) : (
            <>
              <CircleDot size={18} className="text-[var(--error)]" />
              <span className="hidden sm:inline">
                Record
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={leaveRoom}
          className="ml-2 flex h-10 items-center gap-2 rounded-lg bg-[var(--error)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          <PhoneOff size={17} />
          <span className="hidden sm:inline">
            Leave
          </span>
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, socketId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[220px] overflow-hidden rounded-lg border border-white/10 bg-[#101117]"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full min-h-[220px] w-full object-cover"
      />

      <div className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2.5 py-1.5 text-xs text-white backdrop-blur-sm">
        Participant
      </div>
    </motion.div>
  );
}

function ControlButton({
  active,
  children,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
        active
          ? "bg-white/10 text-white hover:bg-white/15"
          : "bg-[var(--error)]/15 text-[var(--error)] hover:bg-[var(--error)]/25"
      }`}
    >
      {children}
    </button>
  );
}

export default VideoCall;
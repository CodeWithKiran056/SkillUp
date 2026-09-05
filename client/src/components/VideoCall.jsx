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
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import socket from "../socket/socket";
import { getToken } from "../utils/auth";

import { API_URL } from "../config/api";

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

  // Per-peer perfect-negotiation state (offer / answer collision handling).
  const peerStatesRef = useRef({});
  // Active screen-share video track so it can always be stopped & detached.
  const screenTrackRef = useRef(null);
  // socketId -> { cameraEnabled, micEnabled } as reported by remote peers.
  const remoteMediaStateRef = useRef({});

  const [remoteStreams, setRemoteStreams] = useState([]);
  // Remote peers' camera/mic toggles (driven by the "mediaState" socket event).
  const [mediaStateByPeer, setMediaStateByPeer] = useState({});
  // Bumping this value tears down and re-runs the entire join/connect flow
  // (used by the Rejoin control after a user leaves the video room).
  const [attempt, setAttempt] = useState(0);
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

  // Uploads the recording Blob to the backend, which stores it
  // securely on Cloudinary and saves the reference in MongoDB.
  // The Blob is reused from the live call streams - no new capture.
  const saveRecording = async (blob, mimeType, duration = 0) => {
    const token = getToken();

    if (!token) {
      pendingRecordingRef.current = { blob, mimeType, duration };
      setRecordingStatus("failed");
      setError("Please log in to save recordings.");
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

      setRecordingStatus("failed");
      setError(
        err.response?.data?.message ||
          "Recording could not be saved. Please try again."
      );
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

  const sendLocalMediaState = (cameraEnabledNow, micEnabledNow) => {
    Object.keys(peerConnectionsRef.current).forEach((target) => {
      socket.emit("mediaState", {
        target,
        cameraEnabled: cameraEnabledNow,
        micEnabled: micEnabledNow,
      });
    });
  };

  const flushPendingCandidates = async (targetSocketId) => {
    const state = peerStatesRef.current[targetSocketId];
    const peer = peerConnectionsRef.current[targetSocketId];

    if (!state || !peer) return;

    const queued = state.pendingCandidates;
    state.pendingCandidates = [];

    for (const candidate of queued) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!state.ignoreOffer) {
          console.error("ICE candidate error:", err);
        }
      }
    }
  };

  const addIceCandidateForPeer = async (targetSocketId, candidate) => {
    const peer = peerConnectionsRef.current[targetSocketId];
    const state = peerStatesRef.current[targetSocketId];

    if (!peer || !state || !candidate) return;

    // addIceCandidate() rejects until the remote description has been set,
    // so queue any candidate that arrives during the offer/answer handshake.
    if (!peer.remoteDescription) {
      state.pendingCandidates.push(candidate);
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      if (!state.ignoreOffer) {
        console.error("ICE candidate error:", err);
      }
    }
  };

  const negotiate = async (targetSocketId) => {
    const peer = peerConnectionsRef.current[targetSocketId];
    const state = peerStatesRef.current[targetSocketId];

    if (!peer || !state || state.makingOffer) return;
    if (peer.connectionState === "connected") return;
    if (peer.signalingState !== "stable") return;

    try {
      state.makingOffer = true;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("offer", {
        target: targetSocketId,
        offer: peer.localDescription,
      });
    } catch (err) {
      console.error("Offer creation error:", err);
    } finally {
      state.makingOffer = false;
    }
  };

  // Fallback: if the participant that was expected to offer never does
  // (e.g. it missed the join event), promote this peer to offering.
  const scheduleNegotiation = (targetSocketId, delay = 1500) => {
    const state = peerStatesRef.current[targetSocketId];

    if (!state) return;

    state.timers.push(
      window.setTimeout(() => {
        const peer = peerConnectionsRef.current[targetSocketId];

        // Only initiate as a fallback when we have NOT yet received the
        // other side's offer/answer (avoids a spurious renegotiation once
        // the handshake already started).
        if (
          !peer ||
          peer.connectionState === "connected" ||
          peer.remoteDescription
        ) {
          return;
        }

        state.allowOffer = true;
        negotiate(targetSocketId);
      }, delay)
    );
  };

  const createPeerConnection = (targetSocketId, isPolite) => {
    const existing = peerConnectionsRef.current[targetSocketId];

    // Never create a second RTCPeerConnection for the same participant.
    if (existing) {
      return existing;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peerConnectionsRef.current[targetSocketId] = peer;

    peerStatesRef.current[targetSocketId] = {
      isPolite,
      // Polite participants wait for the other side's first offer; the
      // impolite (already-present) participant starts the handshake.
      allowOffer: !isPolite,
      makingOffer: false,
      ignoreOffer: false,
      pendingCandidates: [],
      timers: [],
    };

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

    // Perfect-negotiation entry point. Only fires after the initial
    // handshake (or a started-offering timeout) on either side.
    peer.onnegotiationneeded = () => {
      const state = peerStatesRef.current[targetSocketId];

      if (!state?.allowOffer) return;

      negotiate(targetSocketId);
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
      const state = peerStatesRef.current[targetSocketId];

      if (peer.connectionState === "connected") {
        if (state) {
          state.timers.forEach((timer) => window.clearTimeout(timer));
          state.timers = [];
        }
      } else if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed"
      ) {
        removePeer(targetSocketId);
      }
    };

    if (isPolite) {
      scheduleNegotiation(targetSocketId);
    }

    return peer;
  };

  const removePeer = (socketId) => {
    const peer = peerConnectionsRef.current[socketId];
    const state = peerStatesRef.current[socketId];

    if (state) {
      state.timers.forEach((timer) => window.clearTimeout(timer));
    }

    if (peer) {
      peer.close();
      delete peerConnectionsRef.current[socketId];
    }

    delete peerStatesRef.current[socketId];
    delete remoteStreamsRef.current[socketId];
    delete remoteMediaStateRef.current[socketId];

    setMediaStateByPeer((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });

    setRemoteStreams((prev) =>
      prev.filter((item) => item.id !== socketId)
    );
  };

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    // Captured once so the cleanup function can always clear the preview
    // element without reading a live ref during unmount.
    const localVideoElement = localVideoRef.current;

    const friendlyMediaError = (err, kind) => {
      const name = err?.name || "";

      if (/NotFoundError|DevicesNotFoundError/.test(name)) {
        return kind === "audio"
          ? "No microphone was found on this device."
          : "No camera was found on this device.";
      }

      if (/NotAllowedError|PermissionDeniedError|SecurityError/.test(name)) {
        return kind === "audio"
          ? "Microphone access was denied. Allow it in your browser settings to talk."
          : "Camera access was denied. Allow it in your browser settings to share video.";
      }

      if (/NotReadableError|AbortError|TrackStartError/.test(name)) {
        return kind === "audio"
          ? "Microphone is busy or cannot be started right now."
          : "Camera is busy or cannot be started right now.";
      }

      return kind === "audio"
        ? "Unable to access the microphone."
        : "Unable to access the camera.";
    };

    const acquireMedia = async () => {
      // Single stream shared by the local preview and every peer connection.
      const combinedStream = new MediaStream();
      const issues = [];

      // Try the normal combined request first (one browser permission prompt).
      try {
        const both = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        both.getTracks().forEach((track) =>
          combinedStream.addTrack(track)
        );

        return { stream: combinedStream, issues };
      } catch {
        // Fall through and request camera / microphone independently so a
        // denied or missing device never blocks the other one.
      }

      try {
        const cameraOnly = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        cameraOnly.getVideoTracks().forEach((track) =>
          combinedStream.addTrack(track)
        );
      } catch (err) {
        issues.push(friendlyMediaError(err, "video"));
      }

      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        audioOnly.getAudioTracks().forEach((track) =>
          combinedStream.addTrack(track)
        );
      } catch (err) {
        issues.push(friendlyMediaError(err, "audio"));
      }

      return { stream: combinedStream, issues };
    };

    const startCamera = async () => {
      try {
        const { stream, issues } = await acquireMedia();

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        const hasVideo = stream.getVideoTracks().length > 0;
        const hasAudio = stream.getAudioTracks().length > 0;

        setCameraEnabled(hasVideo);
        setMicEnabled(hasAudio);

        if (hasVideo && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const uniqueIssues = [...new Set(issues)];

        setError(uniqueIssues.join(" "));

        socket.emit("joinVideoRoom", roomId);
        setJoined(true);
      } catch (err) {
        console.error("Camera/Microphone error:", err);

        if (mounted) {
          setError(
            "Unable to access camera or microphone. Check device permissions and try again."
          );
        }
      }
    };

    const emitMyMediaState = (targetSocketId) => {
      const stream = localStreamRef.current;

      const cameraEnabledNow =
        stream?.getVideoTracks().some((track) => track.enabled) ?? true;
      const micEnabledNow =
        stream?.getAudioTracks().some((track) => track.enabled) ?? true;

      socket.emit("mediaState", {
        target: targetSocketId,
        cameraEnabled: cameraEnabledNow,
        micEnabled: micEnabledNow,
      });
    };

    const handleExistingUsers = (users) => {
      // Already-present participants pre-date us: they are the offerers.
      users.forEach((targetSocketId) => {
        createPeerConnection(targetSocketId, true);
        emitMyMediaState(targetSocketId);
      });
    };

    const handleUserJoined = (targetSocketId) => {
      // We were here first: create the peer AND start the handshake.
      createPeerConnection(targetSocketId, false);
      emitMyMediaState(targetSocketId);
      negotiate(targetSocketId);
    };

    const handleOffer = async ({ sender, offer }) => {
      try {
        const knownState = peerStatesRef.current[sender];
        const peer = createPeerConnection(
          sender,
          knownState ? knownState.isPolite : false
        );

        const state = peerStatesRef.current[sender];

        if (!state) return;

        const offerCollision =
          offer?.type === "offer" &&
          (state.makingOffer || peer.signalingState !== "stable");

        state.ignoreOffer = !state.isPolite && offerCollision;

        if (state.ignoreOffer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        await flushPendingCandidates(sender);

        // Handshake is done; this peer may now also renegotiate on demand.
        state.allowOffer = true;

        if (offer?.type === "offer") {
          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("answer", {
            target: sender,
            answer,
          });
        }

        state.ignoreOffer = false;
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

        await flushPendingCandidates(sender);
      } catch (err) {
        console.error("Answer handling error:", err);
      }
    };

    const handleIceCandidate = ({ sender, candidate }) => {
      const peer = peerConnectionsRef.current[sender];
      const state = peerStatesRef.current[sender];

      if (!peer || !state || !candidate) return;

      addIceCandidateForPeer(sender, candidate);
    };

    const handleUserLeft = (socketId) => {
      removePeer(socketId);
    };

    const handleMediaState = ({ sender, cameraEnabled, micEnabled }) => {
      const next = {
        cameraEnabled: Boolean(cameraEnabled),
        micEnabled: Boolean(micEnabled),
      };

      remoteMediaStateRef.current[sender] = next;

      setMediaStateByPeer((prev) => ({
        ...prev,
        [sender]: next,
      }));
    };

    socket.on("existingUsers", handleExistingUsers);
    socket.on("userJoined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("userLeft", handleUserLeft);
    socket.on("mediaState", handleMediaState);

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
      socket.off("mediaState", handleMediaState);

      stopRecording();

      socket.emit("leaveVideoRoom", roomId);

      Object.values(
        peerConnectionsRef.current
      ).forEach((peer) => peer.close());

      const states = peerStatesRef.current;

      Object.values(states).forEach((state) => {
        state.timers.forEach((timer) => window.clearTimeout(timer));
      });

      peerConnectionsRef.current = {};
      peerStatesRef.current = {};
      remoteStreamsRef.current = {};
      remoteMediaStateRef.current = {};

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      const screenTrack = screenTrackRef.current;

      if (screenTrack) {
        screenTrack.onended = null;
        screenTrack.stop();
        screenTrackRef.current = null;
      }

      if (localVideoElement) {
        localVideoElement.srcObject = null;
      }

      setRemoteStreams([]);
      setMediaStateByPeer({});
    };
    // The connect flow intentionally reuses stable component-scope helpers
    // (createPeerConnection/stopRecording) and only re-runs on roomId or
    // an explicit rejoin attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, attempt]);

  const toggleMicrophone = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      setError("You are not connected to the video room.");
      return;
    }

    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      setError("No microphone is available on this device.");
      return;
    }

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    const micEnabledNow = audioTracks.some((track) => track.enabled);
    const cameraEnabledNow = stream
      .getVideoTracks()
      .some((track) => track.enabled);

    setMicEnabled(micEnabledNow);
    setError("");
    sendLocalMediaState(cameraEnabledNow, micEnabledNow);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      setError("You are not connected to the video room.");
      return;
    }

    const videoTracks = stream.getVideoTracks();

    if (videoTracks.length === 0) {
      setError("No camera is available on this device.");
      return;
    }

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    const cameraEnabledNow = videoTracks.some((track) => track.enabled);
    const micEnabledNow = stream
      .getAudioTracks()
      .some((track) => track.enabled);

    setCameraEnabled(cameraEnabledNow);
    setError("");
    sendLocalMediaState(cameraEnabledNow, micEnabledNow);
  };

  const toggleScreenShare = async () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    if (screenSharing) {
      await stopScreenShare();
      return;
    }

    try {
      const displayStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      const screenTrack = displayStream.getVideoTracks()[0];

      if (!screenTrack) {
        displayStream.getTracks().forEach((track) => track.stop());
        setError("Screen capture failed. Please try again.");
        return;
      }

      screenTrackRef.current = screenTrack;

      for (const peer of Object.values(peerConnectionsRef.current)) {
        const sender = peer
          .getSenders()
          .find((item) => item.track?.kind === "video");

        if (sender) {
          // Same transceiver switch - no renegotiation required.
          await sender.replaceTrack(screenTrack);
        } else {
          // No video track yet (no camera) - add the screen track and let
          // onnegotiationneeded renegotiate so the remote actually sees it.
          peer.addTrack(screenTrack, displayStream);
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = displayStream;
      }

      setScreenSharing(true);
      setError("");

      // If the browser ends the share (stop button in the UI, tab switch
      // policy, capture-in-use-warning), fall back to the camera stream.
      screenTrack.onended = () => {
        if (screenTrackRef.current === screenTrack) {
          stopScreenShare();
        }
      };
    } catch (err) {
      console.log("Screen sharing cancelled or unavailable:", err?.name || err);
      setScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    const screenTrack = screenTrackRef.current;

    if (!screenTrack && !screenSharing) return;

    const stream = localStreamRef.current;
    const cameraTrack = stream?.getVideoTracks()[0] || null;

    for (const peer of Object.values(peerConnectionsRef.current)) {
      const sender = peer
        .getSenders()
        .find((item) => item.track === screenTrack);

      if (!sender) continue;

      try {
        if (cameraTrack) {
          // Return to the original (still live) local camera track. No new
          // getUserMedia request and no dead track left on the connection.
          await sender.replaceTrack(cameraTrack);
        } else {
          // There was never a camera; detach the ended screen track properly
          // (onnegotiationneeded renegotiates the removal).
          peer.removeTrack(sender);
        }
      } catch (err) {
        console.error("Screen track restore error:", err);
      }
    }

    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    if (screenTrack) {
      screenTrack.onended = null;
      screenTrack.stop();
      screenTrackRef.current = null;
    }

    setScreenSharing(false);
    setCameraEnabled(cameraTrack ? cameraTrack.enabled : false);
    setError("");
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

    const states = peerStatesRef.current;

    Object.values(states).forEach((state) => {
      state.timers.forEach((timer) => window.clearTimeout(timer));
    });

    peerConnectionsRef.current = {};
    peerStatesRef.current = {};

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    localStreamRef.current = null;

    const screenTrack = screenTrackRef.current;

    if (screenTrack) {
      screenTrack.onended = null;
      screenTrack.stop();
      screenTrackRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    remoteStreamsRef.current = {};
    remoteMediaStateRef.current = {};

    setRemoteStreams([]);
    setMediaStateByPeer({});
    setJoined(false);
    setScreenSharing(false);
    setError("");
  };

  const rejoinRoom = () => {
    // Reset the control indicators; the join effect re-detects the actual
    // camera/microphone availability from the freshly acquired stream.
    setMicEnabled(true);
    setCameraEnabled(true);
    setScreenSharing(false);
    setError("");
    setAttempt((current) => current + 1);
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
            {joined ? "Connected" : "Not connected"}
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
          <span>{error}</span>
          {pendingRecordingRef.current && (
            <button
              type="button"
              onClick={retrySaveRecording}
              className="ml-2 font-semibold underline hover:opacity-80"
            >
              Retry
            </button>
          )}
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

        {/* Transient saving / saved indicator */}
        {recordingStatus === "saving" && (
          <div className="absolute left-3 top-14 z-10 flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Loader2 size={13} className="animate-spin text-[var(--accent)]" />
            Saving recording...
          </div>
        )}

        {recordingStatus === "saved" && (
          <div className="absolute left-3 top-14 z-10 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-[var(--success)] backdrop-blur-sm">
            <CheckCircle size={13} />
            Recording saved
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

            {!cameraEnabled && !screenSharing && (
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
              cameraEnabled={
                mediaStateByPeer[remote.id]?.cameraEnabled
              }
              micEnabled={
                mediaStateByPeer[remote.id]?.micEnabled
              }
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
          disabled={recordingStatus === "saving"}
          className={`ml-2 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
            isRecording
              ? "bg-[var(--error)] text-white hover:opacity-90"
              : recordingStatus === "saving"
                ? "cursor-not-allowed bg-white/5 text-white/50"
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
          ) : recordingStatus === "saving" ? (
            <>
              <Loader2 size={15} className="animate-spin text-white/70" />
              <span className="hidden sm:inline">
                Saving...
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
          onClick={joined ? leaveRoom : rejoinRoom}
          className={`ml-2 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition hover:opacity-90 ${
            joined
              ? "bg-[var(--error)]"
              : "bg-[var(--accent)]"
          }`}
        >
          {joined ? <PhoneOff size={17} /> : <Video size={17} />}
          <span className="hidden sm:inline">
            {joined ? "Leave" : "Rejoin"}
          </span>
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, cameraEnabled, micEnabled }) {
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

      {cameraEnabled === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#101117]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
            <VideoOff size={18} />
          </div>
        </div>
      )}

      {micEnabled === false && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-[var(--error)] backdrop-blur-sm">
          <MicOff size={14} />
        </div>
      )}

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
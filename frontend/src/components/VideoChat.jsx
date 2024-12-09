import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import 'webrtc-adapter';

const VideoChat = () => {
  const [stream, setStream] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      query: { userId: authUser._id }
    });

    // Socket event listeners for video chat
    socketRef.current.on('incoming-call', handleIncomingCall);
    socketRef.current.on('call-accepted', handleCallAccepted);
    socketRef.current.on('signal', handleSignal);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [authUser]);

  const initiateCall = () => {
    if (!selectedUser) return;

    // Request webcam access when initiating the call
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 } 
      }, 
      audio: true 
    })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        setCallInProgress(true);
        
        peerRef.current = new Peer({
          initiator: true,
          trickle: true,
          stream: mediaStream
        });

        peerRef.current.on('signal', (signal) => {
          socketRef.current.emit('call-user', {
            targetUserId: selectedUser._id,
            callerId: authUser._id,
            callerName: authUser.fullName,
            signal: signal
          });
        });

        peerRef.current.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        alert('Unable to access webcam. Please check permissions.');
      });
  };

  const handleIncomingCall = (data) => {
    setIncomingCall(true);
    setCaller(data);
  };

  const handleCallAccepted = (data) => {
    setCallInProgress(true);
    peerRef.current.signal(data.signal);
  };

  const handleSignal = (data) => {
    if (peerRef.current) {
      peerRef.current.signal(data.signal);
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setCallInProgress(false);
    setIncomingCall(false);
    
    if (socketRef.current) {
      socketRef.current.emit('end-call', {
        targetUserId: selectedUser._id,
        senderId: authUser._id
      });
    }

    // Stop media tracks when ending the call
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const acceptCall = () => {
    if (!caller || !stream) return;

    peerRef.current = new Peer({
      initiator: false,
      trickle: true,
      stream: stream
    });

    peerRef.current.on('signal', (signal) => {
      socketRef.current.emit('accept-call', {
        callerId: caller.callerId,
        receiverId: authUser._id,
        signal: signal
      });
    });

    peerRef.current.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peerRef.current.signal(caller.signal);
    setIncomingCall(false);
    setCallInProgress(true);
  };

  return (
    <div className="video-chat-container fixed bottom-4 right-4 w-48 h-48 bg-gray-800 rounded-lg shadow-lg">
      {incomingCall && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>{caller.callerName} is calling</p>
            <div className="flex justify-between mt-2">
              <button onClick={acceptCall} className="btn btn-success">
                Accept
              </button>
              <button onClick={endCall} className="btn btn-error">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <video ref={remoteVideoRef} autoPlay muted className="w-full h-full object-cover" />
      <video ref={localVideoRef} autoPlay muted className="absolute bottom-2 right-2 w-16 h-16 rounded-lg border-2 border-white" />
      
      {!callInProgress && selectedUser && (
        <button 
          onClick={initiateCall} 
          className="absolute top-2 left-2 btn btn-primary text-xs"
        >
          Start Call
        </button>
      )}

      {callInProgress && (
        <button 
          onClick={endCall} 
          className="absolute top-2 right-2 btn btn-danger text-xs"
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default VideoChat;

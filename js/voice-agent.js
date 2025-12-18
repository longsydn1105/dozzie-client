import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client';

// Configuration - sử dụng biến môi trường từ Vite hoặc giá trị mặc định
const AGENT_SERVER_URL = 'https://18fc8d2b3f34.ngrok-free.app';
const LIVEKIT_URL = 'wss://demo-avatar-nas8r76a.livekit.cloud';

class VoiceAgent {
    constructor() {
        this.room = null;
        this.isConnected = false;
        this.isMuted = false;
        this.localAudioTrack = null;
        this.widgetCreated = false;

        this.elements = {
            widget: null,
            button: null,
            modal: null,
            statusText: null,
            muteBtn: null,
            closeBtn: null,
            visualizer: null,
            transcript: null
        };

        this.init();
    }

    isUserLoggedIn() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    init() {
        // Only show agent if user is logged in
        if (this.isUserLoggedIn()) {
            this.createWidget();
            this.bindEvents();
        }

        // Listen for login/logout changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'user') {
                this.updateVisibility();
            }
        });

        // Also check periodically for same-tab login/logout
        setInterval(() => this.updateVisibility(), 1000);
    }

    updateVisibility() {
        const isLoggedIn = this.isUserLoggedIn();

        if (isLoggedIn && !this.widgetCreated) {
            this.createWidget();
            this.bindEvents();
        } else if (!isLoggedIn && this.widgetCreated) {
            this.destroyWidget();
        }
    }

    destroyWidget() {
        if (this.isConnected) {
            this.disconnect();
        }
        if (this.elements.button) {
            this.elements.button.remove();
        }
        if (this.elements.modal) {
            this.elements.modal.remove();
        }
        this.widgetCreated = false;
    }

    createWidget() {
        // Create floating button
        const button = document.createElement('button');
        button.id = 'voice-agent-btn';
        button.className = 'voice-agent-btn';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
        `;
        button.title = 'Nói chuyện với Dozzie AI';
        this.elements.button = button;
        document.body.appendChild(button);

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'voice-agent-modal';
        modal.className = 'voice-agent-modal hidden';
        modal.innerHTML = `
            <div class="voice-agent-content">
                <div class="voice-agent-header">
                    <div class="voice-agent-title">
                        <div class="voice-agent-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" x2="9.01" y1="9" y2="9"></line>
                                <line x1="15" x2="15.01" y1="9" y2="9"></line>
                            </svg>
                        </div>
                        <div>
                            <h3>Dozzie AI</h3>
                            <span id="voice-agent-status" class="voice-agent-status">Nhấn để kết nối</span>
                        </div>
                    </div>
                    <button id="voice-agent-close" class="voice-agent-close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" x2="6" y1="6" y2="18"></line>
                            <line x1="6" x2="18" y1="6" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="voice-agent-body">
                    <div id="voice-agent-video-container" class="voice-agent-video-container">
                        <div id="voice-agent-visualizer" class="voice-agent-visualizer">
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                            <div class="visualizer-bar"></div>
                        </div>
                    </div>

                    <div id="voice-agent-transcript" class="voice-agent-transcript">
                        <p class="transcript-placeholder">Nhấn nút bên dưới để bắt đầu nói chuyện với trợ lý Dozzie AI</p>
                    </div>
                </div>

                <div class="voice-agent-footer">
                    <button id="voice-agent-connect" class="voice-agent-connect-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                        <span>Bắt đầu nói chuyện</span>
                    </button>

                    <button id="voice-agent-mute" class="voice-agent-mute-btn hidden">
                        <svg class="mic-on" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                        <svg class="mic-off hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                            <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
                            <path d="M5 10v2a7 7 0 0 0 12 5"></path>
                            <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                    </button>

                    <button id="voice-agent-disconnect" class="voice-agent-disconnect-btn hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                            <line x1="22" x2="2" y1="2" y2="22"></line>
                        </svg>
                        <span>Kết thúc</span>
                    </button>
                </div>
            </div>
        `;
        this.elements.modal = modal;
        document.body.appendChild(modal);

        // Store element references
        this.elements.statusText = modal.querySelector('#voice-agent-status');
        this.elements.muteBtn = modal.querySelector('#voice-agent-mute');
        this.elements.closeBtn = modal.querySelector('#voice-agent-close');
        this.elements.visualizer = modal.querySelector('#voice-agent-visualizer');
        this.elements.videoContainer = modal.querySelector('#voice-agent-video-container');
        this.elements.transcript = modal.querySelector('#voice-agent-transcript');
        this.elements.connectBtn = modal.querySelector('#voice-agent-connect');
        this.elements.disconnectBtn = modal.querySelector('#voice-agent-disconnect');

        this.widgetCreated = true;
    }

    bindEvents() {
        // Toggle modal
        this.elements.button.addEventListener('click', () => {
            this.elements.modal.classList.toggle('hidden');
        });

        // Close modal
        this.elements.closeBtn.addEventListener('click', () => {
            this.elements.modal.classList.add('hidden');
            if (this.isConnected) {
                this.disconnect();
            }
        });

        // Connect
        this.elements.connectBtn.addEventListener('click', () => {
            this.connect();
        });

        // Disconnect
        this.elements.disconnectBtn.addEventListener('click', () => {
            this.disconnect();
        });

        // Mute/Unmute
        this.elements.muteBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        // Close on outside click
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.elements.modal.classList.add('hidden');
            }
        });
    }

    getUserInfo() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return {
                    name: user.displayName || user.name || '',
                    email: user.email || ''
                };
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }
        return { name: '', email: '' };
    }

    async getToken() {
        try {
            const identity = 'user-' + Math.random().toString(36).substring(7);
            const userInfo = this.getUserInfo();

            // Build query params with user info
            const params = new URLSearchParams({
                name: identity,
                userName: userInfo.name,
                userEmail: userInfo.email
            });

            const response = await fetch(`${AGENT_SERVER_URL}/getToken?${params.toString()}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to get token');
            return await response.text();
        } catch (error) {
            console.error('Error getting token:', error);
            throw error;
        }
    }

    async connect() {
        try {
            this.updateStatus('Đang kết nối...', 'connecting');

            const token = await this.getToken();

            this.room = new Room({
                audioCaptureDefaults: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            // Setup event handlers
            this.setupRoomEvents();

            // Connect to room
            await this.room.connect(LIVEKIT_URL, token);

            // Enable microphone
            await this.room.localParticipant.setMicrophoneEnabled(true);

            this.isConnected = true;
            this.updateStatus('Đang nói chuyện', 'connected');
            this.updateUI(true);
            this.addTranscript('system', 'Đã kết nối! Bạn có thể bắt đầu nói chuyện.');

        } catch (error) {
            console.error('Connection error:', error);
            this.updateStatus('Lỗi kết nối', 'error');
            this.addTranscript('system', 'Không thể kết nối. Vui lòng thử lại.');
        }
    }

    setupRoomEvents() {
        this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === Track.Kind.Audio) {
                const audioElement = track.attach();
                audioElement.id = 'agent-audio';
                document.body.appendChild(audioElement);
            } else if (track.kind === Track.Kind.Video) {
                // Handle video track from Tavus avatar
                const videoElement = track.attach();
                videoElement.id = 'agent-video';
                videoElement.className = 'voice-agent-video';
                this.elements.videoContainer.appendChild(videoElement);
                // Hide visualizer when video is available
                this.elements.visualizer.classList.add('hidden');
            }
        });

        this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
            track.detach().forEach(el => el.remove());
            // Show visualizer again when video is removed
            if (track.kind === Track.Kind.Video) {
                this.elements.visualizer.classList.remove('hidden');
            }
        });

        this.room.on(RoomEvent.Disconnected, () => {
            this.handleDisconnect();
        });

        this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
            if (state === ConnectionState.Disconnected) {
                this.handleDisconnect();
            }
        });

        // Handle transcription data
        this.room.on(RoomEvent.DataReceived, (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'transcription') {
                    const sender = participant?.identity?.includes('agent') ? 'agent' : 'user';
                    this.addTranscript(sender, data.text);
                }
            } catch (e) {
                // Ignore non-JSON data
            }
        });

        // Listen for transcription events
        this.room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
            segments.forEach(segment => {
                if (segment.final) {
                    const isAgent = participant?.identity?.includes('agent') || !participant?.isLocal;
                    this.addTranscript(isAgent ? 'agent' : 'user', segment.text);
                }
            });
        });
    }

    handleDisconnect() {
        this.isConnected = false;
        this.updateStatus('Đã ngắt kết nối', 'disconnected');
        this.updateUI(false);

        // Remove audio element
        const audioEl = document.getElementById('agent-audio');
        if (audioEl) audioEl.remove();

        // Remove video element
        const videoEl = document.getElementById('agent-video');
        if (videoEl) videoEl.remove();

        // Show visualizer again
        this.elements.visualizer.classList.remove('hidden');
    }

    async disconnect() {
        if (this.room) {
            await this.room.disconnect();
            this.room = null;
        }
        this.handleDisconnect();
    }

    toggleMute() {
        if (!this.room) return;

        this.isMuted = !this.isMuted;
        this.room.localParticipant.setMicrophoneEnabled(!this.isMuted);

        const micOn = this.elements.muteBtn.querySelector('.mic-on');
        const micOff = this.elements.muteBtn.querySelector('.mic-off');

        if (this.isMuted) {
            micOn.classList.add('hidden');
            micOff.classList.remove('hidden');
            this.elements.muteBtn.classList.add('muted');
        } else {
            micOn.classList.remove('hidden');
            micOff.classList.add('hidden');
            this.elements.muteBtn.classList.remove('muted');
        }
    }

    updateStatus(text, state) {
        this.elements.statusText.textContent = text;
        this.elements.statusText.className = `voice-agent-status ${state}`;
    }

    updateUI(connected) {
        if (connected) {
            this.elements.connectBtn.classList.add('hidden');
            this.elements.muteBtn.classList.remove('hidden');
            this.elements.disconnectBtn.classList.remove('hidden');
            this.elements.visualizer.classList.add('active');
        } else {
            this.elements.connectBtn.classList.remove('hidden');
            this.elements.muteBtn.classList.add('hidden');
            this.elements.disconnectBtn.classList.add('hidden');
            this.elements.visualizer.classList.remove('active');
        }
    }

    addTranscript(sender, text) {
        // Remove placeholder if exists
        const placeholder = this.elements.transcript.querySelector('.transcript-placeholder');
        if (placeholder) placeholder.remove();

        const messageEl = document.createElement('div');
        messageEl.className = `transcript-message ${sender}`;
        messageEl.innerHTML = `
            <span class="transcript-sender">${sender === 'agent' ? 'Dozzie AI' : sender === 'user' ? 'Bạn' : 'Hệ thống'}:</span>
            <span class="transcript-text">${text}</span>
        `;

        this.elements.transcript.appendChild(messageEl);
        this.elements.transcript.scrollTop = this.elements.transcript.scrollHeight;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAgent = new VoiceAgent();
});

export default VoiceAgent;

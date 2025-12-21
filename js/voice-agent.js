import Daily from '@daily-co/daily-js';

// Configuration
const AGENT_SERVER_URL = 'http://localhost:5001';

class VoiceAgent {
    constructor() {
        this.call = null;
        this.isConnected = false;
        this.isMuted = false;
        this.widgetCreated = false;
        this.conversationId = null;

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

    async createConversation() {
        try {
            const response = await fetch(`${AGENT_SERVER_URL}/createConversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error('Failed to create conversation');
            return await response.json();
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    async connect() {
        try {
            this.updateStatus('Đang kết nối...', 'connecting');

            // Create Tavus conversation
            const conversationData = await this.createConversation();
            this.conversationId = conversationData.conversation_id;

            console.log('Created conversation:', conversationData);

            // Create Daily call frame
            this.call = Daily.createCallObject({
                audioSource: true,
                videoSource: false,
                dailyConfig: {
                    experimentalChromeVideoMuteLightOff: true,
                }
            });

            // Setup event handlers
            this.setupCallEvents();

            // Join the conversation
            await this.call.join({ url: conversationData.conversation_url });

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

    setupCallEvents() {
        // Handle participant joined (video track from Tavus)
        this.call.on('participant-joined', (event) => {
            console.log('Participant joined:', event.participant);
        });

        // Handle track started (audio/video from Tavus replica)
        this.call.on('track-started', (event) => {
            const { participant, track } = event;

            // Only handle remote participants (the Tavus replica)
            if (participant.local) return;

            console.log('Track started:', track.kind, 'from', participant.user_id);

            if (track.kind === 'video') {
                // Create video element for the Tavus avatar
                const videoElement = document.createElement('video');
                videoElement.id = 'agent-video';
                videoElement.className = 'voice-agent-video';
                videoElement.srcObject = new MediaStream([track]);
                videoElement.autoplay = true;
                videoElement.playsInline = true;

                // Remove existing video if any
                const existingVideo = document.getElementById('agent-video');
                if (existingVideo) existingVideo.remove();

                this.elements.videoContainer.appendChild(videoElement);
                this.elements.visualizer.classList.add('hidden');
            } else if (track.kind === 'audio') {
                // Create audio element for the Tavus avatar voice
                const audioElement = document.createElement('audio');
                audioElement.id = 'agent-audio';
                audioElement.srcObject = new MediaStream([track]);
                audioElement.autoplay = true;

                // Remove existing audio if any
                const existingAudio = document.getElementById('agent-audio');
                if (existingAudio) existingAudio.remove();

                document.body.appendChild(audioElement);
            }
        });

        // Handle track stopped
        this.call.on('track-stopped', (event) => {
            const { track, participant } = event;
            if (participant.local) return;

            if (track.kind === 'video') {
                const videoEl = document.getElementById('agent-video');
                if (videoEl) videoEl.remove();
                this.elements.visualizer.classList.remove('hidden');
            } else if (track.kind === 'audio') {
                const audioEl = document.getElementById('agent-audio');
                if (audioEl) audioEl.remove();
            }
        });

        // Handle app-message (tool calls from Tavus)
        this.call.on('app-message', async (event) => {
            console.log('Received app-message:', event);

            const message = event.data;
            const eventType = message.event_type || message.type;

            // Handle tool call events - check multiple possible event types
            if (eventType === 'conversation.tool_call'
                || eventType === 'tool_call'
                || message.tool_calls
                || message.function) {
                await this.handleToolCall(message);
            }

            // Handle utterance events (transcription)
            if (eventType === 'conversation.utterance' || eventType === 'utterance') {
                const role = message.properties?.role || message.role;
                const text = message.properties?.text || message.text;
                if (text) {
                    this.addTranscript(role === 'user' ? 'user' : 'agent', text);
                }
            }
        });

        // Handle disconnection
        this.call.on('left-meeting', () => {
            this.handleDisconnect();
        });

        // Handle errors
        this.call.on('error', (error) => {
            console.error('Daily call error:', error);
            this.updateStatus('Lỗi kết nối', 'error');
        });
    }

    async handleToolCall(message) {
        // Log full message to debug
        console.log('Full tool call message:', JSON.stringify(message, null, 2));

        // Try different possible paths for tool name and arguments
        const toolName = message.properties?.tool_name
            || message.properties?.name
            || message.tool_name
            || message.name
            || message.function?.name;
        const toolCallId = message.properties?.tool_call_id
            || message.inference_id
            || message.tool_call_id
            || message.id;

        let args = {};
        const argsSource = message.properties?.arguments
            || message.arguments
            || message.function?.arguments
            || message.properties;

        try {
            if (typeof argsSource === 'string') {
                args = JSON.parse(argsSource);
            } else if (typeof argsSource === 'object') {
                args = argsSource;
            }
        } catch (e) {
            console.error('Failed to parse tool arguments:', e);
        }

        console.log(`Tool call: ${toolName}`, args, `ID: ${toolCallId}`);

        let result = '';

        try {
            if (toolName === 'check_available_rooms') {
                const response = await fetch(`${AGENT_SERVER_URL}/api/tools/check_available_rooms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: args.date,
                        start_time: args.start_time,
                        duration_hours: args.duration_hours,
                        gender: args.gender
                    })
                });
                const data = await response.json();
                result = data.result;
                console.log("🚀 ~ VoiceAgent ~ handleToolCall ~ result:", result)
            } else if (toolName === 'create_booking') {
                const response = await fetch(`${AGENT_SERVER_URL}/api/tools/create_booking`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        room_ids: args.room_ids,
                        date: args.date,
                        start_time: args.start_time,
                        duration_hours: args.duration_hours,
                        customer_name: args.customer_name,
                        email: args.email
                    })
                });
                const data = await response.json();
                result = data.result;
                console.log("🚀 ~ VoiceAgent ~ handleToolCall ~ result:", result)
            } else {
                result = `Unknown tool: ${toolName}`;
            }
        } catch (error) {
            console.error('Tool execution error:', error);
            result = `Error executing tool: ${error.message}`;
        }

        // Send result back to Tavus
        this.sendToolResult(toolCallId, result);
    }

    sendToolResult(toolCallId, result) {
        // Use conversation.echo to send tool result back to Tavus
        // Based on Tavus documentation: https://docs.tavus.io/sections/event-schemas/conversation-echo
        const message = {
            message_type: 'conversation',
            event_type: 'conversation.echo',
            conversation_id: this.conversationId,
            properties: {
                modality: 'text',
                text: result,
                inference_id: toolCallId,
                done: true
            }
        };

        console.log('Sending tool result via echo:', message);
        this.call.sendAppMessage(message, '*');
    }

    handleDisconnect() {
        this.isConnected = false;
        this.conversationId = null;
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
        // End the Tavus conversation
        if (this.conversationId) {
            try {
                await fetch(`${AGENT_SERVER_URL}/endConversation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ conversation_id: this.conversationId })
                });
            } catch (e) {
                console.error('Failed to end conversation:', e);
            }
        }

        if (this.call) {
            await this.call.leave();
            await this.call.destroy();
            this.call = null;
        }
        this.handleDisconnect();
    }

    toggleMute() {
        if (!this.call) return;

        this.isMuted = !this.isMuted;
        this.call.setLocalAudio(!this.isMuted);

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

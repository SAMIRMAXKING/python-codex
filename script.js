class SmartCodingAssistant {
    constructor() {
        this.currentCode = '';
        this.currentAudio = null;
        this.currentAiResponse = '';
        this.isRunning = false;
        this.conversationHistory = [];
        this.audioSettings = {
            voice: 'ar-male',
            speed: 1.0,
            volume: 1.0,
            autoPlay: true
        };
        this.geminiApiKey = 'AIzaSyB90knXk3iB2bjzpW8Vi12nMnZxpfV9CBc';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadAudioSettings();
    }

    initializeElements() {
        // Editor elements
        this.codeEditor = document.getElementById('codeEditor');
        this.loadFileBtn = document.getElementById('loadFileBtn');
        this.saveFileBtn = document.getElementById('saveFileBtn');
        this.clearEditorBtn = document.getElementById('clearEditorBtn');
        this.fileInput = document.getElementById('fileInput');
        
        // Execution elements
        this.runCodeBtn = document.getElementById('runCodeBtn');
        this.clearOutputBtn = document.getElementById('clearOutputBtn');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.runningIndicator = document.getElementById('runningIndicator');
        this.statusText = document.getElementById('statusText');
        
        // AI elements
        this.explainCodeBtn = document.getElementById('explainCodeBtn');
        this.fixErrorsBtn = document.getElementById('fixErrorsBtn');
        this.optimizeCodeBtn = document.getElementById('optimizeCodeBtn');
        this.generateTestsBtn = document.getElementById('generateTestsBtn');
        this.securityCheckBtn = document.getElementById('securityCheckBtn');
        this.aiResponse = document.getElementById('aiResponse');
        
        // Audio elements
        this.voiceSelect = document.getElementById('voiceSelect');
        this.speedRange = document.getElementById('speedRange');
        this.speedLabel = document.getElementById('speedLabel');
        this.playAudioBtn = document.getElementById('playAudioBtn');
        this.pauseAudioBtn = document.getElementById('pauseAudioBtn');
        this.stopAudioBtn = document.getElementById('stopAudioBtn');
        this.audioPlayer = document.getElementById('audioPlayer');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        
        // New elements
        this.codePrompt = document.getElementById('codePrompt');
        this.generateCodeBtn = document.getElementById('generateCodeBtn');
        this.clearPromptBtn = document.getElementById('clearPromptBtn');
        this.generatedCodeSection = document.getElementById('generatedCodeSection');
        
        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendChatBtn = document.getElementById('sendChatBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        
        // Audio settings modal
        this.audioSettingsBtn = document.getElementById('audioSettingsBtn');
        this.audioSettingsModal = document.getElementById('audioSettingsModal');
        this.closeAudioSettings = document.getElementById('closeAudioSettings');
        this.saveAudioSettings = document.getElementById('saveAudioSettings');
        this.testAudioSettings = document.getElementById('testAudioSettings');
        this.volumeRange = document.getElementById('volumeRange');
        this.volumeLabel = document.getElementById('volumeLabel');
        this.autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
        
        // Audio buttons for each section
        this.generatorAudioBtn = document.getElementById('generatorAudioBtn');
        this.chatAudioBtn = document.getElementById('chatAudioBtn');
        this.editorAudioBtn = document.getElementById('editorAudioBtn');
        this.executionAudioBtn = document.getElementById('executionAudioBtn');
        this.analysisAudioBtn = document.getElementById('analysisAudioBtn');
    }

    setupEventListeners() {
        // Editor events
        this.loadFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.loadFile(e));
        this.saveFileBtn.addEventListener('click', () => this.saveFile());
        this.clearEditorBtn.addEventListener('click', () => this.clearEditor());
        
        // Execution events
        this.runCodeBtn.addEventListener('click', () => this.runCode());
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
        
        // AI events
        this.explainCodeBtn.addEventListener('click', () => this.explainCode());
        this.fixErrorsBtn.addEventListener('click', () => this.fixErrors());
        this.optimizeCodeBtn.addEventListener('click', () => this.optimizeCode());
        this.generateTestsBtn.addEventListener('click', () => this.generateTests());
        this.securityCheckBtn.addEventListener('click', () => this.securityCheck());
        
        // Audio events
        this.speedRange.addEventListener('input', () => this.updateSpeedLabel());
        this.playAudioBtn.addEventListener('click', () => this.playAudio());
        this.pauseAudioBtn.addEventListener('click', () => this.pauseAudio());
        this.stopAudioBtn.addEventListener('click', () => this.stopAudio());
        
        // Code generator events
        this.generateCodeBtn.addEventListener('click', () => this.generateCode());
        this.clearPromptBtn.addEventListener('click', () => this.clearPrompt());
        
        // Chat events
        this.sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // Audio settings events
        this.audioSettingsBtn.addEventListener('click', () => this.openAudioSettings());
        this.closeAudioSettings.addEventListener('click', () => this.closeAudioSettingsModal());
        this.saveAudioSettings.addEventListener('click', () => this.saveAudioSettingsData());
        this.testAudioSettings.addEventListener('click', () => this.testAudio());
        this.volumeRange.addEventListener('input', () => this.updateVolumeLabel());
        
        // Section audio buttons
        this.generatorAudioBtn.addEventListener('click', () => this.playGeneratorAudio());
        this.chatAudioBtn.addEventListener('click', () => this.playChatAudio());
        this.editorAudioBtn.addEventListener('click', () => this.playEditorAudio());
        this.executionAudioBtn.addEventListener('click', () => this.playExecutionAudio());
        this.analysisAudioBtn.addEventListener('click', () => this.playAnalysisAudio());
        
        // Click outside modal to close
        this.audioSettingsModal.addEventListener('click', (e) => {
            if (e.target === this.audioSettingsModal) {
                this.closeAudioSettingsModal();
            }
        });
        
        // Auto-save code
        this.codeEditor.addEventListener('input', () => {
            this.currentCode = this.codeEditor.value;
        });
    }

    initializeSpeechSynthesis() {
        this.updateSpeedLabel();
        this.pauseAudioBtn.disabled = true;
        this.stopAudioBtn.disabled = true;
    }

    // File Operations
    loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.py')) {
            this.showError('يرجى اختيار ملف بايثون (.py)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.codeEditor.value = e.target.result;
            this.currentCode = e.target.result;
            this.addToTerminal(`تم تحميل الملف: ${file.name}`, 'success');
        };
        reader.readAsText(file);
    }

    saveFile() {
        if (!this.currentCode) {
            this.showError('لا يوجد كود للحفظ');
            return;
        }

        const blob = new Blob([this.currentCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.py';
        a.click();
        URL.revokeObjectURL(url);
        
        this.addToTerminal('تم حفظ الملف بنجاح', 'success');
    }

    clearEditor() {
        this.codeEditor.value = '';
        this.currentCode = '';
        this.addToTerminal('تم مسح الكود', 'success');
    }

    // Code Execution
    async runCode() {
        const code = this.codeEditor.value.trim();
        if (!code) {
            this.showError('يرجى كتابة بعض الكود أولاً');
            return;
        }

        this.setRunningStatus(true);
        this.addToTerminal('بدء تشغيل الكود...', 'success');
        
        try {
            // Simulate code execution
            await this.simulateCodeExecution(code);
        } catch (error) {
            this.addToTerminal(`خطأ في التشغيل: ${error.message}`, 'error');
        } finally {
            this.setRunningStatus(false);
        }
    }

    async simulateCodeExecution(code) {
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple code analysis and simulation
        const lines = code.split('\n');
        let output = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('print(')) {
                const match = trimmed.match(/print\((.*)\)/);
                if (match) {
                    const content = match[1].replace(/['"]/g, '');
                    output.push(content);
                }
            }
        }
        
        if (output.length > 0) {
            output.forEach(line => this.addToTerminal(line, 'success'));
        } else {
            this.addToTerminal('تم تنفيذ الكود بنجاح', 'success');
        }
        
        // Check for common patterns
        if (code.includes('def ')) {
            this.addToTerminal('تم تعريف دالة جديدة', 'success');
        }
        if (code.includes('class ')) {
            this.addToTerminal('تم تعريف فئة جديدة', 'success');
        }
    }

    clearOutput() {
        this.terminalOutput.innerHTML = '';
        this.addToTerminal('تم مسح الناتج', 'success');
    }

    setRunningStatus(running) {
        this.isRunning = running;
        this.runCodeBtn.disabled = running;
        this.runningIndicator.className = running ? 'indicator running' : 'indicator';
        this.statusText.textContent = running ? 'قيد التشغيل...' : 'جاهز';
    }

    addToTerminal(message, type = 'normal') {
        const outputLine = document.createElement('div');
        outputLine.className = `output-line ${type}`;
        outputLine.textContent = `> ${message}`;
        this.terminalOutput.appendChild(outputLine);
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    // AI Operations
    async explainCode() {
        await this.performAIOperation('explain', 'شرح الكود');
    }

    async fixErrors() {
        await this.performAIOperation('fix', 'إصلاح الأخطاء');
    }

    async optimizeCode() {
        await this.performAIOperation('optimize', 'تحسين الكود');
    }

    async generateTests() {
        await this.performAIOperation('test', 'إنشاء اختبارات');
    }

    async securityCheck() {
        await this.performAIOperation('security', 'فحص أمني');
    }

    async performAIOperation(operation, operationName) {
        const code = this.codeEditor.value.trim();
        if (!code) {
            this.showError('يرجى كتابة بعض الكود أولاً');
            return;
        }

        this.showLoading(`جاري ${operationName}...`);
        
        try {
            const response = await this.callAIService(operation, code);
            this.displayAIResponse(response);
            this.currentAiResponse = response;
        } catch (error) {
            this.showError(`خطأ في ${operationName}: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    async callAIService(operation, code) {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const systemPrompts = {
            explain: `أنت مساعد برمجة ذكي. اشرح الكود التالي باللغة العربية بطريقة واضحة ومفصلة:

${code}

قم بشرح:
1. الغرض من الكود
2. كيفية عمل كل جزء
3. المفاهيم المستخدمة
4. أي نصائح مفيدة`,
            
            fix: `أنت مساعد برمجة ذكي. راجع الكود التالي وأصلح أي أخطاء محتملة:

${code}

قم بـ:
1. تحديد الأخطاء الموجودة
2. تقديم الحلول المناسبة
3. شرح سبب كل خطأ
4. تقديم الكود المصحح`,
            
            optimize: `أنت مساعد برمجة ذكي. قم بتحسين الكود التالي:

${code}

قم بـ:
1. تحسين الأداء
2. تحسين القراءة والفهم
3. تطبيق أفضل الممارسات
4. تقديم الكود المحسن مع التوضيحات`,
            
            test: `أنت مساعد برمجة ذكي. قم بإنشاء اختبارات للكود التالي:

${code}

قم بـ:
1. إنشاء اختبارات شاملة
2. تغطية الحالات المختلفة
3. اختبار الحالات الاستثنائية
4. تقديم كود الاختبارات مع التوضيحات`,
            
            security: `أنت مساعد برمجة ذكي متخصص في الأمان. قم بفحص الكود التالي:

${code}

قم بـ:
1. تحديد المشاكل الأمنية المحتملة
2. تقديم التوصيات الأمنية
3. شرح المخاطر المحتملة
4. تقديم الحلول الآمنة`
        };

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "أنت مساعد برمجة ذكي متخصص في لغة Python. أجب باللغة العربية بطريقة واضحة ومفيدة."
                },
                {
                    role: "user",
                    content: systemPrompts[operation]
                }
            ]
        });

        return completion.content;
    }

    displayAIResponse(response) {
        this.aiResponse.innerHTML = `
            <div class="ai-response-content">
                <div class="ai-icon">🤖</div>
                <div style="white-space: pre-wrap;">${response}</div>
            </div>
        `;
    }

    // Code Generation
    async generateCode() {
        const prompt = this.codePrompt.value.trim();
        if (!prompt) {
            this.showError('يرجى كتابة وصف الكود أولاً');
            return;
        }

        this.showLoading('جاري إنشاء الكود...');
        this.generateCodeBtn.disabled = true;
        
        try {
            const response = await this.callGeminiAPI(`قم بإنشاء كود Python بناءً على الوصف التالي:

${prompt}

يرجى:
1. كتابة كود Python واضح ومفهوم
2. إضافة تعليقات باللغة العربية
3. التأكد من أن الكود يعمل بشكل صحيح
4. إضافة مثال للاستخدام إذا كان ذلك مناسباً

الكود فقط بدون شرح إضافي:`);
            
            this.displayGeneratedCode(response);
            
            if (this.audioSettings.autoPlay) {
                this.currentAiResponse = `تم إنشاء الكود بنجاح. ${response}`;
                setTimeout(() => this.playAudio(), 500);
            }
            
        } catch (error) {
            this.showError(`خطأ في إنشاء الكود: ${error.message}`);
        } finally {
            this.hideLoading();
            this.generateCodeBtn.disabled = false;
        }
    }

    displayGeneratedCode(code) {
        this.generatedCodeSection.innerHTML = `
            <div class="generated-code-display">${code}</div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="assistant.copyToEditor()">نسخ إلى المحرر</button>
                <button class="btn btn-secondary" onclick="assistant.copyToClipboard()">نسخ للحافظة</button>
            </div>
        `;
    }

    copyToEditor() {
        const codeDisplay = this.generatedCodeSection.querySelector('.generated-code-display');
        if (codeDisplay) {
            this.codeEditor.value = codeDisplay.textContent;
            this.currentCode = codeDisplay.textContent;
            this.addToTerminal('تم نسخ الكود إلى المحرر', 'success');
        }
    }

    copyToClipboard() {
        const codeDisplay = this.generatedCodeSection.querySelector('.generated-code-display');
        if (codeDisplay) {
            navigator.clipboard.writeText(codeDisplay.textContent);
            this.addToTerminal('تم نسخ الكود للحافظة', 'success');
        }
    }

    clearPrompt() {
        this.codePrompt.value = '';
        this.generatedCodeSection.innerHTML = `
            <div class="code-placeholder">
                <div class="ai-icon">🎯</div>
                <p>اكتب وصف الكود الذي تريده وسيتم إنشاؤه فورًا</p>
            </div>
        `;
    }

    // Chat System
    async sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.addChatMessage(message, 'user');
        this.chatInput.value = '';
        
        this.showLoading('جاري الرد...');
        
        try {
            const response = await this.callGeminiAPI(message);
            this.addChatMessage(response, 'ai');
            
            if (this.audioSettings.autoPlay) {
                this.currentAiResponse = response;
                setTimeout(() => this.playAudio(), 500);
            }
            
        } catch (error) {
            this.addChatMessage(`عذراً، حدث خطأ: ${error.message}`, 'ai');
        } finally {
            this.hideLoading();
        }
    }

    addChatMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div style="white-space: pre-wrap;">${content}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>مرحبًا! أنا Gemini، مساعدك البرمجي الذكي. يمكنني مساعدتك في:</p>
                    <ul>
                        <li>إنشاء أكواد Python مخصصة</li>
                        <li>شرح المفاهيم البرمجية</li>
                        <li>حل المشاكل التقنية</li>
                        <li>تحسين الأكواد الموجودة</li>
                    </ul>
                </div>
            </div>
        `;
        this.conversationHistory = [];
    }

    // Gemini API Integration
    async callGeminiAPI(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت مساعد برمجي ذكي متخصص في لغة Python. أجب باللغة العربية بطريقة واضحة ومفيدة.\n\n${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`خطأ في الاتصال بـ Gemini: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('لم يتم الحصول على رد من Gemini');
        }
    }

    // Audio Settings Management
    openAudioSettings() {
        this.audioSettingsModal.style.display = 'flex';
        this.loadAudioSettingsToModal();
    }

    closeAudioSettingsModal() {
        this.audioSettingsModal.style.display = 'none';
    }

    loadAudioSettingsToModal() {
        this.voiceSelect.value = this.audioSettings.voice;
        this.speedRange.value = this.audioSettings.speed;
        this.volumeRange.value = this.audioSettings.volume;
        this.autoPlayCheckbox.checked = this.audioSettings.autoPlay;
        this.updateSpeedLabel();
        this.updateVolumeLabel();
    }

    saveAudioSettingsData() {
        this.audioSettings = {
            voice: this.voiceSelect.value,
            speed: parseFloat(this.speedRange.value),
            volume: parseFloat(this.volumeRange.value),
            autoPlay: this.autoPlayCheckbox.checked
        };
        
        localStorage.setItem('audioSettings', JSON.stringify(this.audioSettings));
        this.closeAudioSettingsModal();
        this.addToTerminal('تم حفظ إعدادات الصوت', 'success');
    }

    loadAudioSettings() {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            this.audioSettings = JSON.parse(saved);
        }
        this.updateSpeedLabel();
        this.updateVolumeLabel();
    }

    // Audio Operations
    updateSpeedLabel() {
        const speed = parseFloat(this.speedRange.value);
        this.speedLabel.textContent = `${speed.toFixed(1)}x`;
    }

    async playAudio() {
        if (!this.currentAiResponse) {
            this.showError('لا يوجد نص للتشغيل');
            return;
        }

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        this.setAudioButtonsState(true);
        
        try {
            const cleanText = this.cleanTextForSpeech(this.currentAiResponse);
            
            const result = await websim.textToSpeech({
                text: cleanText,
                voice: this.audioSettings.voice,
                speed: this.audioSettings.speed
            });

            const audio = new Audio(result.url);
            audio.volume = this.audioSettings.volume;
            this.currentAudio = audio;

            audio.onplay = () => {
                this.setAudioButtonsState(true);
            };

            audio.onended = () => {
                this.setAudioButtonsState(false);
                this.currentAudio = null;
            };

            audio.onerror = (error) => {
                console.error('خطأ في تشغيل الصوت:', error);
                this.showError('حدث خطأ في تشغيل الصوت');
                this.setAudioButtonsState(false);
                this.currentAudio = null;
            };

            audio.play();

        } catch (error) {
            console.error('خطأ في إنشاء الصوت:', error);
            this.showError('حدث خطأ في إنشاء الصوت');
            this.setAudioButtonsState(false);
        }
    }

    pauseAudio() {
        if (this.currentAudio) {
            if (this.currentAudio.paused) {
                this.currentAudio.play();
                this.pauseAudioBtn.innerHTML = '⏸️ إيقاف مؤقت';
            } else {
                this.currentAudio.pause();
                this.pauseAudioBtn.innerHTML = '▶️ متابعة';
            }
        }
    }

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.setAudioControlsState(false);
        this.audioPlayer.innerHTML = `
            <div style="text-align: center; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🔊</div>
                <p>جاهز للتشغيل</p>
            </div>
        `;
    }

    setAudioControlsState(playing) {
        this.playAudioBtn.disabled = playing;
        this.pauseAudioBtn.disabled = !playing;
        this.stopAudioBtn.disabled = !playing;
        
        if (!playing) {
            this.playAudioBtn.innerHTML = '🔊 تشغيل الصوت';
            this.pauseAudioBtn.innerHTML = '⏸️ إيقاف مؤقت';
        }
    }

    setAudioButtonsState(playing) {
        const audioButtons = document.querySelectorAll('.btn-audio');
        audioButtons.forEach(btn => {
            if (playing) {
                btn.classList.add('playing');
            } else {
                btn.classList.remove('playing');
            }
        });
    }

    cleanTextForSpeech(text) {
        // Remove code blocks and technical symbols for better speech
        return text
            .replace(/```[\s\S]*?```/g, ' كود برمجي ')
            .replace(/`[^`]+`/g, ' كود ')
            .replace(/def\s+\w+\s*\(/g, 'تعريف دالة ')
            .replace(/class\s+\w+/g, 'تعريف فئة ')
            .replace(/import\s+\w+/g, 'استيراد مكتبة ')
            .replace(/print\s*\(/g, 'طباعة ')
            .replace(/if\s+/g, 'إذا كان ')
            .replace(/else:/g, 'وإلا ')
            .replace(/for\s+/g, 'لكل ')
            .replace(/while\s+/g, 'بينما ')
            .replace(/return\s+/g, 'إرجاع ')
            .replace(/\{[\s\S]*?\}/g, ' ')
            .replace(/\[[\s\S]*?\]/g, ' ')
            .replace(/[{}[\]()]/g, ' ')
            .replace(/[#@$%^&*+=|\\:";'<>?,./]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Utility Methods
    showLoading(message = 'جاري المعالجة...') {
        this.loadingText.textContent = message;
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        alert(message);
        this.addToTerminal(message, 'error');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.assistant = new SmartCodingAssistant();
});
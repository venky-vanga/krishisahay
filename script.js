class FramerBot {
  constructor() {
    this.chat = document.getElementById('chat');
    this.queryInput = document.getElementById('query');
    this.sendBtn = document.getElementById('sendBtn');
    this.uploadZone = document.getElementById('uploadZone');
    this.fileInput = document.getElementById('fileInput');
    this.fileList = document.getElementById('fileList');
    
    this.files = [];
    this.isTyping = false;
    
    // Smart analysis patterns
    this.framerPatterns = {
      navbar: ['nav', 'navbar', 'menu', 'header', 'navigation'],
      hero: ['hero', 'landing', 'banner', 'header section', 'main section'],
      pricing: ['price', 'pricing', 'plan', 'subscription'],
      testimonial: ['testimonial', 'review', 'customer', 'feedback'],
      form: ['form', 'contact', 'signup', 'login'],
      button: ['button', 'cta', 'call to action'],
      card: ['card', 'product', 'feature'],
      animation: ['animate', 'animation', 'motion', 'transition'],
      responsive: ['responsive', 'mobile', 'tablet', 'adaptive']
    };
    
    this.initEventListeners();
    this.addWelcomeMessage();
  }

  // INSTANT QUESTION ANALYSIS
  analyzeQuery(query) {
    query = query.toLowerCase();
    
    // Detect Framer component type
    for (const [type, keywords] of Object.entries(this.framerPatterns)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return {
          type,
          confidence: 0.8,
          suggestion: `Detected ${type} component request. Generating optimized Framer ${type}...`
        };
      }
    }
    
    // Quick responses for common questions
    if (query.includes('help') || query.includes('how')) {
      return {
        instant: true,
        response: "I'm ready to generate perfect Framer code! Ask me to create navbars, heroes, pricing tables, or upload your Framer files for analysis.",
        suggestion: "Try: 'Create responsive navbar' or upload your project files!"
      };
    }
    
    if (query.includes('example') || query.includes('sample')) {
      return {
        instant: true,
        response: "Here are popular Framer components I can create:\n• Responsive Navbar\n• Hero Section\n• Pricing Cards\n• Testimonial Carousel\n• Contact Forms",
        suggestion: "Pick one or describe your component!"
      };
    }
    
    return { confidence: 0.3 };
  }

  // ENHANCED QUERY PROCESSING
  async prepareSmartQuery() {
    let baseQuery = this.queryInput.value.trim();
    
    // Instant analysis
    const analysis = this.analyzeQuery(baseQuery);
    if (analysis.instant) {
      this.addBotMessage(analysis.response);
      this.addUserMessage(analysis.suggestion, true);
      return '';
    }
    
    // File context
    if (this.files.length > 0) {
      const fileNames = this.files.slice(0, 3).map(f => f.name).join(', ');
      baseQuery = `${baseQuery}\n\nCONTEXT: Analyze these Framer files: ${fileNames}\nGenerate compatible code components.`;
    }
    
    // Smart enhancements
    if (analysis.type) {
      baseQuery = `Create a professional Framer ${analysis.type} component. ${baseQuery}\nInclude: PropertyControls, responsive design, smooth animations, best practices.`;
    }
    
    return baseQuery;
  }

  initEventListeners() {
    // Send button
    this.sendBtn.addEventListener('click', () => this.sendQuery());
    
    // Real-time analysis on typing
    this.queryInput.addEventListener('input', (e) => {
      this.analyzeLive(e.target.value);
    });
    
    // Enter + Ctrl to send
    this.queryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) this.sendQuery();
    });

    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.queryInput.value = e.currentTarget.dataset.query;
        this.sendQuery();
      });
    });

    // File upload events
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    this.uploadZone.addEventListener('click', () => this.fileInput.click());
    
    // Drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      this.uploadZone.addEventListener(event, this.handleDragEvents.bind(this));
    });

    // Auto-resize textarea
    this.queryInput.addEventListener('input', this.autoResize.bind(this));
  }

  // LIVE QUERY ANALYSIS (Real-time suggestions)
  analyzeLive(query) {
    if (query.length < 3 || this.isTyping) return;
    
    this.isTyping = true;
    setTimeout(() => {
      const analysis = this.analyzeQuery(query);
      
      // Show typing indicator briefly
      if (analysis.confidence > 0.6) {
        this.showTypingIndicator();
      }
      
      this.isTyping = false;
    }, 500);
  }

  showTypingIndicator() {
    const existingIndicator = this.chat.querySelector('.typing-indicator');
    if (existingIndicator) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
      <small>Analyzing your Framer request...</small>
    `;
    this.chat.appendChild(indicator);
    this.chat.scrollTop = this.chat.scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = this.chat.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }

  handleDragEvents(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      this.uploadZone.classList.add('dragover');
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      this.uploadZone.classList.remove('dragover');
    }
    
    if (e.type === 'drop') {
      this.handleFiles(e.dataTransfer.files);
    }
  }

  handleFiles(fileList) {
    this.files = Array.from(fileList).filter(file => 
      file.name.match(/\.(framer|json|zip|txt|js|jsx|ts|tsx)$/i)
    );
    this.displayFiles();
    this.addBotMessage(`📁 ${this.files.length} Framer-compatible file(s) loaded for analysis!`);
  }

  displayFiles() {
    this.fileList.innerHTML = '';
    
    this.files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span><i class="fas fa-file"></i> ${file.name} (${(file.size/1024).toFixed(1)}KB)</span>
        <button onclick="framerBot.removeFile(${index})" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      `;
      this.fileList.appendChild(fileItem);
    });
  }

  removeFile(index) {
    this.files.splice(index, 1);
    this.displayFiles();
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  autoResize() {
    this.queryInput.style.height = 'auto';
    this.queryInput.style.height = Math.min(this.queryInput.scrollHeight, 200) + 'px';
  }

  async sendQuery() {
    const query = await this.prepareSmartQuery();
    if (!query) return;

    this.hideTypingIndicator();
    this.sendBtn.disabled = true;
    this.sendBtn.querySelector('span').textContent = 'Generating Perfect Framer Code...';
    this.sendBtn.querySelector('.loading').style.display = 'block';
    
    this.addUserMessage(query);
    this.queryInput.value = '';

    try {
      const formData = new FormData();
      formData.append('query', query);
      this.files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/framer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      const copyBtn = `<button class="copy-btn" onclick="navigator.clipboard.writeText(\`${this.escapeHtml(data.code)}\`).then(() => {
        this.textContent='✅ Copied!';
        setTimeout(() => this.textContent='Copy Code', 2000);
      })">Copy Code</button>`;
      
      this.addBotMessage(`
        <strong>✅ Perfect Framer Code Generated:</strong><br>
        ${copyBtn}
        <div class="code">${this.escapeHtml(data.code)}</div>
      `);
      
      // Clear files after successful generation
      this.files = [];
      this.displayFiles();
      
    } catch (error) {
      console.error('Error:', error);
      this.addBotMessage('<strong>❌ Error:</strong> Failed to generate code. Please check your OpenAI key and try again.');
    } finally {
      this.sendBtn.disabled = false;
      this.sendBtn.querySelector('span').textContent = 'Generate Code';
      this.sendBtn.querySelector('.loading').style.display = 'none';
    }
  }

  // MESSAGE HELPERS
  addWelcomeMessage() {
    this.addBotMessage(`
      <div class="welcome-message">
        <i class="fas fa-magic"></i>
        <h3>🚀 Welcome to FramerBot!</h3>
        <p>I'm analyzing your questions instantly. Try:</p>
        <div style="margin-top: 1rem; font-size: 14px;">
          • "responsive navbar"<br>
          • "hero section animation"<br>
          • Upload Framer files for analysis
        </div>
      </div>
    `);
  }

  addUserMessage(content, scroll = true) {
    const message = document.createElement('div');
    message.className = `message user`;
    message.innerHTML = `<strong>You:</strong> ${this.escapeHtml(content)}`;
    this.chat.appendChild(message);
    if (scroll) this.scrollToBottom();
  }

  addBotMessage(content, scroll = true) {
    const message = document.createElement('div');
    message.className = `message bot`;
    message.innerHTML = content;
    this.chat.appendChild(message);
    if (scroll) this.scrollToBottom();
  }

  scrollToBottom() {
    this.chat.scrollTop = this.chat.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

const framerBot = new FramerBot();


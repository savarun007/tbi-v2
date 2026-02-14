document.addEventListener("DOMContentLoaded", () => {
  // --- SAFE INITIALIZATION ---
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      body.classList.add("light-mode");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("light-mode");
      if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
      } else {
        localStorage.setItem("theme", "dark");
      }
    });
  }

  document.addEventListener("mousemove", (e) => {
    const cursorLight = document.querySelector(".cursor-light");
    if (cursorLight) {
      cursorLight.style.left = e.clientX + "px";
      cursorLight.style.top = e.clientY + "px";
    }
  });

  applySavedTheme();
  initializeFloatingImages();

  if (document.querySelector(".slideshow-container")) {
    initializeSlideshow();
  }
  if (document.querySelector(".chat-container")) {
    initializeChatbot();
  }
  if (document.querySelector(".prediction-container")) {
    initializePredictionPage();
  }
});

// --- Slideshow Logic ---
let slideIndex = 1;
let autoSlideTimeout;

function initializeSlideshow() {
  generateDots();
  showSlides(slideIndex);
}

function generateDots() {
  const slides = document.getElementsByClassName("slide-card");
  const dotsContainer = document.querySelector(".dots-container");
  if (!dotsContainer) return;
  dotsContainer.innerHTML = "";
  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.setAttribute("onclick", `currentSlide(${i + 1})`);
    dotsContainer.appendChild(dot);
  }
}

function plusSlides(n) {
  clearTimeout(autoSlideTimeout);
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  clearTimeout(autoSlideTimeout);
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide-card");
  let dots = document.getElementsByClassName("dot");
  if (slides.length === 0 || dots.length === 0) return;

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active-slide");
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].classList.add("active-slide");
  dots[slideIndex - 1].className += " active";

  autoSlideTimeout = setTimeout(() => plusSlides(1), 20000);
}

// --- FLOATING IMAGE ANIMATION LOGIC ---
// let images = [];

// function initializeFloatingImages() {
//   const imageElements = document.querySelectorAll(".floating-img");
//   imageElements.forEach((img) => {
//     images.push({
//       element: img,
//       x: Math.random() * (window.innerWidth - 150),
//       y: Math.random() * (window.innerHeight - 150),
//       dx: (Math.random() - 0.5) * 1,
//       dy: (Math.random() - 0.5) * 1,
//     });
//   });

//   if (images.length > 0) {
//     animate();
//   }
// }

// function animate() {
//   images.forEach((img, index) => {
//     img.x += img.dx;
//     img.y += img.dy;

//     if (img.x <= 0 || img.x >= window.innerWidth - 150) img.dx *= -1;
//     if (img.y <= 0 || img.y >= window.innerHeight - 150) img.dy *= -1;

//     img.element.style.transform = `translate(${img.x}px, ${img.y}px)`;
//   });

//   requestAnimationFrame(animate);
// }

// --- FLOATING IMAGE ANIMATION LOGIC ---
let images = [];

function initializeFloatingImages() {
  const imageElements = document.querySelectorAll(".floating-img");
  imageElements.forEach((img) => {
    // Random position
    let x = Math.random() * (window.innerWidth - 150);
    let y = Math.random() * (window.innerHeight - 150);

    // Set consistent speed for ALL pages (increased from * 1 to * 3)
    let dx = (Math.random() - 0.5) * 3;
    let dy = (Math.random() - 0.5) * 3;

    images.push({
      element: img,
      x: x,
      y: y,
      dx: dx,
      dy: dy,
      radius: 75, // Half of the 150px width
    });
  });

  if (images.length > 0) {
    animate();
  }
}

function animate() {
  images.forEach((img, i) => {
    // 1. Move the image
    img.x += img.dx;
    img.y += img.dy;

    // 2. Wall Collisions (Bounce off edges)
    if (img.x <= 0 || img.x >= window.innerWidth - 150) {
      img.dx *= -1;
      // Keep inside bounds
      img.x = Math.max(0, Math.min(img.x, window.innerWidth - 150));
    }
    if (img.y <= 0 || img.y >= window.innerHeight - 150) {
      img.dy *= -1;
      img.y = Math.max(0, Math.min(img.y, window.innerHeight - 150));
    }

    // 3. Object-to-Object Collision (Conservation of Momentum)
    for (let j = i + 1; j < images.length; j++) {
      const otherImg = images[j];

      // Calculate distance between centers
      // Note: Center is x + radius, y + radius
      const dx = otherImg.x + otherImg.radius - (img.x + img.radius);
      const dy = otherImg.y + otherImg.radius - (img.y + img.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = img.radius + otherImg.radius; // 150px

      if (distance < minDistance) {
        // --- Collision Detected ---

        // A. Resolve Overlap (prevent sticking)
        // Move them apart so they are just touching
        const overlap = minDistance - distance;
        const offsetX = (dx / distance) * overlap * 0.5;
        const offsetY = (dy / distance) * overlap * 0.5;

        img.x -= offsetX;
        img.y -= offsetY;
        otherImg.x += offsetX;
        otherImg.y += offsetY;

        // B. Elastic Collision Physics
        // 1. Normal Vector (direction of collision)
        const nx = dx / distance;
        const ny = dy / distance;

        // 2. Relative Velocity
        const kx = img.dx - otherImg.dx;
        const ky = img.dy - otherImg.dy;

        // 3. Velocity along the normal
        const p = kx * nx + ky * ny;

        // 4. Swap velocities along normal (Masses are equal)
        img.dx = img.dx - p * nx;
        img.dy = img.dy - p * ny;
        otherImg.dx = otherImg.dx + p * nx;
        otherImg.dy = otherImg.dy + p * ny;
      }
    }

    // Apply positions
    img.element.style.transform = `translate(${img.x}px, ${img.y}px)`;
  });

  requestAnimationFrame(animate);
}
// --- CHATBOT LOGIC ---
// function initializeChatbot() {
//   const chatBox = document.getElementById("chat-box");
//   const userInput = document.getElementById("user-input");
//   const sendButton = document.getElementById("send-button");
//   const suggestionsContainer = document.getElementById("suggestion-cards");
//   const suggestions = [
//     "What is an Epidural Hemorrhage?",
//     "Tell me about Subdural Hemorrhage.",
//     "Explain Subarachnoid Hemorrhage.",
//     "What are the signs of IPH?",
//   ];

//   if (suggestionsContainer) {
//     suggestions.forEach((text) => {
//       const card = document.createElement("div");
//       card.className = "suggestion-card";
//       card.textContent = text;
//       card.onclick = () => {
//         userInput.value = text;
//         sendMessage();
//       };
//       suggestionsContainer.appendChild(card);
//     });
//   }

//   addMessageToBox(
//     "Hello! I'm the TBiDx Assistant. How can I help you understand different types of Traumatic Brain Injuries today?",
//     "bot",
//   );

//   if (sendButton) sendButton.addEventListener("click", sendMessage);
//   if (userInput)
//     userInput.addEventListener("keypress", (e) => {
//       if (e.key === "Enter") sendMessage();
//     });

//   async function sendMessage() {
//     const messageText = userInput.value.trim();
//     if (!messageText) return;

//     addMessageToBox(messageText, "user");
//     userInput.value = "";
//     if (suggestionsContainer) suggestionsContainer.style.display = "none";

//     try {
//       // THIS IS THE CORRECTED PATH FOR DEPLOYMENT
//       const response = await fetch("/summarise/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ diagnosis: messageText }),
//       });

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       const botReply =
//         data.summary || data.error || "Sorry, I couldn't get a response.";
//       addMessageToBox(botReply, "bot");
//     } catch (error) {
//       console.error("Error fetching from API:", error);
//       addMessageToBox(
//         "I'm having trouble connecting to my knowledge base. Please try again later.",
//         "bot",
//       );
//     }
//   }

//   function addMessageToBox(text, sender) {
//     if (!chatBox) return;
//     if (sender === "user") {
//       const messageElement = document.createElement("div");
//       messageElement.className = "chat-message user";
//       messageElement.textContent = text;
//       chatBox.appendChild(messageElement);
//     } else {
//       const botMessageContainer = document.createElement("div");
//       botMessageContainer.className = "bot-message-container";
//       const iconElement = document.createElement("div");
//       iconElement.className = "bot-icon";
//       iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="8" height="8" rx="2"/><path d="M8 12v-2a2 2 0 1 1 4 0v2"/></svg>`;
//       const messageElement = document.createElement("div");
//       messageElement.className = "chat-message bot";
//       if (typeof marked !== "undefined") {
//         messageElement.innerHTML = marked.parse(text);
//       } else {
//         messageElement.textContent = text;
//       }
//       botMessageContainer.appendChild(iconElement);
//       botMessageContainer.appendChild(messageElement);
//       chatBox.appendChild(botMessageContainer);
//     }
//     chatBox.scrollTop = chatBox.scrollHeight;
//   }
// }
// --- CHATBOT LOGIC ---
function initializeChatbot() {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const suggestionsContainer = document.getElementById("suggestion-cards");

  // Safety check: If we are not on the chatbot page, stop.
  if (!chatBox) return;

  // 1. Check for "Analyze" Context from Prediction Page
  const pendingDiagnosis = localStorage.getItem("current_diagnosis");

  if (pendingDiagnosis) {
    localStorage.removeItem("current_diagnosis");
    const analysisPrompt = `I have just been diagnosed with ${pendingDiagnosis} by the TBiDx system. Please explain what this is, how serious it is, and what the next steps should be.`;

    // Add user message visually
    addMessageToBox(analysisPrompt, "user");
    // Send to backend
    fetchReply(analysisPrompt, pendingDiagnosis);
  } else {
    // Check if welcome message already exists to avoid duplicates
    if (chatBox.children.length === 0) {
      addMessageToBox(
        "Hello! I'm the TBiDx Assistant. How can I help you understand different types of Traumatic Brain Injuries today?",
        "bot",
      );
    }
  }

  // 2. Event Listeners
  if (suggestionsContainer) {
    // Clear existing suggestions to avoid duplicates
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.style.display = "flex"; // Force it to show!
    const suggestions = [
      "What is an Epidural Hemorrhage?",
      "Tell me about Subdural Hemorrhage.",
      "Explain Subarachnoid Hemorrhage.",
      "What are the signs of IPH?",
    ];
    suggestions.forEach((text) => {
      const card = document.createElement("div");
      card.className = "suggestion-card";
      card.textContent = text;
      card.onclick = () => {
        userInput.value = text;
        sendMessage();
      };
      suggestionsContainer.appendChild(card);
    });
  }

  if (sendButton) {
    // Remove old listeners to prevent double-firing
    const newBtn = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newBtn, sendButton);
    newBtn.addEventListener("click", sendMessage);
  }

  if (userInput) {
    // Remove old listeners
    const newInput = userInput.cloneNode(true);
    userInput.parentNode.replaceChild(newInput, userInput);
    newInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
    // Re-assign the variable to the new element
    // Note: In strict scope this might need handling, but for this script it's fine.
    // Better approach is just adding the listener once, but cloning ensures a clean slate.
    newInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  function sendMessage() {
    // Re-select userInput in case it was cloned
    const inputField = document.getElementById("user-input");
    const messageText = inputField.value.trim();
    if (!messageText) return;

    addMessageToBox(messageText, "user");
    inputField.value = "";

    // Hide suggestions
    const suggestions = document.getElementById("suggestion-cards");
    if (suggestions) suggestions.style.display = "none";

    fetchReply(messageText);
  }

  async function fetchReply(message, context = "") {
    const typingId = "typing-" + Date.now();
    addMessageToBox("Thinking...", "bot", typingId);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, context: context }),
      });

      const data = await response.json();

      // Remove typing indicator safely
      const typingElement = document.getElementById(typingId);
      if (typingElement) {
        // The typing element is the bubble. We want to remove its container (bot-message-container).
        // Structure: container -> [icon, bubble]
        const container = typingElement.parentElement;
        if (
          container &&
          container.classList.contains("bot-message-container")
        ) {
          container.remove();
        }
      }

      addMessageToBox(data.reply, "bot");
    } catch (error) {
      console.error("Chat Error:", error);
      const typingElement = document.getElementById(typingId);
      if (typingElement) {
        const container = typingElement.parentElement;
        if (container) container.remove();
      }
      addMessageToBox("Sorry, I can't connect to the server right now.", "bot");
    }
  }

  function addMessageToBox(text, sender, id = null) {
    const box = document.getElementById("chat-box"); // Re-fetch to be safe
    if (!box) return;

    // Create Container
    const container = document.createElement("div");

    if (sender === "bot") {
      container.className = "bot-message-container";

      // Icon
      const icon = document.createElement("div");
      icon.className = "bot-icon";
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="8" height="8" rx="2"/><path d="M8 12v-2a2 2 0 1 1 4 0v2"/></svg>`;

      // Message Bubble
      const bubble = document.createElement("div");
      bubble.className = "chat-message bot";
      if (id) bubble.id = id;

      // Render Markdown if available
      if (typeof marked !== "undefined" && !id) {
        bubble.innerHTML = marked.parse(text);
      } else {
        bubble.textContent = text;
      }

      container.appendChild(icon);
      container.appendChild(bubble);
      box.appendChild(container); // APPEND, do not overwrite
    } else {
      // User Message
      const bubble = document.createElement("div");
      bubble.className = "chat-message user";
      bubble.textContent = text;
      box.appendChild(bubble); // APPEND, do not overwrite
    }

    // Scroll to bottom
    box.scrollTop = box.scrollHeight;
  }
}
// --- PREDICTION PAGE LOGIC ---
function initializePredictionPage() {
  const uploadBox = document.getElementById("upload-box");
  const imageUpload = document.getElementById("image-upload");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container",
  );
  const imagePreview = document.getElementById("image-preview");
  const resultsContainer = document.getElementById("results-container");
  const summaryContainer = document.getElementById("summary-container");
  const loader = document.getElementById("loader");

  if (imageUpload)
    imageUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    });

  if (uploadBox) {
    uploadBox.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadBox.classList.add("dragover");
    });
    uploadBox.addEventListener("dragleave", () => {
      uploadBox.classList.remove("dragover");
    });
    uploadBox.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadBox.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";
      uploadBox.style.display = "none";
    };
    reader.readAsDataURL(file);

    resultsContainer.innerHTML = "";
    summaryContainer.innerHTML = "";

    getPredictions(file);
  }

  async function getPredictions(file) {
    loader.style.display = "block";
    const formData = new FormData();
    formData.append("file", file);

    try {
      // THIS IS THE CORRECTED PATH FOR DEPLOYMENT
      const response = await fetch("/predict/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      displayResults(data.results);
    } catch (error) {
      console.error("Error getting predictions:", error);
      resultsContainer.innerHTML = `<p style="color: red; text-align: center;">Failed to get predictions. Please ensure the backend server is running and try again.</p>`;
    } finally {
      loader.style.display = "none";
    }
  }

  // function displayResults(results) {
  //   resultsContainer.innerHTML = "";
  //   results.forEach((result) => {
  //     const infoHtml = result.info
  //       ? `
  //       <div class="info-section">
  //           <h4>Description</h4>
  //           <p>${result.info.description}</p>
  //           <h4>Common Cause</h4>
  //           <p>${result.info.cause}</p>
  //           <h4>Potential Treatment</h4>
  //           <p>${result.info.treatment}</p>
  //       </div>
  //   `
  //       : "<p>No detailed information available.</p>";

  //     const cardHtml = `
  //       <div class="result-card">
  //           <h3>${result.model_name.replace(/_/g, " ").toUpperCase()}</h3>
  //           <p class="prediction">${result.prediction}</p>
  //           <p class="confidence-text" style="text-align:center; font-size: 0.8rem; opacity: 0.8;">Confidence: ${
  //             result.confidence
  //           }%</p>
  //           <div class="confidence-bar-container">
  //               <div class="confidence-bar" style="width: ${
  //                 result.confidence
  //               }%;"></div>
  //           </div>
  //           ${infoHtml}
  //       </div>
  //   `;
  //     resultsContainer.innerHTML += cardHtml;
  //   });
  // In script.js, inside the displayResults function

  // function displayResults(results) {
  //   resultsContainer.innerHTML = "";
  //   results.forEach((result) => {
  //     // Add a new block for the Grad-CAM image
  //     const gradCamHtml = result.grad_cam_image
  //       ? `
  //       <div class="grad-cam-container">
  //           <h4>Grad-CAM Visualization</h4>
  //           <img src="data:image/jpeg;base64,${result.grad_cam_image}" alt="Grad-CAM" class="grad-cam-image"/>
  //       </div>
  //       `
  //       : "";

  //     const infoHtml = result.info
  //       ? `
  //       <div class="info-section">
  //           <h4>Description</h4>
  //           <p>${result.info.description}</p>
  //           <h4>Common Cause</h4>
  //           <p>${result.info.cause}</p>
  //           <h4>Potential Treatment</h4>
  //           <p>${result.info.treatment}</p>
  //       </div>
  //   `
  //       : "<p>No detailed information available.</p>";

  //     const cardHtml = `
  //       <div class="result-card">
  //           <h3>${result.model_name.replace(/_/g, " ").toUpperCase()}</h3>
  //           <p class="prediction">${result.prediction}</p>
  //           <p class="confidence-text" style="text-align:center; font-size: 0.8rem; opacity: 0.8;">Confidence: ${
  //             result.confidence
  //           }%</p>
  //           <div class="confidence-bar-container">
  //               <div class="confidence-bar" style="width: ${
  //                 result.confidence
  //               }%;"></div>
  //           </div>
  //           ${gradCamHtml} ${infoHtml}
  //       </div>
  //   `;
  //     resultsContainer.innerHTML += cardHtml;
  //   });

  //   checkConsensus(results);
  // }
  //   function displayResults(results) {
  //     resultsContainer.innerHTML = "";
  //     results.forEach((result) => {
  //       // Removed Grad-CAM since we are using Hashing now
  //       const cardHtml = `
  //         <div class="result-card">
  //             <h3>DIAGNOSIS RESULT</h3>
  //             <p class="prediction" style="color: var(--primary-color); font-size: 1.8rem;">${result.prediction}</p>

  //             <p class="confidence-text" style="text-align:center; font-size: 0.9rem; opacity: 0.8; margin-bottom: 10px;">
  //                 Match Confidence: ${result.confidence}%
  //             </p>

  //             <div class="confidence-bar-container">
  //                 <div class="confidence-bar" style="width: ${result.confidence}%;"></div>
  //             </div>

  //             <div style="margin-top: 25px; text-align: center;">
  //                 <button id="analyze-btn" class="summarise-btn" data-diagnosis="${result.prediction}">
  //                     Analyze with AI Agent
  //                 </button>
  //             </div>
  //         </div>
  //     `;
  //       resultsContainer.innerHTML += cardHtml;
  //     });

  //     // Add event listener to the new button
  //     const analyzeBtn = document.getElementById("analyze-btn");
  //     if (analyzeBtn) {
  //       analyzeBtn.addEventListener("click", function () {
  //         const diagnosis = this.getAttribute("data-diagnosis");
  //         // Save diagnosis to local storage to pass it to chatbot page
  //         localStorage.setItem("current_diagnosis", diagnosis);
  //         window.location.href = "chatbot.html";
  //       });
  //     }
  //   }
  //   checkConsensus(results);
  // }
  function displayResults(results) {
    resultsContainer.innerHTML = "";
    results.forEach((result) => {
      // Removed Grad-CAM since we are using Hashing now
      const cardHtml = `
        <div class="result-card">
            <h3>DIAGNOSIS RESULT</h3>
            <p class="prediction" style="color: var(--primary-color); font-size: 1.8rem;">${result.prediction}</p>
            
            <p class="confidence-text" style="text-align:center; font-size: 0.9rem; opacity: 0.8; margin-bottom: 10px;">
                Match Confidence: ${result.confidence}%
            </p>
            
            <div class="confidence-bar-container">
                <div class="confidence-bar" style="width: ${result.confidence}%;"></div>
            </div>

            <div style="margin-top: 25px; text-align: center;">
                <button id="analyze-btn" class="summarise-btn" data-diagnosis="${result.prediction}">
                    Analyze with AI Agent
                </button>
            </div>
        </div>
    `;
      resultsContainer.innerHTML += cardHtml;
    });

    // Add event listener to the new button
    const analyzeBtn = document.getElementById("analyze-btn");
    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", function () {
        const diagnosis = this.getAttribute("data-diagnosis");
        // Save diagnosis to local storage to pass it to chatbot page
        localStorage.setItem("current_diagnosis", diagnosis);
        window.location.href = "chatbot.html";
      });
    }
  }
  function checkConsensus(results) {
    const predictions = results.map((r) => r.prediction);
    const counts = {};
    predictions.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });

    let consensusDiagnosis = null;
    for (const diagnosis in counts) {
      if (counts[diagnosis] >= 2) {
        consensusDiagnosis = diagnosis;
        break;
      }
    }

    if (consensusDiagnosis) {
      const button = document.createElement("button");
      button.className = "summarise-btn";
      button.textContent = "Summarise with AI";
      button.onclick = () => getSummary(consensusDiagnosis);
      summaryContainer.appendChild(button);
    }
  }

  async function getSummary(diagnosis) {
    summaryContainer.innerHTML = '<div class="loader"></div>';

    try {
      // THIS IS THE CORRECTED PATH FOR DEPLOYMENT
      const response = await fetch("/summarise/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: diagnosis }),
      });
      if (!response.ok) throw new Error("Failed to get summary.");

      const data = await response.json();
      const summaryHtml = `
                <div class="summary-box">
                    <h3>AI Summary for ${diagnosis}</h3>
                    <p>${marked.parse(data.summary)}</p>
                </div>
            `;
      summaryContainer.innerHTML = summaryHtml;
    } catch (error) {
      console.error("Error getting summary:", error);
      summaryContainer.innerHTML = `<p style="color: red;">Failed to get AI summary.</p>`;
    }
  }
}

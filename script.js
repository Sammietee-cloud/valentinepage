/* ---------------- NOTEBOOK CONTINUE BUTTON ---------------- */

        const introCard = document.getElementById("intro");
        const valCard = document.getElementById("val-card");
        const continueBtn = document.getElementById("continue");

        // Hide val card initially
        valCard.style.display = "none";

        continueBtn.addEventListener("click", () => {

          introCard.style.display = "none";
          valCard.style.display = "flex";

        });
        
        /* BUTTONS */
       
        const yesButton = document.getElementById('yesButton');
        const noButton = document.getElementById('noButton');
        const success = document.getElementById("success");
        
        // Repulsion parameters
        const repelDistance = 100; // Distance at which repulsion starts
        const repelStrength = 1.5; // How strongly it repels (0-1)
        
        let buttonX = null;
        let buttonY = null;
        let hasMovedOnce = false;
        
        // Cursor drift parameters
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseStillTimer = null;
        let isDrifting = false;
        let driftInterval = null;
        
        // Detect if device is mobile/touch
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
        
        // Initialize button position based on its actual position
        function initializePosition() {
            const rect = noButton.getBoundingClientRect();
            buttonX = rect.left + rect.width / 2;
            buttonY = rect.top + rect.height / 2;
        }
        
        // Update button position
        function updateButtonPosition() {
            noButton.style.left = buttonX + 'px';
            noButton.style.top = buttonY + 'px';
            noButton.style.transform = 'translate(-50%, -50%)';
        }
        
        // Move button to random position (MOBILE)
        function moveToRandomPosition() {
            if (!hasMovedOnce) {
                hasMovedOnce = true;
                noButton.classList.add('moving');
            }
            
            // Calculate random position within screen bounds
            const padding = 80;
            const minX = padding;
            const maxX = window.innerWidth - padding;
            const minY = padding;
            const maxY = window.innerHeight - padding;
            
            // Generate random position
            buttonX = Math.random() * (maxX - minX) + minX;
            buttonY = Math.random() * (maxY - minY) + minY;
            
            updateButtonPosition();
        }
        
        // Calculate repulsion force (DESKTOP)
        function repelFromCursor(mouseX, mouseY) {
            // Initialize position if not done yet
            if (buttonX === null || buttonY === null) {
                initializePosition();
            }
            
            // Get button's center position
            const rect = noButton.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;
            
            // Calculate distance from cursor to button center
            const dx = buttonCenterX - mouseX;
            const dy = buttonCenterY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If cursor is within repel distance
            if (distance < repelDistance && distance > 0) {
                // Switch to fixed positioning on first movement
                if (!hasMovedOnce) {
                    hasMovedOnce = true;
                    initializePosition();
                    noButton.classList.add('moving');
                }
                
                // Calculate repulsion force (stronger when closer)
                const force = (repelDistance - distance) / repelDistance;
                
                // Normalize direction vector
                const dirX = dx / distance;
                const dirY = dy / distance;
                
                // Apply repulsion (move button away from cursor)
                const moveAmount = force * repelStrength * 50; // 50px max movement
                buttonX += dirX * moveAmount;
                buttonY += dirY * moveAmount;
                
                // Keep button within screen bounds with padding
                const padding = 60;
                buttonX = Math.max(padding, Math.min(window.innerWidth - padding, buttonX));
                buttonY = Math.max(padding, Math.min(window.innerHeight - padding, buttonY));
                
                updateButtonPosition();
            }
        }
        
        // Start drifting cursor toward Yes button (DESKTOP ONLY)
        function startCursorDrift() {
            if (isDrifting || isMobile) return; // Don't drift on mobile
            isDrifting = true;
            
            driftInterval = setInterval(() => {
                const yesRect = yesButton.getBoundingClientRect();
                const yesCenterX = yesRect.left + yesRect.width / 2;
                const yesCenterY = yesRect.top + yesRect.height / 2;
                
                // Calculate direction to Yes button
                const dx = yesCenterX - lastMouseX;
                const dy = yesCenterY - lastMouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // If we're close enough to Yes button, stop drifting
                if (distance < 10) {
                    stopCursorDrift();
                    // Trigger a click on the Yes button!
                    yesButton.click();
                    return;
                }
                
                // Move cursor slowly toward Yes button (2% of the distance per frame)
                const speed = 0.02;
                lastMouseX += dx * speed;
                lastMouseY += dy * speed;
                
                // Create a fake mouse event to update everything
                const fakeEvent = new MouseEvent('mousemove', {
                    clientX: lastMouseX,
                    clientY: lastMouseY,
                    bubbles: true
                });
                document.dispatchEvent(fakeEvent);
                
            }, 16); // ~60fps
        }
        
        // Stop cursor drift
        function stopCursorDrift() {
            isDrifting = false;
            if (driftInterval) {
                clearInterval(driftInterval);
                driftInterval = null;
            }
        }
        
        // MOBILE: Handle touch/click on No button
        if (isMobile) {
            noButton.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default touch behavior
                moveToRandomPosition();
            });
            
            noButton.addEventListener('click', (e) => {
                e.preventDefault();
                moveToRandomPosition();
            });
        } else {
            // DESKTOP: Track mouse movement
            document.addEventListener('mousemove', (e) => {
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                
                // Stop drifting when user moves mouse
                if (isDrifting) {
                    stopCursorDrift();
                }
                
                repelFromCursor(e.clientX, e.clientY);
                
                // Clear previous timer
                if (mouseStillTimer) {
                    clearTimeout(mouseStillTimer);
                }
                
                // Start new timer - if mouse is still for 2 seconds, start drifting
                mouseStillTimer = setTimeout(() => {
                    startCursorDrift();
                }, 2000); // 2 seconds of no movement
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (hasMovedOnce && buttonX !== null && buttonY !== null) {
                const padding = 60;
                buttonX = Math.max(padding, Math.min(window.innerWidth - padding, buttonX));
                buttonY = Math.max(padding, Math.min(window.innerHeight - padding, buttonY));
                updateButtonPosition();
            }
        });
        
        
        
        /* CLICK YES */
        yesButton.addEventListener("click",()=>{

              valCard.style.display = "none"; // prevents card-behind bug
              success.classList.add("show");

        createConfetti();

        });    
        
        
        /* HEART PARTICLES */
        
        const canvas = document.getElementById("hearts");
const ctx = canvas.getContext("2d");

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

let mouse = {x:-999,y:-999};

document.addEventListener("mousemove",(e)=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Heart{

  constructor(){
    this.reset();
    this.y = Math.random()*canvas.height;
  }

  reset(){
    this.x = Math.random()*canvas.width;
    this.y = canvas.height+20;
    this.size = Math.random()*8+6;
    this.speedY = Math.random()*0.6+0.2;
  }

  draw(){

    ctx.strokeStyle="rgba(255,77,109,0.6)";
    ctx.lineWidth=1.5;

    ctx.beginPath();

    let top=this.size*0.3;

    ctx.moveTo(this.x,this.y+top);

    ctx.bezierCurveTo(this.x,this.y,
      this.x-this.size/2,this.y,
      this.x-this.size/2,this.y+top);

    ctx.bezierCurveTo(
      this.x-this.size/2,
      this.y+(this.size+top)/2,
      this.x,
      this.y+(this.size+top)/2,
      this.x,
      this.y+this.size
    );

    ctx.bezierCurveTo(
      this.x,
      this.y+(this.size+top)/2,
      this.x+this.size/2,
      this.y+(this.size+top)/2,
      this.x+this.size/2,
      this.y+top
    );

    ctx.bezierCurveTo(
      this.x+this.size/2,
      this.y,
      this.x,
      this.y,
      this.x,
      this.y+top
    );

    ctx.stroke();
  }

  update(){

    const dx=this.x-mouse.x;
    const dy=this.y-mouse.y;
    const dist=Math.hypot(dx,dy);

    if(dist<80){
      this.x+=dx*0.05;
      this.y+=dy*0.05;
    }

    this.y-=this.speedY;

    if(this.y<-20){
      this.reset();
    }

    this.draw();
  }
}

const hearts=[];
for(let i=0;i<100;i++) hearts.push(new Heart());

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  hearts.forEach(h=>h.update());
  requestAnimationFrame(animate);
}

animate();



/* =====================================================
                    CONFETTI
===================================================== */

function createConfetti(){

  const canvas=document.createElement("canvas");
  const ctx=canvas.getContext("2d");

  canvas.style.position="fixed";
  canvas.style.top=0;
  canvas.style.left=0;
  canvas.style.pointerEvents="none";
  canvas.style.zIndex=10;

  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  document.body.appendChild(canvas);

  const colors=["#ff4d6d","#ffb347","#22c55e","#ffd700","#ff6f91"];

  class Confetti{

    constructor(){
      this.x=Math.random()*canvas.width;
      this.y=-20;
      this.size=Math.random()*7+4;
      this.color=colors[Math.floor(Math.random()*colors.length)];
      this.speedY=Math.random()*3+2;
      this.rotation=Math.random()*360;
      this.rotationSpeed=Math.random()*10-5;
    }

    update(){

      this.y+=this.speedY;
      this.rotation+=this.rotationSpeed;
      this.x+=Math.sin(this.y*0.05)*0.5;

      if(this.y>canvas.height+20){
        this.y=-20;
        this.x=Math.random()*canvas.width;
      }

      this.draw();
    }

    draw(){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.rotation*Math.PI/180);
      ctx.fillStyle=this.color;
      ctx.fillRect(-this.size/2,-this.size/2,this.size,this.size);
      ctx.restore();
    }
  }

  const confettis=[];
  for(let i=0;i<100;i++) confettis.push(new Confetti());

  function animateConfetti(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confettis.forEach(c=>c.update());
    requestAnimationFrame(animateConfetti);
  }

  animateConfetti();
}
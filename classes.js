//templates
const { PI, sin, cos, atan2, hypot, floor, random } = Math;

function $(_el){
    return document.getElementById(_el);
}

class Moon {
    constructor(r, angle,omega=1) {
        
        this.r = r;
        this.angle = angle;
        this.type = rand(0, 2);
        this.color = "ghostwhite";
        this.l=0;
        this.x=0;
        this.y=0;
        this.omega=omega || 1;
    }


    update() {
        this.angle += this.omega*(-PI / 360);
    }
    setPos(x, y){
        this.x=x;
        this.y=y;
    }
    draw() {

        //x,y will be passed from Parent
        //face
        ctx.strokeStyle="#faa";
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * PI); //will be image later
        ctx.fill();
        ctx.stroke();
        //left eye
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc((this.x-this.r/4), this.y-this.r/4, 2, 0, 2 * PI); //will be image later
        ctx.fill();
        //right eye
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc((this.x+this.r/4), this.y-this.r/4, 2, 0, 2 * PI); //will be image later
        ctx.fill();
        //mouth
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(this.x-this.r/4, this.y+this.r/3); //will be image later
        ctx.lineTo(this.x+this.r/4, this.y+this.r/3);
        ctx.stroke();
        
        
    }

    pop() {
        this.color = "red";
    }

    checkCollision(orb) {
        
        var dist = hypot(this.x - orb.x, this.y - orb.y);
        if (dist <= orb.r + this.r) {
            return 1;
        } else {
            return 0;
        }

    }

}

class Plannet {

    constructor(x, y, r,difficulty=1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.moonRadius = (this.r/5);
        this.moonMargin = 24;
        this.moons = [];
        this.difficulty = difficulty || 0;
        var totalR = this.r + this.moonRadius + this.moonMargin;
        this.maxMoons = (floor(2 * PI * totalR / (this.moonRadius + this.moonMargin * 2)));
        this.hue=Math.floor(Math.random()*360);
        this.pullDown=0;
        this.pullTillEnd=1;
        this.dead=0;
        //hsl(0, 100%, 50%)
    }

    generateMoons() {
        var moonCount = rand(2, this.maxMoons - 4, 1);
        var _omega=(rand(-1,1,1))*this.difficultyLevel;
        // rand(-(this.difficulty+1),(this.difficulty+1),1);
        if(_omega==0) _omega=1;
        for (var a = 0; a < moonCount; a += 1) {
            this.moons.push(new Moon(this.moonRadius, a * (2 * PI / moonCount) , _omega));
        }
    }

    checkCollision(orb) {
        this.moons.forEach(m => {
            if (m.checkCollision(orb)) {
                m.pop();
                m.draw();
                orb.dead=1;
                orb.vx=0;
                orb.vy=0;
                orb.launched=0;
                return 1;
            }
        });
        return 0;
    }

    update(updateMoons=1){
        if(this.pullTillEnd && this.pullDown){
            if(this.y>=innerHeight+this.r){
                this.dead=1;
                this.pullDown=0;
            } else {
                this.y+=2.5;
            }
        } else if(!this.pullTillEnd && this.pullDown){
                if(this.y >= h-this.r*2){
                    this.pullDown=0;
                    this.pullTillEnd=1;
                    orbia.score+=this.difficulty;
                    orbia.difficultyLevel+=0.25;
                } else {
                    this.y+=2.5;
                    orbia.y=this.y;
                }
        }
        
        this.moons.forEach(m => {
            if(updateMoons){
                m.update();
            }
            m.setPos(
                this.x + (this.r + this.moonMargin + m.r) * cos(m.angle),
                this.y + (this.r + this.moonMargin + m.r) * sin(m.angle)
            );
            m.draw();
        });
    
    }

    draw() {
        ctx.lineWidth=2;
        ctx.strokeStyle="hsl("+this.hue+",100%,50%)";
        this.hue++;
        this.hue%=360;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * PI);
        ctx.stroke();
    }
    
}

class Orbia {

    constructor(plannet0) {
        this.x = plannet0.x;
        this.y = plannet0.y;
        this.r = 25;
        this.plannet = plannet0;
        this.nextPlannet = null;
        this.vx = 0;
        this.vy = 0;
        this.score = 0;
        this.launched = 0;
        this.dead = 0;
        this.difficultyLevel=0;
        this.frame=0;
        this.theta=0;
        this.omega=0.05;
    }

    pullTo(nextPlannet) {
        this.nextPlannet = nextPlannet;
        this.launched = 1;
    }

    update() {
        if(this.dead) {this.draw();return};
        this.frame++;
        this.theta+=this.omega;
        if (this.launched) { 
            
            sounds.play("fall");                
            var dist = hypot(this.x - this.nextPlannet.x, this.y - this.nextPlannet.y);
            if (dist >= 0.5) {
                var dx = -1 * (this.x - this.nextPlannet.x) / 5;
                var dy = -1 * (this.y - this.nextPlannet.y) / 5; //in 5 steps
                this.vx = dx;
                this.vy = dy;
            } else {
                this.launched = 0;
                this.vx = 0;
                this.vy = 0;
                this.plannet.pullDown=1;  
                this.nextPlannet.pullDown=1;
                this.nextPlannet.pullTillEnd=0;
                this.score += Math.floor(rand(10, 100, 1)*(5*this.difficultyLevel+1));
            }

            //check collision
            if(this.plannet){
                this.plannet.checkCollision(this);
            }
            this.nextPlannet.checkCollision(this);
            
        }
        this.x += this.vx;
        this.y += this.vy;

    }

    gameOver() {
        // dead animation
        if(this.frame >=351){
            sounds.pauseAll();
            sounds.play("dash");
            this.frame=0;
        }
        this.frame++;
        
        if(this.frame>=70){
            // this.vy = 2.5;
            this.y+=this.vy;
            this.vy+=1.5;       
            sounds.play("fall");
        }
        if(this.y>=innerHeight || this.frame >=350){
            this.dead=2;
        }
    }

    draw() {
        if (this.dead) {
            ctx.strokeStyle = "salmon";
            ctx.fillStyle = "hotpink";
        } else {
            ctx.strokeStyle = "aqua";
            ctx.fillStyle = "aqua";
        }
     
        // this.theta=0;
     
        ctx.save();
        ctx.translate(this.x,this.y)
        ctx.rotate(this.theta);
        
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowColor=ctx.strokeStyle;
        ctx.shadowBlur=50;

        //face
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, 2 * PI);
        ctx.fill();
        ctx.stroke();
        
        
        ctx.shadowOffsetX=null;
        ctx.shadowOffsetY=null;
        ctx.shadowColor=null;
        ctx.shadowBlur=null;
        
        //left eye
        ctx.beginPath();
        ctx.arc(-(this.r/3), -this.r/4, 3, 0, 2 * PI);
        ctx.fillStyle = "white";
        ctx.fill();

        //right eye
        ctx.beginPath();
        ctx.arc((this.r/3), -this.r/4, 3, 0, 2 * PI);
        ctx.fillStyle = "white";
        ctx.fill();

        //smile
        ctx.beginPath();
        ctx.arc(0, 2, 10, 20*(PI/180),  (160)*(PI/180));
        ctx.strokeStyle = "white";
        ctx.stroke();
        
        ctx.restore();
    }
}

class Background {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    draw(dx, dy) {
        dx *= 20;
        dy /= 2;
        var _w = innerWidth, _h = innerHeight;
        var grad = ctx.createRadialGradient((_w / 2) - dx, (_h / 2) + dy, 0, (_w / 2) - dx, (_h / 2) + dy, Math.max(_w / 2, _h / 2));
        grad.addColorStop(0, "ghostWhite");
        grad.addColorStop(0.5, "indigo");
        grad.addColorStop(1, "indigo");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, _w, _h);
        dx *= 100 / 20;
        dy *= 2;
        
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowColor="#000";
        ctx.shadowBlur=100;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo((-50) - dx, (_h) + dy);
        // ctx.lineTo((_w/4)-dx,((_h/2)+40)+dy);
        ctx.arcTo((_w / 4) - dx, ((_h / 2) + 40) + dy, ((_w / 2) + 100) - dx, (_h) + dy, 50);
        ctx.lineTo(((_w / 2) + 100) - dx, (_h) + dy);
        ctx.fill();
        
        dx/=(100/20);
        ctx.beginPath();
        ctx.moveTo((_w / 2) + (-50) - dx, (_h) + dy);
        // ctx.lineTo((_w/4)-dx,((_h/2)+40)+dy);
        ctx.arcTo((_w / 2) + (_w / 4) - dx, ((_h / 2) + 100) + dy, (_w / 2) + ((_w / 2) + 100) - dx, (_h) + dy, 50);
        ctx.lineTo((_w / 2) + ((_w / 2) + 100) - dx, (_h) + dy);
        ctx.fill();

        ctx.shadowOffsetX=null;
        ctx.shadowOffsetY=null;
        ctx.shadowColor=null;
        ctx.shadowBlur=null;
    }
}

class Sound{
    constructor(){
        this.queue=[];
        this.totalLoaded=0;
    }
    load(callback,replayCallback){
        // console.log("load Init");
        var _this=this;
        this.replayCallback=replayCallback;
        this.queue.forEach(function(a){
            a.sound.oncanplaythrough=function(){_this.loadE(callback,a)};
        });        
    }
    loadE(callback,s){
        this.totalLoaded++;
        $('loadStatus').innerHTML+=("loading..." + s.name+" done.. "+sounds.totalLoaded+"/"+sounds.queue.length)+"<br>";
        if(this.totalLoaded==this.queue.length)
            callback();
        
    }
    add(name,path){
        this.queue.push({"name":name,"sound":new Audio(path)});
    }
    play(name,sp=1){
        for(var i=0;i<this.queue.length;i++){
            if(this.queue[i]["name"]==name){
                if(sp && !this.queue[i]["sound"].paused) return;
                this.queue[i]["sound"].play();
                // .then(e=>console.log("playing"));
                if(name.match("bgm"))
                    this.queue[i]["sound"].onended=this.replayCallback;
            }
        }
    }
    pauseAll(){
        for(var i=0;i<this.queue.length;i++){
            this.queue[i]["sound"].pause()
        }
    }
}

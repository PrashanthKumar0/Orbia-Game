
var cnvs,ctx,w,h;

var sounds;

onload=function(){
    sounds=new Sound();
    sounds.add("bgm0","./assets/title.ogg");
    sounds.add("bgm1","./assets/game_w0.ogg");
    sounds.add("bgm2","./assets/game_w1.ogg");
    sounds.add("bgm3","./assets/game_w1000.ogg");
    sounds.add("fall","./assets/level_started.ogg");
    sounds.add("dash","./assets/pet_monster_touched.ogg");
    sounds.load(loadFunction,rePlayAudioFunction);
}

function rePlayAudioFunction (){
    sounds.play("bgm"+rand(0,3,1));
}

function loadFunction() {
    $('loadStatus').innerHTML+=("all Done.. <br> initializing the game");
    setTimeout(function(){

        $('loader').style.display="none";
        $('banner').style.display="block";
    
    },400) //just to add a little fun ;)
    // init();  
}


var orbia;

var plannets=[];

function init(){
    $('banner').style.display="none";
    cnvs=$('cnvs');
    cnvs.style.display="block";
    rePlayAudioFunction();
    ctx=cnvs.getContext("2d");
    w=cnvs.width=innerWidth;
    h=cnvs.height=innerHeight;

    var p=new Plannet((w/2)-100,h-200,80);
    p.generateMoons();
    
    plannets.push(p); //current
    
    var p2=new Plannet((w/2)+150,(h/2)-150,80);
    p2.generateMoons();

    plannets.push(p2); //next

    orbia=new Orbia(p);
    
    addEvents();

    looper();

    // setInterval(looper,10);
}

function restart(){
    
    orbia=null;
    plannets=[];
    init();
}

const background=new Background();

function drawBg() {
    var mag=((orbia.x**2)+(orbia.y**2))**(1/2);
    var dx=orbia.x/mag;
    var dy=orbia.x/mag;
    background.draw(dx,dy);
    //forEach Plannet Move
}

function looper(){
    managePlannets();
    if(!orbia.dead){
        drawAll();        
    } else {
        orbia.gameOver();
        drawAll(1);
        if(orbia.dead==2){
            gameOver();
            return;
        }
    }
    requestAnimationFrame(looper);
}

function drawAll(gameOver=0){
    ctx.clearRect(0,0,w,h);
    drawBg();
    plannets[0].update(!gameOver);
    plannets[1].update(!gameOver);
    plannets[0].draw();
    plannets[1].draw();
    orbia.update();
    orbia.draw();
    ctx.font="15px sans-serif";
    ctx.fillStyle="aqua";
    ctx.fillText("Score:"+Math.floor(orbia.score),w-140,h-100);
    ctx.fillText("Difficulty:"+(orbia.difficultyLevel),w-140,h-50);
}
function gameOver(){
    ctx.font="20px sans-serif";
    ctx.fillStyle="rgba(0,0,0,0.5)";
    var bw=ctx.measureText("Game Over").width;
    ctx.fillRect(((w/2)-bw/2)-50,(h/2)-50,bw+100,100);
    ctx.fillStyle="aqua";
    ctx.fillText("Game Over",(w/2)-bw/2,h/2);
    sounds.pauseAll();
    sounds.play("dash");
    setTimeout(function(){
        $("restartBtn").onclick=restart;
        $("restartBtn").innerHTML="Play Again?";
        $("banner").style.display="block";
        $("bannerInfo").innerHTML="<h1>Game Over</h1><span class='score'>Final Score:"+orbia.score+"<br> Difficulty Reached : "+orbia.difficultyLevel+" </span>"
        $("cnvs").style.display="none";
    },500);
}

function managePlannets() {
    if(plannets[0].dead){
        plannets.splice(0,1);
        plannets[1]=(new Plannet(rand(80*2,(w-80*2)),(h/2)-150,80,orbia.difficultyLevel));
        plannets[1].generateMoons();
        orbia.plannet=plannets[0];
    }
}


function addEvents(){
    cnvs.onclick=function(){
        orbia.launched=1;
        orbia.pullTo(plannets[1]);    
    }
    onkeydown=(e)=>{
        // console.log(e.keyCode)
        if(e.keyCode==32 || e.keyCode==38) {//up arrow or space bar
            orbia.launched=1;
            orbia.pullTo(plannets[1]);    
                
        }
    }
}


function rand(min,max,_floor){

    var num=(min+(random()*(max-min)))
    return _floor==1?Math.round(num):num;

}
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.querySelectorAll('header').forEach(initHeaderFx);

  function initHeaderFx(header){
    var arena = header.querySelector('.name-arena');
    var nameEl = header.querySelector('.bounce-name');
    var cloudsWrap = header.querySelector('.clouds');
    if (!arena || !nameEl || !cloudsWrap) return;

    nameEl.style.left = '0';
    nameEl.style.top = '0';

    var asteroidLayer = document.createElement('div');
    asteroidLayer.className = 'asteroid-layer';
    asteroidLayer.setAttribute('aria-hidden', 'true');
    header.appendChild(asteroidLayer);

    var pos = {x: 0, y: 0};
    var vel = {x: 70, y: 55};
    var bounds = {w: 0, h: 0, nw: 0, nh: 0};

    function measure(){
      bounds.w = arena.clientWidth;
      bounds.h = arena.clientHeight;
      bounds.nw = nameEl.offsetWidth;
      bounds.nh = nameEl.offsetHeight;
      pos.x = Math.max(0, (bounds.w - bounds.nw) / 2);
      pos.y = Math.max(0, (bounds.h - bounds.nh) / 2);
    }
    measure();
    window.addEventListener('resize', measure);

    var asteroids = [];
    function spawnAsteroid(){
      var el = document.createElement('div');
      el.className = 'asteroid';
      var rock = document.createElement('div');
      rock.className = 'asteroid-rock';
      el.appendChild(rock);
      asteroidLayer.appendChild(el);

      var hw = header.clientWidth, hh = header.clientHeight;
      var fromLeft = Math.random() < 0.5;
      var speed = 45 + Math.random() * 35;
      asteroids.push({
        el: el,
        x: fromLeft ? -40 : hw + 40,
        y: Math.random() * Math.max(hh - 30, 10),
        vx: fromLeft ? speed : -speed,
        vy: (Math.random() - 0.5) * 24,
        alive: true
      });
    }

    var spawnTimer = setInterval(spawnAsteroid, 4200);
    setTimeout(spawnAsteroid, 900);

    function rectsOverlap(a, b){
      return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
    }

    function spawnSparks(x, y){
      for (var i = 0; i < 6; i++){
        var p = document.createElement('span');
        p.className = 'spark';
        var angle = Math.random() * Math.PI * 2;
        var dist = 18 + Math.random() * 22;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        asteroidLayer.appendChild(p);
        (function(node){ setTimeout(function(){ node.remove(); }, 600); })(p);
      }
    }

    function explodeCloud(cloud){
      if (cloud.dataset.boom === '1') return;
      cloud.dataset.boom = '1';
      var crect = cloud.getBoundingClientRect();
      var hrect = header.getBoundingClientRect();
      spawnSparks(crect.left - hrect.left + crect.width / 2, crect.top - hrect.top + crect.height / 2);
      cloud.classList.add('cloud-boom');
      setTimeout(function(){
        cloud.classList.remove('cloud-boom');
        cloud.style.left = '-220px';
        cloud.style.animation = 'none';
        void cloud.offsetWidth;
        cloud.style.animation = '';
        cloud.dataset.boom = '0';
      }, 450 + 3000 + Math.random() * 2500);
    }

    var last = performance.now();
    function frame(now){
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
      var maxX = Math.max(bounds.w - bounds.nw, 0);
      var maxY = Math.max(bounds.h - bounds.nh, 0);
      if (pos.x <= 0){ pos.x = 0; vel.x = Math.abs(vel.x); }
      else if (pos.x >= maxX){ pos.x = maxX; vel.x = -Math.abs(vel.x); }
      if (pos.y <= 0){ pos.y = 0; vel.y = Math.abs(vel.y); }
      else if (pos.y >= maxY){ pos.y = maxY; vel.y = -Math.abs(vel.y); }
      nameEl.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';

      var hw = header.clientWidth, hh = header.clientHeight;
      var clouds = cloudsWrap.querySelectorAll('.cloud');
      for (var i = asteroids.length - 1; i >= 0; i--){
        var a = asteroids[i];
        if (!a.alive) continue;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.el.style.transform = 'translate(' + a.x + 'px,' + a.y + 'px)';

        if (a.x < -80 || a.x > hw + 80 || a.y < -80 || a.y > hh + 80){
          a.alive = false;
          a.el.remove();
          asteroids.splice(i, 1);
          continue;
        }

        var arect = a.el.getBoundingClientRect();
        for (var c = 0; c < clouds.length; c++){
          var cloud = clouds[c];
          if (cloud.dataset.boom === '1') continue;
          if (rectsOverlap(arect, cloud.getBoundingClientRect())){
            explodeCloud(cloud);
            a.alive = false;
            a.el.remove();
            asteroids.splice(i, 1);
            break;
          }
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();

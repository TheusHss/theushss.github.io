if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registrado'))
    .catch(e => console.error('❌ Erro no Service Worker', e));
}
window.localStorage.clear();
    let starter = 0;
    let pontoRetorno = null;
    let listas = false;
    let indiceColoniaSelecionada = 0;

    let rotacaoTouchAtiva = false;
    let ultimoTouchX = 0;
    let ultimoTouchY = 0;
    const isMobile = true;



    let dinheiroEstelar = 2000;
    let buracosNegros = [];
    let buracosNegrosDisparados = [];
    let estrelaEscaneada = null;
    let tempoEscaneamento = 0;

    let painelArmasAtivo = false;
    let armasDisponiveis = ["Laser", "Buraco Negro", "Buraco Negro arremessado", "Super aglomerado"];
    let armaSelecionada = 0;
    let superAglomeradoAtivo = false;


    let particulas = [];
    let raios = [];
    const canvas = document.getElementById("espaco");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let velocidadeAtual = 0;
    let acelerando = false;

    canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      rotacaoTouchAtiva = true;
      ultimoTouchX = touch.clientX;
      ultimoTouchY = touch.clientY;
    });

    canvas.addEventListener("touchmove", (e) => {
      if (!rotacaoTouchAtiva) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - ultimoTouchX;
      const deltaY = touch.clientY - ultimoTouchY;

      rotY += deltaX * 0.002;
      rotX += deltaY * 0.002;
      rotX = Math.max(Math.min(rotX, Math.PI / 2), -Math.PI / 2);

      ultimoTouchX = touch.clientX;
      ultimoTouchY = touch.clientY;

      e.preventDefault(); // impede rolagem da página
    });

    canvas.addEventListener("touchend", () => {
      rotacaoTouchAtiva = false;
    });


    function tocarSom(id) {
      const base = document.getElementById(id);
      if (!base) return;

      const clone = base.cloneNode();
      clone.volume = 0.1; // vai de 0.0 (mudo) a 1.0 (máximo)
      clone.play();
    }

    function tocarSomLoop(id, volume) {
      const base = document.getElementById(id);
      if (!base) return;

      const clone = base.cloneNode();
      clone.loop = true;
      clone.volume = volume; // vai de 0.0 (mudo) a 1.0 (máximo)
      clone.play();
    }



    let estrelas = [];
    let mostrarNomes = true;
    const total = 2000;
    const fov = 400;
    let camX = 0, camY = 0, camZ = 0;
    let rotX = 0, rotY = 0;

    const cores = ["white", "#88f", "#f88", "#8f8", "#ff8", "#8ff"];

    function gerarEstrelaPosAleatoria() {
      const dist = 8000 + Math.random() * 800000;
      const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const nome = letras[Math.floor(Math.random() * letras.length)]
        + letras[Math.floor(Math.random() * letras.length)]
        + letras[Math.floor(Math.random() * letras.length)]
        + "-" + Math.floor(Math.random() * 100_000);


      const mover = Math.random() < 0.2; // 20% das estrelas se movem
      const starSpeed = 10;
      const velocidade = mover
        ? { x: (Math.random() - 0.5) * starSpeed, y: (Math.random() - 0.5) * starSpeed, z: (Math.random() - 0.5) * starSpeed }
        : { x: 0, y: 0, z: 0 };

      return {
        x: (Math.random() - 0.5) * dist + camX,
        y: (Math.random() - 0.5) * dist + camY,
        z: (Math.random() - 0.5) * dist + camZ,
        cor: Math.random() < 0.8 ? 'white' : cores[Math.floor(Math.random() * (cores.length - 1)) + 1],
        vidas: parseInt(1 + Math.random() * 10) == 1 ? parseInt(24000 + Math.random() * 8880001) : 0,
        nome: nome,
        tamanho: 200 + Math.random() * 5000,
        velocidade: velocidade,
        colonia: false,
        raioReal: 200 + Math.random() * 800 // por exemplo, entre 200 e 1000 unidades
      };
    }


    let destinoEstrela = null;

    function salvarEstrelas() {
      localStorage.setItem("estrelas", JSON.stringify(estrelas));
    }

    function carregarEstrelas() {
      const salvas = localStorage.getItem("estrelas");
      if (salvas) {
        estrelas = JSON.parse(salvas);
      }
      if (!estrelas || estrelas.length === 0) {
        for (let i = 0; i < total; i++) {
          estrelas.push(gerarEstrelaPosAleatoria());
        }
        salvarEstrelas();
      }
    }

    carregarEstrelas();

    let movementCounter = 0;
    let mousePressionado = false;
    const teclas = {};
    document.addEventListener("keydown", e => teclas[e.key.toLowerCase()] = true);
    document.addEventListener("keyup", e => {
      teclas[e.key.toLowerCase()] = false
      tempoMousePressionado = 0;
    });

    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    document.addEventListener("keydown", (e) => {

      if (e.key.toLowerCase() === "j") {
        painelArmasAtivo = !painelArmasAtivo;
        adicionarAlerta(painelArmasAtivo ? "🧰 Painel de armas aberto" : "🧰 Painel de armas fechado", "");


      }

      if (painelArmasAtivo) {
        if (e.key === "ArrowDown") {
          armaSelecionada = (armaSelecionada + 1) % armasDisponiveis.length;
        }
        if (e.key === "ArrowUp") {
          armaSelecionada = (armaSelecionada - 1 + armasDisponiveis.length) % armasDisponiveis.length;
        }
        if (e.key === "Enter") {
          adicionarAlerta("🛠️ Arma selecionada: " + armasDisponiveis[armaSelecionada]);
          // aqui você pode chamar a função para usar a arma
        }
      }
      if (!listas) return;

      const colonias = estrelas.filter(e => e.colonia);
      if (colonias.length === 0) return;

      if (!painelArmasAtivo) {

        if (e.key === "ArrowDown") {
          indiceColoniaSelecionada = (indiceColoniaSelecionada + 1) % colonias.length;
        } else if (e.key === "ArrowUp") {
          indiceColoniaSelecionada = (indiceColoniaSelecionada - 1 + colonias.length) % colonias.length;
        } else if (e.key === "Enter") {
          destinoEstrela = colonias[indiceColoniaSelecionada];
          adicionarAlerta("🛰️ Viajando até:", destinoEstrela.nome);
        }
      }




    });



    document.addEventListener("wheel", (e) => {
      painelArmasAtivo = true

      if (e.deltaY > 0) {
        // scroll para baixo → próxima arma
        armaSelecionada = (armaSelecionada + 1) % armasDisponiveis.length;
      } else {
        // scroll para cima → arma anterior
        armaSelecionada = (armaSelecionada - 1 + armasDisponiveis.length) % armasDisponiveis.length;
      }

      e.preventDefault(); // impede scroll da página

      setTimeout(() => {
        painelArmasAtivo = false;
      }, 2000);
    });


    document.addEventListener("mouseup", (e) => {
      mousePressionado = false;
    })
    document.addEventListener("mousedown", (e) => {

      if (starter == 0) {
        setTimeout(() => {
          //tocarSomLoop("music", 0.1)
          tocarSomLoop("somRespiracao", 0.1)
          tocarSomLoop("fundo", 1)
        }, 1000);
      }
      starter = 1;




      if (e.button === 2) {
        mousePressionado = true;
        tempoMousePressionado = 0;
      }

      if (e.button === 0) {

        acionamentoDeArma();
      }
    });

    document.addEventListener("keydown", (e) => {
      teclas[e.key.toLowerCase()] = true;

    

      if (e.key.toLowerCase() === "c" && estrelaEscaneada && !estrelaEscaneada.colonia) {
        const colonias = estrelas.filter(e => e.colonia);
        if (colonias.length >= 8) return;
        estrelaEscaneada.colonia = true;
      }

      if (e.key.toLowerCase() === "l") {
        listas = !listas;
      }

      if (e.key.toLowerCase() === "1") {
        let maisProxima = null;
        let menorDistancia = Infinity;

        for (let estrela of estrelas) {


          const dx = estrela.x - camX;
          const dy = estrela.y - camY;
          const dz = estrela.z - camZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < menorDistancia) {
            menorDistancia = dist;
            maisProxima = estrela;
          }
        }

        if (maisProxima) {
          destinoEstrela = maisProxima;
          adicionarAlerta("🛰️ Viajando até:", maisProxima.nome);
        }
      }

      if (e.key.toLowerCase() === "p") {
        tocarSom("pin")
        pontoRetorno = {
          x: camX,
          y: camY,
          z: camZ
        };
        adicionarAlerta("📍 Ponto de retorno salvo!");
      }

      if (e.key.toLowerCase() === "t") {
        if (pontoRetorno) {
          tocarSom("tp")
          camX = pontoRetorno.x;
          camY = pontoRetorno.y;
          camZ = pontoRetorno.z;
          adicionarAlerta("🔄 Retornado ao ponto salvo!");
        } else {
          adicionarAlerta("⚠️ Nenhum ponto de retorno salvo.");
        }
      }

      // if (e.key.toLowerCase() === "l") {
      //   estrelas = [];
      //   adicionarAlerta("🧹 Todas as estrelas foram removidas.");
      // }

      if (e.key.toLowerCase() === "r") {
        acionamentoDeArma();

      }
    });

    function acionamentoDeArma() {
      if (armasDisponiveis[armaSelecionada] == armasDisponiveis[1]) {
        checarEstrelaCentralBuracoNegro();

      } else if (armasDisponiveis[armaSelecionada] == armasDisponiveis[0]) {

        checarEstrelaCentral()

        const cabine = document.getElementById("cabine");
        cabine.classList.add("tiro-animado");

        setTimeout(() => {
          cabine.classList.remove("tiro-animado");
        }, 100);
      } else if (armasDisponiveis[armaSelecionada] == armasDisponiveis[2]) {

        const cosRotX = Math.cos(rotX);
        const sinRotX = Math.sin(rotX);
        const cosRotY = Math.cos(rotY);
        const sinRotY = Math.sin(rotY);

        const velocidade = 32;

        const direcao = {
          x: sinRotY * cosRotX * velocidade,
          y: sinRotX * velocidade,
          z: cosRotY * cosRotX * velocidade
        };

        buracosNegrosDisparados.push({
          x: camX,
          y: camY,
          z: camZ,
          vx: direcao.x,
          vy: direcao.y,
          vz: direcao.z,
          tempo: 600, // 10 segundos
          raio: 10000
        });
      } else if (armasDisponiveis[armaSelecionada] == armasDisponiveis[3]) {

        pontoAglomerado = {
          x: camX + Math.sin(rotY) * Math.cos(rotX) * 10000,
          y: camY + Math.sin(rotX) * 10000,
          z: camZ + Math.cos(rotY) * Math.cos(rotX) * 10000
        };
        superAglomeradoAtivo = true;
        tempoAglomerado = 300;
      }
    }


    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === canvas) {
        document.addEventListener("mousemove", onMouseMove);
      } else {
        document.removeEventListener("mousemove", onMouseMove);
      }
    });

    function onMouseMove(e) {
      rotY += e.movementX * 0.002;
      rotX += e.movementY * 0.002;
      rotX = Math.max(Math.min(rotX, Math.PI / 2), -Math.PI / 2);
    }
    function desenharPainelArmas() {
      if (!painelArmasAtivo) return;

      const largura = 280;
      const x = 200;
      const y = 40;
      const altura = 40 + armasDisponiveis.length * 30;

      ctx.fillStyle = "rgba(20, 30, 60, 0.8)";
      ctx.fillRect(x, y, largura, altura);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, largura, altura);

      ctx.font = "15px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText("PAINEL DE ARMAS", x + 140, y + 25); // centralizado

      ctx.font = "14px monospace";
      let offset = 50;

      for (let i = 0; i < armasDisponiveis.length; i++) {
        const texto = armasDisponiveis[i];
        if (i === armaSelecionada) {
          ctx.fillStyle = "#0055ff";
          ctx.fillRect(x + 5, y + offset - 14, largura - 10, 22);
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = "#ccc";
        }
        ctx.fillText(texto, x + 140, y + offset); // centralizado horizontalmente
        offset += 25;
      }
    }

    function desenharPainelInfo() {
      const largura = 200;
      const altura = 110;
      const margem = 240;
      const painelY = canvas.height - 260; // mesma altura do outro painel
      const painelX = canvas.width - largura - margem;

      const agora = new Date();
      const ano = agora.getFullYear();
      const hora = String(agora.getHours()).padStart(2, '0');
      const min = String(agora.getMinutes()).padStart(2, '0');
      const seg = String(agora.getSeconds()).padStart(2, '0');
      const horaFormatada = `${hora}:${min}:${seg}`;

      ctx.fillStyle = "rgba(0, 50, 100, 0.2)";
      ctx.strokeStyle = "#0ff";
      ctx.lineWidth = 2;
      ctx.fillRect(painelX, painelY, largura, altura);
      ctx.strokeRect(painelX, painelY, largura, altura);

      ctx.font = "14px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText("SISTEMA DE BORDO", painelX + 100, painelY + 20);

      ctx.font = "12px monospace";
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`ANO: ${ano}`, painelX + 100, painelY + 40);
      ctx.fillText(`HORA: ${horaFormatada}`, painelX + 100, painelY + 60);

      ctx.fillStyle = "#0ff";
      ctx.fillText("Proximidades: " + obterEstrelaMaisProxima().nome, painelX + 100, painelY + 80);

      ctx.fillStyle = "#0ff";
      ctx.fillText("Cash: " + dinheiroEstelar, painelX + 100, painelY + 100);


    }


    function desenharPainelVelocidade() {
      const painelX = 240;
      const painelY = canvas.height - 200;
      const largura = 250;
      const altura = 60;

      // painel base
      ctx.fillStyle = "rgba(0, 100, 255, 0.2)";
      ctx.strokeStyle = "#0ff";
      ctx.lineWidth = 2;
      ctx.fillRect(painelX, painelY, largura, altura);
      ctx.strokeRect(painelX, painelY, largura, altura);

      // título
      ctx.font = "14px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText("VELOCIDADE", painelX + 50, painelY + 20);

      // barra de velocidade
      const maxBarra = largura - 40;
      const barraAtual = Math.min((velocidadeAtual / 100) * maxBarra, maxBarra);

      ctx.fillStyle = "#00ffff";
      ctx.fillRect(painelX + 10, painelY + 30, barraAtual, 15);
      ctx.strokeStyle = "#00ccff";
      ctx.strokeRect(painelX + 10, painelY + 30, maxBarra, 15);

      // texto numérico
      ctx.font = "12px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText(velocidadeAtual.toFixed(1) + " u/s", painelX + 50, painelY + 55);
    }


    let desaceleracao = 0.001;
    let mouseEsquerdoPressionado = false;
    let tempoMousePressionado = 0;

    function update() {
      const baseSpeed = 10;
      const speed = (teclas["shift"] || teclas["Shift"]) ? baseSpeed * 20 : baseSpeed;

      let totalTamanho = 0;
      let totalColonias = 0;

      // 1. Primeiro passamos para calcular média
      for (let estrela of estrelas) {
        if (estrela.colonia) {
          totalTamanho += estrela.tamanho;
          totalColonias++;
        }
      }

      const mediaTamanho = totalColonias > 0 ? totalTamanho / totalColonias : 0;

      for (let estrela of estrelas) {
        if (!estrela.colonia) continue;

        let valorBase = 1;

        switch (estrela.cor) {
          case "#f88": // vermelha
            valorBase = 10;
            break;
          case "#8f8": // verde
            valorBase = 5;
            break;
          case "#ff8": // amarela
            valorBase = 8;
            break;
          default:
            valorBase = 1;
        }

        // 3. Bônus ou penalidade baseado no tamanho
        const fatorTamanho = estrela.tamanho / mediaTamanho;
        let bonusTamanho = 1;
        if (fatorTamanho > 1.1) {
          bonusTamanho = 1.5; // maior que a média
        } else if (fatorTamanho < 0.9) {
          bonusTamanho = 0.7; // menor que a média
        }

        // 4. Bônus por vida
        const bonusVida = estrela.vidas > 0 ? 100 : 0;

        const ganho = (valorBase * bonusTamanho) + bonusVida;
        dinheiroEstelar += ganho;
      }


      mensagensAlerta = mensagensAlerta.filter(m => m.tempo > 0);
      for (let m of mensagensAlerta) {
        m.tempo--;
      }


      if (superAglomeradoAtivo && tempoAglomerado > 0) {
        tempoAglomerado--;

        for (let estrela of estrelas) {
          const dx = pontoAglomerado.x - estrela.x;
          const dy = pontoAglomerado.y - estrela.y;
          const dz = pontoAglomerado.z - estrela.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1;

          const forca = 1500000 / (dist * dist); // quanto mais perto, mais forte
          estrela.x += dx * forca;
          estrela.y += dy * forca;
          estrela.z += dz * forca;
        }

        if (tempoAglomerado === 0) {
          superAglomeradoAtivo = false;
          adicionarAlerta("✅ Super Aglomerado finalizado", "");
        }
      }

      if (mousePressionado) {
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        let melhorAlvo = null;
        let menorDistancia = Infinity;



        for (let estrela of estrelas) {


          const dx = estrela.x - camX;
          const dy = estrela.y - camY;
          const dz = estrela.z - camZ;
          const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);
          if (rz <= 1 || !isFinite(rz)) continue;

          const k = fov / rz;
          const x = rx * k + canvas.width / 2;
          const y = ry * k + canvas.height / 2;
          const distTela = Math.hypot(x - centroX, y - centroY);

          if (distTela < 15 && rz < menorDistancia) {
            menorDistancia = rz;
            melhorAlvo = estrela;
          }
        }





        if (melhorAlvo) {
          estrelaEscaneada = melhorAlvo;
          tempoEscaneamento = 100; // 3 segundos
          //adicionarAlerta("🔎 Estrela escaneada:", melhorAlvo.nome);
        } else {
          estrelaEscaneada = null;
          //adicionarAlerta("❌ Nenhuma estrela central para escanear.");
        }
      }

      if (teclas["2"] && estrelaEscaneada) {

        destinoEstrela = estrelaEscaneada;
        adicionarAlerta("🛰️ Iniciando viagem até a estrela escaneada:", estrelaEscaneada.nome);
        tempoMousePressionado = 0;

      }




      if (teclas["w"]) acelerando = true;

      if (teclas["n"]) {
        mostrarNomes = !mostrarNomes;
        adicionarAlerta("🛈 Nomes das estrelas:", mostrarNomes ? "ativados" : "desativados");
      }
      else acelerando = false;


      desaceleracao = 0.001;

      for (let b of buracosNegrosDisparados) {
        b.x += b.vx;
        b.y += b.vy;
        b.z += b.vz;
        b.tempo--;

        for (let estrela of estrelas) {
          const dx = estrela.x - b.x;
          const dy = estrela.y - b.y;
          const dz = estrela.z - b.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < b.raio) {
            const forca = 1 - dist / b.raio;
            estrela.x -= dx * forca * 0.02;
            estrela.y -= dy * forca * 0.02;
            estrela.z -= dz * forca * 0.02;
          }
        }
      }


      // Remover buracos vencidos
      buracosNegrosDisparados = buracosNegrosDisparados.filter(b => b.tempo > 0);


      if (teclas["s"]) {
        acelerando = false;
        desaceleracao = velocidadeAtual * 0.02;
      }

      const aceleracao = speed / 1000;
      const maxVelocidade = 100;

      if (acelerando) {
        velocidadeAtual = Math.min(maxVelocidade, (velocidadeAtual + aceleracao));
      } else {
        velocidadeAtual = Math.max(0, velocidadeAtual - desaceleracao);
      }

      if (isMobile) {
        velocidadeAtual = 10;
      }

      if (teclas["q"]) {
        tocarSom("tp")
        velocidadeAtual = 20000
        setTimeout(() => {
          velocidadeAtual = 100
        }, 500);
      }


      if (destinoEstrela) {
        const dx = destinoEstrela.x - camX;
        const dy = destinoEstrela.y - camY;
        const dz = destinoEstrela.z - camZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const margemParada = destinoEstrela.raioReal + 500; // distância "aceitável" para parar

        if (dist > margemParada) {
          const velocidade = dist - margemParada + 200;
          const norm = 1 / dist;
          camX += dx * norm * velocidade;
          camY += dy * norm * velocidade;
          camZ += dz * norm * velocidade;
        } else {
          tocarSom("tp")
          adicionarAlerta("✅ Chegou próximo da estrela:", destinoEstrela.nome);
          destinoEstrela = null;
        }
      }



      //const forward = teclas["s"] ? -1 : 0;
      const strafe = teclas["a"] ? -1 : teclas["d"] ? 1 : 0;
      const vertical = teclas["arrowup"] ? -1 : teclas["arrowdown"] ? 1 : 0;

      let moved = false;

      const cosRotX = Math.cos(rotX);
      const sinRotX = Math.sin(rotX);
      const cosRotY = Math.cos(rotY);
      const sinRotY = Math.sin(rotY);


      if (velocidadeAtual > 0) {
        camX += sinRotY * cosRotX * velocidadeAtual;
        camY += sinRotX * velocidadeAtual;
        camZ += cosRotY * cosRotX * velocidadeAtual;
        moved = true;
      }
      // if (forward !== 0) {
      //   camX += sinRotY * cosRotX * speed * forward;
      //   camY += sinRotX * speed * forward;
      //   camZ += cosRotY * cosRotX * speed * forward;
      //   moved = true;
      // }

      if (strafe !== 0) {
        camX += cosRotY * velocidadeAtual * strafe;
        camZ -= sinRotY * velocidadeAtual * strafe;
        moved = true;
      }

      // if (vertical !== 0) {
      //   camY += speed * vertical;
      //   moved = true;
      // }

      if (tempoEscaneamento > 0) {
        tempoEscaneamento--;
        if (tempoEscaneamento === 0) estrelaEscaneada = null;
      }


      buracosNegros = buracosNegros.filter(b => b.tempo > 0);
      for (let b of buracosNegros) {
        b.tempo--;

        for (let estrela of estrelas) {
          const dx = b.x - estrela.x;
          const dy = b.y - estrela.y;
          const dz = b.z - estrela.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          const forca = 10000 / (dist * dist + 2000000); // força com queda de distância

          if (dist < 10000) {
            estrela.x += dx * forca;
            estrela.y += dy * forca;
            estrela.z += dz * forca;
          }
        }
      }

      for (let i = 0; i < estrelas.length; i++) {
        const estrela = estrelas[i];
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const rotated = rotate(dx, dy, dz);

        // if (!isFinite(rotated.z) || rotated.z > 100000) {
        //   estrelas[i] = gerarEstrelaPosAleatoria();
        // }
      }

      if (moved) {
        movementCounter++;
        if (movementCounter > 80) {
          //estrelas.push(gerarEstrelaPosAleatoria());
          //salvarEstrelas();
          movementCounter = 0;
        }
      }

      for (let estrela of estrelas) {
        estrela.x += estrela.velocidade?.x;
        estrela.y += estrela.velocidade?.y;
        estrela.z += estrela.velocidade?.z;
      }

      // Reposiciona estrelas que se afastaram demais
      estrelas = estrelas.map(e => {
        const dx = e.x - camX;
        const dy = e.y - camY;
        const dz = e.z - camZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // if (dist > 150000) {
        //   return gerarEstrelaPosAleatoria(); // substitui por nova
        // }
        return e;
      });

      particulas = particulas.filter(p => p.vida > 0);
      for (let p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vida -= 1;
      }

      raios = raios.filter(r => r.tempo > 0);
      for (let r of raios) {
        r.tempo--;
      }


    }

    let mensagensAlerta = [];
    function adicionarAlerta(texto1, texto2) {
      let texto = (texto1 + " " + texto2);
      if (mensagensAlerta.length > 0 && texto == mensagensAlerta[mensagensAlerta.length - 1].texto) return;

      if (mensagensAlerta.length >= 10) {
        mensagensAlerta.shift(); // remove o primeiro
      }
      mensagensAlerta.push({
        texto,
        tempo: 300 // duração em frames (~5 segundos)
      });
    }


    function desenharPainelAlertas() {
      if (mensagensAlerta.length === 0) return;

      const largura = 300;
      const x = canvas.width - largura - 40;
      let y = 180 + (mensagensAlerta.length);

      ctx.font = "13px monospace";



      for (let m of mensagensAlerta) {
        const opacidade = Math.min(1, m.tempo / 60);
        ctx.fillStyle = `rgba(0, 200, 255, ${opacidade * 0.3})`;
        ctx.fillRect(x, y - 16, largura, 20);

        ctx.strokeStyle = `rgba(0, 255, 255, ${opacidade})`;
        ctx.strokeRect(x, y - 16, largura, 20);

        ctx.fillStyle = `rgba(255, 255, 255, ${opacidade})`;
        ctx.fillText(m.texto, x + 150, y);
        y += 24;
      }
    }


    function desenharPainelColonias() {
      if (!listas) return;
      const colonias = estrelas.filter(e => e.colonia);

      const largura = 280;
      const altura = Math.min(40 + colonias.length * 25, canvas.height - 100);
      const x = 200;
      const y = 40;

      ctx.fillStyle = "rgba(0, 30, 60, 0.7)";
      ctx.fillRect(x, y, largura, altura);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, largura, altura);

      ctx.font = "15px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText("COLÔNIAS ATIVAS (" + colonias.length + ":8)", x + 140, y + 25);

      ctx.font = "12px monospace";
      ctx.fillStyle = "#ccc";

      let offset = 50;

      for (let i = 0; i < colonias.length; i++) {
        const estrela = colonias[i];
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(0);

        let valorBase = 1;
        switch (estrela.cor) {
          case "#f88": valorBase = 10; break;
          case "#8f8": valorBase = 5; break;
          case "#ff8": valorBase = 8; break;
        }

        const bonusVida = estrela.vidas > 0 ? 100 : 0;
        const estimativa = valorBase + bonusVida;

        const texto = `${estrela.nome.padEnd(8)} ${estimativa.toFixed(0)}💰  ${distancia}u`;

        if (i === indiceColoniaSelecionada) {
          ctx.fillStyle = "#0055ff";
          ctx.fillRect(x + 5, y + offset - 12, largura - 10, 18);
          ctx.fillStyle = "#fff";
        } else {
          ctx.fillStyle = "#ccc";
        }

        ctx.fillText(texto, x + 140, y + offset);
        offset += 20;
      }

    }


    function desenharPainelEscaneamento() {
      if (!estrelaEscaneada || tempoEscaneamento <= 0) return;

      const largura = 300;
      const altura = 180;
      const x = (canvas.width - largura) / 2;
      const y = 40;

      const dx = estrelaEscaneada.x - camX;
      const dy = estrelaEscaneada.y - camY;
      const dz = estrelaEscaneada.z - camZ;
      const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(0);

      ctx.fillStyle = "rgba(0, 0, 50, 0.7)";
      ctx.fillRect(x, y, largura, altura);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, largura, altura);

      ctx.font = "16px monospace";
      ctx.fillStyle = "#0ff";
      ctx.fillText("ANÁLISE ESTELAR", x + 150, y + 30);

      ctx.font = "13px monospace";
      ctx.fillStyle = "#ccc";
      ctx.fillText(`Nome: ${estrelaEscaneada.nome}`, x + 150, y + 60);
      ctx.fillText(`Cor: ${estrelaEscaneada.cor}`, x + 150, y + 80);
      ctx.fillText(`Tamanho: ${estrelaEscaneada.tamanho.toFixed(1)} u`, x + 150, y + 100);
      ctx.fillText(`Raio real: ${estrelaEscaneada.raioReal.toFixed(0)} km`, x + 150, y + 120);
      ctx.fillText(`Vidas: ${estrelaEscaneada.vidas}`, x + 150, y + 140);
      ctx.fillText(`Distância: ${distancia} u`, x + 150, y + 160);
    }

    function rotate(x, y, z) {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      return { x: x1, y: y1, z: z2 };
    }



    function desenhar() {


      // Calcular posições rotacionadas antes de desenhar
      const estrelasProjetadas = estrelas.map(estrela => {
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);

        return {
          ...estrela,
          rx,
          ry,
          rz
        };
      });

      // Ordenar da mais distante para a mais próxima (maior rz primeiro)
      const ordenadas = estrelasProjetadas.sort((a, b) => b.rz - a.rz);

      // Agora desenha normalmente
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let estrela of ordenadas) {
        if (estrela.rz <= 1 || !isFinite(estrela.rz)) continue;

        const k = fov / estrela.rz;
        if (!isFinite(k)) continue;

        const x = estrela.rx * k + canvas.width / 2;
        const y = estrela.ry * k + canvas.height / 2;
        const r = estrela.raioReal * (fov / estrela.rz);

        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          ctx.beginPath();
          const gradiente = ctx.createRadialGradient(x, y, 0, x, y, r);
          gradiente.addColorStop(0, estrela.cor);
          gradiente.addColorStop(1, "transparent");

          ctx.fillStyle = gradiente;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();

          // nome da estrela
          if (mostrarNomes) {
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "#ccc";
            ctx.textAlign = "center";
            ctx.fillText(estrela.nome, x, y - r - 5);
          }

        }

        if (pontoRetorno) {
          const dx = pontoRetorno.x - camX;
          const dy = pontoRetorno.y - camY;
          const dz = pontoRetorno.z - camZ;
          const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);

          if (rz > 1 && isFinite(rz)) {
            const k = fov / rz;
            const x = rx * k + canvas.width / 2;
            const y = ry * k + canvas.height / 2;

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = "#00ff00";
            ctx.fill();
            ctx.font = "12px monospace";
            ctx.fillText("PONTO DE RETORNO", x + 12, y);
          }
        }

      }

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.4;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 8;

      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX + size, centerY);
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX, centerY + size);
      ctx.stroke();

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX + size, centerY);
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX, centerY + size);
      ctx.stroke();

      for (let b of buracosNegrosDisparados) {
        const dx = b.x - camX;
        const dy = b.y - camY;
        const dz = b.z - camZ;

        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);
        if (rz <= 1 || !isFinite(rz)) continue;

        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;
        const r = (b.raio / 80) * (fov / rz);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fill();

        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.stroke();
      }


      if (!isMobile) {
        desenharPainelInfo();
        desenharPainelEscaneamento();
        desenharPainelColonias();
        desenharPainelAlertas();
        desenharPainelVelocidade();
        desenharPainelArmas();
      }

      if (superAglomeradoAtivo) {
        const dx = pontoAglomerado.x - camX;
        const dy = pontoAglomerado.y - camY;
        const dz = pontoAglomerado.z - camZ;
        const { x, y, z } = rotate(dx, dy, dz);
        if (z > 0) {
          const k = fov / z;
          const px = x * k + canvas.width / 2;
          const py = y * k + canvas.height / 2;

          ctx.beginPath();
          ctx.arc(px, py, 30, 0, Math.PI * 2);
          ctx.strokeStyle = "#ff0";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }




      for (let p of particulas) {
        const dx = p.x - camX;
        const dy = p.y - camY;
        const dz = p.z - camZ;
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);

        if (rz <= 1 || !isFinite(rz)) continue;

        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;

        const tamanho = 2;
        ctx.fillStyle = p.cor;
        ctx.fillRect(x - tamanho / 2, y - tamanho / 2, tamanho, tamanho);
      }

      for (let r of raios) {
        const dx = r.x - camX;
        const dy = r.y - camY;
        const dz = r.z - camZ;
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);

        //if (rz <= 1 || !isFinite(rz)) continue;

        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;

        if (r.z == 0 && r.x == 0) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height); // de baixo da tela
          ctx.lineTo(canvas.width / 2, canvas.height / 2);              // até a estrela
          ctx.stroke();

          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(canvas.width, canvas.height); // de baixo da tela
          ctx.lineTo(canvas.width / 2, canvas.height / 2);             // até a estrela
          ctx.stroke();
        } else {

          ctx.strokeStyle = r.cor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height); // de baixo da tela
          ctx.lineTo(x, y);             // até a estrela
          ctx.stroke();

          ctx.strokeStyle = r.cor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(canvas.width, canvas.height); // de baixo da tela
          ctx.lineTo(x, y);             // até a estrela
          ctx.stroke();
        }
      }


      for (let b of buracosNegros) {
        const dx = b.x - camX;
        const dy = b.y - camY;
        const dz = b.z - camZ;
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);
        if (rz <= 1 || !isFinite(rz)) continue;

        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;
        const r = 20 + 5 * Math.sin(b.tempo / 5); // animação pulsante

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "#000");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }


    }

    function obterEstrelaMaisProxima() {
      let maisProxima = null;
      let menorDistancia = Infinity;

      for (let estrela of estrelas) {
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < menorDistancia) {
          menorDistancia = dist;
          maisProxima = estrela;
        }
      }

      return maisProxima;
    }


    function checarEstrelaCentral() {
      const centroX = canvas.width / 2;
      const centroY = canvas.height / 2; let estrelaAlvo = null;
      let menorDistancia = Infinity;

      for (let estrela of estrelas) {
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // ⚠️ se quiser considerar só o que está no centro da tela:
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);
        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;
        const distTela = Math.hypot(x - centroX, y - centroY);

        if (distTela < 10 && rz > 0 && dist < menorDistancia) {
          menorDistancia = dist;
          estrelaAlvo = estrela;
        }
      }

      tocarSom("somExplosaoBase");

      if (estrelaAlvo) {


        function gerarParticulas(x, y, z, cor) {
          for (let i = 0; i < 88; i++) {
            particulas.push({
              x, y, z,
              vx: (Math.random() - 0.5) * 20,
              vy: (Math.random() - 0.5) * 20,
              vz: (Math.random() - 0.5) * 20,
              cor,
              vida: 200
            });
          }
        }

        const { x, y, z } = estrelaAlvo;

        raios.push({
          x, y, z,
          cor: "#ffffff",
          tempo: 15 // frames visíveis
        });

        setTimeout(() => {
          gerarParticulas(x, y, z, estrelaAlvo.cor);
          estrelas = estrelas.filter(e => e !== estrelaAlvo);
          adicionarAlerta("💥 Estrela explodiu:", estrelaAlvo.nome);
        }, 150);
      }
      else {
        raios.push({
          x: 0,
          y: 0,
          z: 0,
          cor: "#ffffff",
          tempo: 6
        });
        //adicionarAlerta("❌ Nenhuma estrela no centro.");
      }
    }

    function checarEstrelaCentralBuracoNegro() {
      const centroX = canvas.width / 2;
      const centroY = canvas.height / 2; let estrelaAlvo = null;
      let menorDistancia = Infinity;

      for (let estrela of estrelas) {
        const dx = estrela.x - camX;
        const dy = estrela.y - camY;
        const dz = estrela.z - camZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // ⚠️ se quiser considerar só o que está no centro da tela:
        const { x: rx, y: ry, z: rz } = rotate(dx, dy, dz);
        const k = fov / rz;
        const x = rx * k + canvas.width / 2;
        const y = ry * k + canvas.height / 2;
        const distTela = Math.hypot(x - centroX, y - centroY);

        if (distTela < 10 && rz > 0 && dist < menorDistancia) {
          menorDistancia = dist;
          estrelaAlvo = estrela;
        }


      }

      if (estrelaAlvo) {



        const { x, y, z } = estrelaAlvo;

        const buraco = {
          x: x,
          y: y,
          z: z,
          tempo: 60000
        };
        buracosNegros.push(buraco);

      }
    }

    function loop() {
      update();
      desenhar();
      requestAnimationFrame(loop);
    }

    loop();
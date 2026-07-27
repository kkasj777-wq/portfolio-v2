/* 作品集展示页 · 交互逻辑（含分集导航） */
(function () {
  const DATA = (window.PORTFOLIO && window.PORTFOLIO.works) || [];
  const grid = document.getElementById("grid");
  const filtersEl = document.getElementById("filters");
  const countEl = document.getElementById("worksCount");
  const detail = document.getElementById("detail");
  const detailScroll = document.getElementById("detailScroll");
  const detailClose = document.getElementById("detailClose");

  const CATEGORIES = ["全部", ...Array.from(new Set(DATA.map(w => w.category)))];
  let activeCat = "全部";
  let activeEp = 0;

  // ---------- 滚动入场动画（玻璃卡片淡入上浮） ----------
  const revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
    : null;

  // ---------- 颜色工具：色相偏移，让每一集都略有不同 ----------
  function hexToHsl(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    let r = parseInt(hex.slice(0, 2), 16) / 255,
        g = parseInt(hex.slice(2, 4), 16) / 255,
        b = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h, s, l };
  }
  function hslToHex(h, s, l) {
    h = (h % 360 + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const to = v => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return "#" + to(r) + to(g) + to(b);
  }
  function shiftHue(hex, deg) {
    const { h, s, l } = hexToHsl(hex);
    return hslToHex(h + deg, s, l);
  }
  function coverOf(w) {
    if (w.frames && w.frames[0]) return w.frames[0];
    if (w.episodes && w.episodes[0] && w.episodes[0].frames[0]) return w.episodes[0].frames[0];
    return (w.images && w.images[0]) || "";
  }

  // ---------- 首屏文案（动态计数） ----------
  const heroSub = document.getElementById("heroSub");
  const heroStat = document.getElementById("heroStat");
  if (heroSub) {
    const n = DATA.length;
    const epi = DATA.reduce((a, w) => a + (w.episodes ? w.episodes.length : 0), 0);
    const cats = new Set(DATA.map(w => w.category)).size;
    heroSub.textContent = `剧情 · 纪录 · 非遗 · 动画 · 摄影 · 商业实战 — ${n} 件作品，${epi} 个分集，每一件都有属于自己的颜色。`;
    if (heroStat) {
      heroStat.innerHTML = `
        <div class="hero-stat-item"><b>${n}</b><span>作品</span></div>
        <div class="hero-stat-item"><b>${epi}</b><span>分集</span></div>
        <div class="hero-stat-item"><b>${cats}</b><span>分类</span></div>`;
    }
  }

  // ---------- 鼠标拖拽横向滚动（分集轨道） ----------
  function enableDragScroll(container) {
    if (!container) return;
    let isDown = false, startX, scrollLeft, moved = false;
    container.style.cursor = "grab";
    container.addEventListener("mousedown", e => {
      isDown = true; moved = false;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });
    container.addEventListener("mouseleave", () => { isDown = false; container.style.cursor = "grab"; });
    container.addEventListener("mouseup", () => { isDown = false; container.style.cursor = "grab"; });
    container.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.2;
      if (Math.abs(walk) > 4) moved = true;
      container.scrollLeft = scrollLeft - walk;
    });
    container.addEventListener("click", e => {
      if (moved) { e.stopPropagation(); }
    }, true);
  }

  // ---------- 筛选条 ----------
  function buildFilters() {
    CATEGORIES.forEach(cat => {
      const b = document.createElement("button");
      b.className = "chip" + (cat === "全部" ? " active" : "");
      b.textContent = cat;
      b.dataset.cat = cat;
      b.addEventListener("click", () => {
        activeCat = cat;
        document.querySelectorAll(".chip").forEach(ch => ch.classList.toggle("active", ch.dataset.cat === cat));
        renderGrid();
      });
      filtersEl.appendChild(b);
    });
  }

  function mountImg(img, src, cls) {
    img.src = src;
    img.className = cls || "";
    img.loading = "lazy";
    img.onload = () => img.classList.add("loaded");
    img.onerror = () => { img.style.display = "none"; };
  }

  // ---------- 作品网格 ----------
  function renderGrid() {
    grid.innerHTML = "";
    const list = DATA.filter(w => activeCat === "全部" || w.category === activeCat);
    countEl.textContent = `共 ${list.length} 件作品`;
    list.forEach(w => {
      const card = document.createElement("article");
      card.className = "card reveal";
      card.style.setProperty("--c", w.color);
      card.style.setProperty("--c2", w.color2);
      const cover = coverOf(w);
      const img = document.createElement("img");
      img.alt = w.title;
      if (cover) mountImg(img, cover, "card-img");
      const epiTag = (w.episodes && w.episodes.length) ? `<span class="card-epi">${w.episodes.length} 集</span>` : "";
      card.innerHTML = `
        <span class="card-scrim"></span>
        <span class="card-cat">${w.category}</span>
        ${epiTag}
        <div class="card-body">
          <div class="card-title">${w.title}</div>
          <div class="card-sub">${w.sub}</div>
        </div>
        <span class="card-accent"></span>`;
      if (cover) card.insertBefore(img, card.firstChild);
      card.addEventListener("click", () => openDetail(w));
      grid.appendChild(card);
      if (revealObserver) revealObserver.observe(card);
      else card.classList.add("in");
    });
  }

  // ---------- 详情浮层 ----------
  function openDetail(w) {
    detail.style.setProperty("--c", w.color);
    detail.style.setProperty("--c2", w.color2);
    const tags = [w.category, w.sub, w.year, w.role].filter(Boolean);
    const isEpi = Array.isArray(w.episodes) && w.episodes.length > 0;
    const heroCover = coverOf(w);
    const heroHTML = heroCover
      ? `<div class="dt-hero"><img src="${heroCover}" alt=""><div class="dt-hero-in">`
      : `<div class="dt-hero"><div class="dt-hero-in">`;

    let bodyHTML = `
      <div class="dt-body">
        <p class="dt-desc">${w.desc}</p>
        <div class="dt-tags">${tags.map(t => `<span class="dt-tag">${t}</span>`).join("")}</div>`;

    if (isEpi) {
      const rail = w.episodes.map((e, i) => `
        <button class="ep-chip" data-ep="${i}" style="--ec:${shiftHue(w.color, i * 14)}">
          ${e.frames[0] ? `<img src="${e.frames[0]}" alt="" onerror="this.style.display='none'">` : ""}
          <span class="ep-num">${e.title}</span>
        </button>`).join("");
      bodyHTML += `
        <div class="dt-section-h">分集浏览 · 共 ${w.episodes.length} 集</div>
        <div class="ep-rail">${rail}</div>
        <div id="epView"></div>`;
    } else {
      const gallery = (w.kind === "video" ? w.frames : w.images);
      const captions = w.image_captions || [];
      const galleryHTML = gallery.length
        ? `<div class="dt-gallery">${gallery.map((src, i) => {
            const cap = captions[i] ? `<figcaption>${captions[i]}</figcaption>` : "";
            return `<figure>${cap}<img src="${src}" alt="${w.title}" loading="lazy"></figure>`;
          }).join("")}</div>`
        : `<p class="dt-empty">（该作品的画面素材待补充，可在后续放入剧照 / 海报。）</p>`;
      bodyHTML += `
        <div class="dt-section-h">${w.kind === "video" ? "画面截帧" : "作品图集"} · ${gallery.length} 张</div>
        ${galleryHTML}`;
    }
    bodyHTML += `</div>`;

    detailScroll.innerHTML = `
      ${heroHTML}
        <span class="dt-cat">${w.category}</span>
        <h1 class="dt-title">${w.title}</h1>
        <div class="dt-meta">
          <span><b>类型</b> ${w.sub}</span>
          <span><b>年份</b> ${w.year}</span>
          <span><b>担任</b> ${w.role}</span>
        </div>
      </div></div>
      ${bodyHTML}`;

    if (isEpi) {
      activeEp = 0;
      const rail = detailScroll.querySelector(".ep-rail");
      enableDragScroll(rail);
      detailScroll.querySelectorAll(".ep-chip").forEach(ch => {
        ch.addEventListener("click", () => { activeEp = +ch.dataset.ep; renderEpisode(w); });
      });
      renderEpisode(w);
    }

    detail.classList.add("open");
    detail.setAttribute("aria-hidden", "false");
    detailScroll.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  function renderEpisode(w) {
    const e = w.episodes[activeEp];
    const ec = shiftHue(w.color, activeEp * 14);
    const epView = detailScroll.querySelector("#epView");
    const name = e.title.replace(/^第\d+集\s*/, "");
    const g = e.frames.length
      ? `<div class="dt-gallery">${e.frames.map(src =>
          `<figure><img src="${src}" alt="${e.title}" loading="lazy"></figure>`).join("")}</div>`
      : `<p class="dt-empty">本集画面待补充。</p>`;
    epView.innerHTML = `
      <div class="ep-head" style="--ec:${ec}">
        <span class="ep-badge">第${e.ep}集</span>
        <span class="ep-name">${name || e.title}</span>
        <span class="ep-count">${e.frames.length} 张</span>
      </div>
      ${g}`;
    detailScroll.querySelectorAll(".ep-chip").forEach(ch =>
      ch.classList.toggle("active", +ch.dataset.ep === activeEp));
  }

  function closeDetail() {
    detail.classList.remove("open");
    detail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  detailClose.addEventListener("click", closeDetail);
  detail.addEventListener("click", e => { if (e.target === detail) closeDetail(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetail(); });

  // ---------- 启动 ----------
  if (!DATA.length) {
    grid.innerHTML = `<p class="dt-empty">作品数据未加载（assets/works.js）。请先运行构建脚本生成数据。</p>`;
  } else {
    buildFilters();
    renderGrid();
  }
})();
